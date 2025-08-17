# FuelBoss - Fuel Station Management System

A full-stack fuel station management application with React frontend and Express.js backend.

## Project Structure

- `client/` - React frontend (Vite)
- `server/` - Express.js backend with PostgreSQL database
- `shared/` - Shared types and schemas

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Google OAuth credentials (for authentication)

## Setup Instructions

### 1. Database Setup

1. Create a PostgreSQL database named `fuelboss`
2. Update the `DATABASE_URL` in `server/.env`

### 2. Server Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file:
   ```bash
   cp env.example .env
   ```

4. Update `server/.env` with your actual values:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `SESSION_SECRET` - A random secret for session encryption
   - `GOOGLE_CLIENT_ID` - Your Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET` - Your Google OAuth client secret
   - `GOOGLE_CALLBACK_URL` - Should be `http://localhost:5000/api/auth/google/callback`

5. Push the database schema:
   ```bash
   npm run db:push
   ```

6. Start the server:
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:5000`

### 3. Client Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file:
   ```bash
   cp env.example .env.local
   ```

4. Update `client/.env.local`:
   - `VITE_API_URL=http://localhost:5000`

5. Start the client:
   ```bash
   npm run dev
   ```

The client will run on `http://localhost:5173`

## Running Both Applications

### Terminal 1 - Server
```bash
cd server
npm run dev
```

### Terminal 2 - Client
```bash
cd client
npm run dev
```

## Features

- **Authentication**: Google OAuth for dealers/owners
- **User Management**: Staff management with role-based access
- **Product Management**: Fuel products with pricing
- **Tank Management**: Fuel tank inventory tracking
- **Shift Management**: Work shift tracking and sales
- **Reports**: Sales and inventory reports
- **Multi-language**: English, Hindi, and Kannada support

## API Endpoints

- `/api/auth/*` - Authentication endpoints
- `/api/retail-outlet` - Retail outlet management
- `/api/products` - Product management
- `/api/tanks` - Tank management
- `/api/staff` - Staff management
- `/api/shift-sales` - Shift sales tracking
- `/api/health` - Health check

## Development

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + TypeScript + Drizzle ORM
- **Database**: PostgreSQL
- **Authentication**: Passport.js with Google OAuth
- **State Management**: TanStack Query (React Query)
- **Internationalization**: react-i18next

## Troubleshooting

### CORS Issues
- Ensure the server is running on port 5000
- Check that `CLIENT_ORIGIN` is set correctly in server `.env`
- Verify the client is using the correct `VITE_API_URL`

### Database Connection Issues
- Verify PostgreSQL is running
- Check `DATABASE_URL` format: `postgresql://username:password@localhost:5432/fuelboss`
- Ensure the database exists

### Authentication Issues
- Verify Google OAuth credentials are correct
- Check that `GOOGLE_CALLBACK_URL` matches your Google OAuth app settings
- Ensure session cookies are being sent (check browser dev tools)
