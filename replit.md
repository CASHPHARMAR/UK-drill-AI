# UK Drill Audio Converter

## Overview

This is a full-stack audio conversion application that transforms regular audio files (MP3, WAV, M4A) into UK Drill-style music with different intensity levels. The application features a modern React frontend with a dark-themed UI, real-time processing progress tracking, audio visualization components, and an Express.js backend that handles file uploads and conversion processing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **UI Library**: Shadcn/ui components built on Radix UI primitives for consistent, accessible interface elements
- **Styling**: Tailwind CSS with a dark theme and custom color palette focused on purple/violet primary colors
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **File Handling**: React Dropzone for drag-and-drop file uploads with validation
- **Audio Processing**: Web Audio API for waveform generation and audio analysis
- **3D Graphics**: Dynamic Three.js integration for background visual effects

### Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **File Upload**: Multer middleware for handling multipart file uploads with size and type validation
- **Storage**: In-memory storage implementation using Map data structures for development (designed to be easily replaced with database storage)
- **API Design**: RESTful endpoints for file upload, conversion status tracking, and job management
- **Development Server**: Vite integration for hot module replacement in development mode

### Data Storage Solutions
- **Database ORM**: Drizzle ORM configured for PostgreSQL with schema definitions for conversion jobs
- **Session Storage**: PostgreSQL session store with connect-pg-simple for production deployments
- **File Storage**: Local filesystem storage in uploads directory with automatic cleanup
- **Migration System**: Drizzle Kit for database schema migrations and management

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL backing store
- **File Validation**: Server-side validation for file types (MP3, WAV, M4A) and size limits (50MB)
- **CORS**: Configured for cross-origin requests with credentials support

### External Dependencies
- **Database**: PostgreSQL with Neon serverless driver for cloud deployment
- **Audio Processing**: Planned integration with audio processing libraries for UK Drill conversion
- **UI Components**: Radix UI ecosystem for accessible, unstyled components
- **Development Tools**: Replit-specific plugins for development environment integration
- **Build Tools**: ESBuild for server bundling, Vite for client bundling
- **Form Handling**: React Hook Form with Zod schema validation
- **Type Safety**: Full TypeScript implementation across frontend, backend, and shared schemas

The application uses a shared schema approach with Drizzle-Zod for type-safe data validation between client and server. The conversion system tracks jobs through multiple states (pending, processing, completed, failed) with real-time progress updates. The frontend features an immersive dark theme with animated backgrounds, waveform visualizations, and intuitive file upload interfaces.