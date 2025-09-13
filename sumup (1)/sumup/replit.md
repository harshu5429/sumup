# Overview

SaveUp is a gamified savings and investment web application designed to help young people build financial discipline through engaging, game-like features. The app focuses on automated micro-savings through transaction round-ups, social gamification with leaderboards and badges, and UPI payment integration. It combines traditional banking functionality with modern gamification mechanics to make saving money fun and accessible for younger audiences.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Single Page Application**: Built with vanilla HTML5, CSS3, and modern JavaScript (ES6+) using class-based architecture
- **Mobile-First Design**: Responsive design optimized for mobile banking experiences using CSS Grid and Flexbox
- **Component-Based Structure**: Modular JavaScript classes with event-driven interactions and real-time DOM updates
- **Theme System**: Built-in dark/light mode toggle with CSS custom properties for consistent theming
- **Screen-Based Navigation**: Single-page app with screen transitions and authentication flow

## Backend Architecture
- **Node.js HTTP Server**: Custom lightweight server serving static files and RESTful API endpoints
- **Dual-Mode Storage**: Memory-based fallback system with PostgreSQL readiness for production
- **API Layer**: Complete CRUD operations for users, transactions, challenges, activities, and badges
- **Security Features**: CORS support, content security headers, and path validation for Replit environment
- **Microservices Approach**: Modular API design with separation of concerns

## Database Design
- **PostgreSQL with Neon**: Primary relational database using serverless PostgreSQL
- **Drizzle ORM**: Type-safe database operations and schema management
- **Schema Structure**: 
  - Users table for profiles, savings totals, streaks, and authentication
  - Transactions table for payment records, round-ups, and UPI details  
  - Challenges table for savings goals and progress tracking
  - Activities table for gamification events
  - User badges table for achievement system

## Key Design Patterns
- **State Management**: Centralized app state in JavaScript class constructors
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Real-time Processing**: Transaction round-up calculations and savings automation
- **Gamification Engine**: Streak tracking, badge systems, and social leaderboards

# External Dependencies

## Frontend Libraries
- **Html5Qrcode**: Camera-based QR code scanning for UPI payments
- **QRCode.js**: QR code generation for payment requests
- **Font Awesome**: Icon library for UI elements
- **Google Fonts (Inter)**: Modern typography system

## Backend Dependencies  
- **@neondatabase/serverless**: Serverless PostgreSQL connection pooling
- **drizzle-orm**: Type-safe ORM for database operations
- **drizzle-kit**: Database schema management and migrations
- **ws**: WebSocket library for real-time features

## Third-Party Integrations
- **Neon Database**: Serverless PostgreSQL hosting platform
- **UPI System**: Payment integration for transaction processing (planned)
- **Camera API**: Device camera access for QR code scanning
- **WebSocket**: Real-time communication support

## Development Tools
- **ES Modules**: Modern JavaScript module system
- **Drizzle Kit CLI**: Database schema generation and migration tools
- **Node.js HTTP Module**: Native server implementation without external frameworks