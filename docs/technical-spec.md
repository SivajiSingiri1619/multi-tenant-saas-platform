# Technical Specification
## 1. Project Structure

The project follows a modular structure to separate concerns and improve maintainability.

multi-tenant-saas-platform/
├── backend/ # Backend API service
│ ├── src/
│ │ ├── controllers/ # Request handlers
│ │ ├── routes/ # API route definitions
│ │ ├── middleware/ # Auth, RBAC, tenant isolation
│ │ ├── models/ # Database models
│ │ ├── config/ # Database & app configuration
│ │ └── utils/ # Utility functions (JWT, logger)
│ ├── migrations/ # Database migration files
│ ├── seeds/ # Database seed data
│ ├── Dockerfile # Backend Docker configuration
│ └── package.json
│
├── frontend/ # React frontend application
│ ├── src/
│ │ ├── pages/ # Application pages
│ │ ├── components/ # Reusable UI components
│ │ ├── services/ # API service layer
│ │ └── context/ # Auth & global state
│ ├── Dockerfile # Frontend Docker configuration
│ └── package.json
│
├── docs/ # Project documentation
│ ├── research.md
│ ├── PRD.md
│ ├── architecture.md
│ ├── technical-spec.md
│ └── images/
│
├── docker-compose.yml # Docker Compose orchestration
├── submission.json # Test credentials for evaluation
└── README.md # Project overview and setup guide

## 2. Development Setup Guide

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Docker and Docker Compose
- Git

### Backend Setup

1. Navigate to the backend directory:
2. Install dependencies:
3. Configure environment variables (see Environment Variables section).
4. Start the backend server:


The backend server runs on port 5000.

### Frontend Setup
1. Navigate to the frontend directory:
2. Install dependencies:
3. Start the development server:

The frontend application runs on port 3000.

## 3. Environment Variables

The application uses environment variables for configuration.

### Backend Environment Variables

- DB_HOST: Database host name
- DB_PORT: Database port (5432)
- DB_NAME: Database name
- DB_USER: Database username
- DB_PASSWORD: Database password
- JWT_SECRET: Secret key for JWT signing
- JWT_EXPIRES_IN: Token expiry duration
- PORT: Backend server port (5000)
- FRONTEND_URL: Allowed frontend URL for CORS

### Frontend Environment Variables

- REACT_APP_API_URL: Base URL of backend API

## 4. Docker Setup

The application is fully containerized using Docker and Docker Compose. All services can be started with a single command.

### Running the Application with Docker

From the project root directory:


This command starts:
- PostgreSQL database service
- Backend API service
- Frontend application service

After startup:
- Frontend is available at http://localhost:3000
- Backend API is available at http://localhost:5000
- Health check endpoint is available at http://localhost:5000/api/health

Database migrations and seed data are automatically executed during backend startup.

