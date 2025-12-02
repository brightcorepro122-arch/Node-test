# Node-test

NestJS backend application with Socket.IO, TypeORM, PostgreSQL, and Docker.

## Features

- ✅ NestJS framework
- ✅ Socket.IO for real-time communication
- ✅ Swagger API documentation
- ✅ TypeORM with PostgreSQL
- ✅ Docker & Docker Compose setup
- ✅ JWT authentication with access and refresh tokens (stored in cookies)
- ✅ Role-based authorization (Admin, Client)
- ✅ Admin module for client management
- ✅ Symbol CRUD operations with pagination
- ✅ Real-time price updates via WebSocket

## Prerequisites

- Node.js 20+
- Docker and Docker Compose
- PostgreSQL (via Docker)

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the root directory (you can copy from `.env.example`):

```env
# Application
NODE_ENV=development
APP_PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=node_test

# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Default Admin (for seeding)
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=admin123
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run with Docker Compose

```bash
docker-compose up -d
```

This will:
- Start PostgreSQL database
- Build and start the NestJS application
- Automatically create the default admin user on first run

### 4. Run Locally (without Docker)

If you prefer to run locally:

```bash
# Start PostgreSQL (or use your existing instance)
# Update .env with your database credentials

# Install dependencies
npm install

# Run the application
npm run start:dev
```

The application will be available at `http://localhost:3000`

## API Documentation

Once the application is running, access Swagger documentation at:
- http://localhost:3000/api

## Default Admin Credentials

- Email: `admin@example.com` (or as set in `.env`)
- Password: `admin123` (or as set in `.env`)

## API Endpoints

### Authentication (`/auth`)
- `POST /auth/login` - Login and receive JWT tokens in cookies
- `PUT /auth/logout` - Logout and clear cookies
- `PUT /auth/refresh` - Refresh access token using refresh token from cookie

### Admin (`/admin`) - Requires Admin role
- `POST /admin/create` - Create a new client
- `PUT /admin/disable-socket/:clientId` - Disconnect client's socket connection
- `DELETE /admin/remove/:clientId` - Remove a client

### Symbols (`/symbols`) - Requires Admin role
- `POST /symbols` - Create a new symbol
- `POST /symbols/all` - Get all symbols with pagination
- `GET /symbols/:id` - Get symbol by ID
- `PUT /symbols/:id` - Update symbol
- `DELETE /symbols/:id` - Delete symbol

### Client (`/client`) - Requires Client role
- `GET /client/me` - Get current client information
- `GET /client/symbols` - Get available public symbols

## Socket.IO Gateway

### Connection

Connect to the WebSocket gateway at: `ws://localhost:3000/prices`

**Authentication**: Include JWT access token in one of the following ways:
- Cookie: `access_token` (automatically sent if logged in via browser)
- Authorization header: `Bearer <token>`
- Handshake auth: `{ token: '<access_token>' }`

### Events

#### Client → Server

- `subscribe` - Subscribe to symbol price updates
  ```json
  {
    "symbols": ["BTC/USD", "ETH/USD"]
  }
  ```

- `unsubscribe` - Unsubscribe from symbol price updates
  ```json
  {
    "symbols": ["BTC/USD"]
  }
  ```

#### Server → Client

- `connected` - Connection successful
- `price-update` - Real-time price update (sent every second for subscribed symbols)
  ```json
  {
    "symbol": "BTC/USD",
    "price": 50000.50,
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
  ```
- `error` - Error message

## Project Structure

```
src/
├── auth/              # Authentication module (JWT, login, logout, refresh)
├── users/             # User entity and service
├── admin/             # Admin module (client management)
├── symbols/           # Symbol CRUD operations
├── client/            # Client module and Socket.IO gateway
├── common/            # Guards, interceptors, decorators
├── database/          # Database configuration and seeds
└── main.ts            # Application entry point
```

## Development

```bash
# Development mode with watch
npm run start:dev

# Build for production
npm run build

# Run production build
npm run start:prod

# Run database seeds manually
npm run seed:run
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Notes

- JWT tokens are stored in HTTP-only cookies for security
- Socket.IO connections are authenticated using JWT tokens
- Price updates are generated randomly (±5% variation) every second
- Database seeds run automatically on application startup
- TypeORM synchronize is enabled in development mode only
