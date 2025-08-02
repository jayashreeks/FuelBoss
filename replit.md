# Overview

FuelFlow is a comprehensive petrol pump management system built as a mobile-first web application. The application enables petrol pump owners and managers to efficiently track fuel inventory, manage staff, record sales data, and generate reports. The system provides a complete solution for day-to-day operations of fuel retail outlets with multi-language support (English and Hindi) and role-based access control.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React SPA**: Built with React 18 using TypeScript and Vite for fast development and build processes
- **UI Framework**: Utilizes shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Mobile-First Design**: Responsive design optimized for mobile devices with bottom navigation and touch-friendly interfaces
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Internationalization**: React-i18next for multi-language support (English/Hindi)
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

## Backend Architecture
- **Node.js/Express**: RESTful API server built with Express.js using ES modules
- **Authentication**: Replit Auth integration with OpenID Connect for secure user authentication
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **API Design**: RESTful endpoints with proper error handling and logging middleware
- **Database Layer**: Storage abstraction pattern with interface-based design for maintainability

## Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless driver for cloud-native scaling
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Schema Design**: Normalized relational design with proper foreign key relationships
- **Migration System**: Drizzle Kit for database schema migrations and version control
- **Session Storage**: PostgreSQL-backed session storage for authentication persistence

## Authentication and Authorization
- **Identity Provider**: Replit Auth with OpenID Connect protocol
- **Session Security**: Secure HTTP-only cookies with CSRF protection
- **Role-Based Access**: Owner, manager, and operator roles with different permission levels
- **User Management**: Automatic user creation and profile management from auth provider

## External Dependencies
- **Database Hosting**: Neon serverless PostgreSQL for cloud database hosting
- **Authentication Service**: Replit Auth for user identity and session management
- **UI Components**: Radix UI for accessible component primitives
- **Styling**: Tailwind CSS for utility-first styling approach
- **Development Tools**: Vite for fast development server and build optimization
- **Production Deployment**: Replit hosting platform with built-in SSL and domain management

## Key Design Patterns
- **Repository Pattern**: Storage interface abstraction for database operations
- **Component Composition**: Reusable UI components with prop-based customization
- **Server State Caching**: TanStack Query for optimistic updates and background synchronization
- **Type Safety**: End-to-end TypeScript with shared schema definitions
- **Error Boundary**: Graceful error handling with user-friendly error messages
- **Progressive Enhancement**: Mobile-first design with desktop enhancements