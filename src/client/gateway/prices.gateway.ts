import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SymbolsService } from '../../symbols/symbols.service';
import { UsersService } from '../../users/users.service';

interface ClientConnection {
  socket: Socket;
  userId: string;
  subscribedSymbols: Set<string>;
}

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  namespace: '/prices',
})
@Injectable()
export class PricesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PricesGateway.name);
  private clients: Map<string, ClientConnection> = new Map();
  private priceIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private symbolsService: SymbolsService,
    private usersService: UsersService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = this.extractTokenFromSocket(client);
      if (!token) {
        this.logger.warn('No token provided for socket connection');
        client.emit('error', { message: 'Authentication failed: No token provided' });
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user || user.role !== 'client') {
        throw new UnauthorizedException('Invalid user or role');
      }

      this.clients.set(client.id, {
        socket: client,
        userId: user.id,
        subscribedSymbols: new Set(),
      });

      this.logger.log(`Client connected: ${user.email} (${client.id})`);
      client.emit('connected', { message: 'Connected successfully' });
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const clientConnection = this.clients.get(client.id);
    if (clientConnection) {
      this.logger.log(`Client disconnected: ${client.id}`);
      // Clear intervals for this client
      clientConnection.subscribedSymbols.forEach((symbolName) => {
        this.stopPriceUpdates(client.id, symbolName);
      });
      this.clients.delete(client.id);
    }
  }

  @SubscribeMessage('subscribe')
  async handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { symbols: string[] },
  ) {
    const clientConnection = this.clients.get(client.id);
    if (!clientConnection) {
      return { error: 'Not authenticated' };
    }

    if (!data.symbols || !Array.isArray(data.symbols)) {
      return { error: 'Invalid symbols array' };
    }

    // Verify symbols exist and are public
    const publicSymbols = await this.symbolsService.findPublic();
    const publicSymbolNames = publicSymbols.map((s) => s.name);

    for (const symbolName of data.symbols) {
      if (publicSymbolNames.includes(symbolName)) {
        clientConnection.subscribedSymbols.add(symbolName);
        this.startPriceUpdates(client.id, symbolName);
      }
    }

    return {
      message: 'Subscribed successfully',
      subscribedSymbols: Array.from(clientConnection.subscribedSymbols),
    };
  }

  @SubscribeMessage('unsubscribe')
  async handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { symbols: string[] },
  ) {
    const clientConnection = this.clients.get(client.id);
    if (!clientConnection) {
      return { error: 'Not authenticated' };
    }

    if (!data.symbols || !Array.isArray(data.symbols)) {
      return { error: 'Invalid symbols array' };
    }

    for (const symbolName of data.symbols) {
      clientConnection.subscribedSymbols.delete(symbolName);
      this.stopPriceUpdates(client.id, symbolName);
    }

    return {
      message: 'Unsubscribed successfully',
      subscribedSymbols: Array.from(clientConnection.subscribedSymbols),
    };
  }

  private extractTokenFromSocket(client: Socket): string | null {
    // Try to get token from:
    // 1. Handshake auth
    // 2. Authorization header
    // 3. Cookies
    const authToken = client.handshake.auth?.token;
    const headerToken = client.handshake.headers?.authorization?.replace('Bearer ', '');
    const cookieToken = client.handshake.headers?.cookie
      ?.split(';')
      .find((c) => c.trim().startsWith('access_token='))
      ?.split('=')[1]
      ?.trim();

    return authToken || headerToken || cookieToken || null;
  }

  private startPriceUpdates(clientId: string, symbolName: string) {
    const intervalKey = `${clientId}-${symbolName}`;
    
    // Don't start if already running
    if (this.priceIntervals.has(intervalKey)) {
      return;
    }

    const interval = setInterval(async () => {
      const clientConnection = this.clients.get(clientId);
      if (!clientConnection || !clientConnection.subscribedSymbols.has(symbolName)) {
        this.stopPriceUpdates(clientId, symbolName);
        return;
      }

      // Get current symbol price
      const publicSymbols = await this.symbolsService.findPublic();
      const symbol = publicSymbols.find((s) => s.name === symbolName);
      
      if (symbol) {
        // Generate random price variation (±5%)
        const variation = (Math.random() - 0.5) * 0.1; // -5% to +5%
        const newPrice = Number(symbol.price) * (1 + variation);
        
        clientConnection.socket.emit('price-update', {
          symbol: symbolName,
          price: parseFloat(newPrice.toFixed(2)),
          timestamp: new Date().toISOString(),
        });
      }
    }, 1000); // Every second

    this.priceIntervals.set(intervalKey, interval);
  }

  private stopPriceUpdates(clientId: string, symbolName: string) {
    const intervalKey = `${clientId}-${symbolName}`;
    const interval = this.priceIntervals.get(intervalKey);
    if (interval) {
      clearInterval(interval);
      this.priceIntervals.delete(intervalKey);
    }
  }

  async disconnectClient(userId: string): Promise<boolean> {
    let disconnected = false;
    for (const [clientId, connection] of this.clients.entries()) {
      if (connection.userId === userId) {
        // Clear all intervals
        connection.subscribedSymbols.forEach((symbolName) => {
          this.stopPriceUpdates(clientId, symbolName);
        });
        connection.socket.disconnect();
        this.clients.delete(clientId);
        disconnected = true;
        this.logger.log(`Admin disconnected client: ${userId}`);
      }
    }
    return disconnected;
  }
}

