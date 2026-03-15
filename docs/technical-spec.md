# Technical Specification

## Multi-Tenant SaaS Platform -- Project & Task Management System

------------------------------------------------------------------------

## 1. Project Structure

This section describes the overall folder structure of the backend and
frontend applications and the responsibility of each major folder.

------------------------------------------------------------------------

### 1.1 Backend Structure

``` text
backend/
├── src/
│   ├── controllers/      # Handle HTTP requests and responses
│   ├── services/         # Business logic and validation rules
│   ├── repositories/     # Database access using Prisma
│   ├── routes/           # API route definitions
│   ├── middleware/       # Authentication, RBAC, tenant isolation
│   ├── utils/            # Helper utilities (audit logging, validators)
│   ├── config/           # Environment, database, and app configuration
│   └── app.js            # Express application entry point
├── prisma/
│   ├── schema.prisma     # Prisma database schema
│   ├── migrations/      # Database migration files
│   └── seed.js           # Database seed script
├── Dockerfile            # Backend Docker configuration
└── package.json          # Backend dependencies and scripts
```

------------------------------------------------------------------------

### 1.2 Frontend Structure

``` text
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page-level components
│   ├── routes/           # Public and protected routes
│   ├── services/         # API communication layer
│   ├── context/          # Authentication and global state
│   ├── utils/            # Helper functions
│   └── main.jsx          # Frontend entry point
├── Dockerfile            # Frontend Docker configuration
└── package.json          # Frontend dependencies and scripts
```

------------------------------------------------------------------------

## 2. Development Setup Guide

This section explains how developers can set up and run the application
locally.

------------------------------------------------------------------------

### 2.1 Prerequisites

The following tools must be installed before running the project:

-   Node.js (version 18 or higher)
-   Docker
-   Docker Compose
-   Git

------------------------------------------------------------------------

## 3. Environment Variables

All configuration values are managed using environment variables to
ensure security and flexibility.

------------------------------------------------------------------------

### 3.1 Backend Environment Variables

-   `DB_HOST` -- Database host
-   `DB_PORT` -- Database port
-   `DB_NAME` -- Database name
-   `DB_USER` -- Database username
-   `DB_PASSWORD` -- Database password
-   `JWT_SECRET` -- Secret key for signing JWT tokens
-   `JWT_EXPIRES_IN` -- JWT token expiration duration
-   `FRONTEND_URL` -- Frontend URL for CORS configuration
-   `PORT` -- Backend server port

------------------------------------------------------------------------

### 3.2 Frontend Environment Variables

-   `REACT_APP_API_URL` -- Base URL of the backend API

All required environment variables are provided through Docker Compose
or committed `.env` files for evaluation purposes.

------------------------------------------------------------------------

## 4. Running the Application Locally

The recommended way to run the application locally is using Docker.

------------------------------------------------------------------------

### 4.1 Run Using Docker Compose

``` bash
docker-compose up -d
```

This command performs the following actions automatically:

-   Starts the PostgreSQL database container
-   Starts the backend API server
-   Runs database migrations automatically
-   Seeds the database with initial data
-   Starts the frontend application
-   Exposes the frontend at http://localhost:3000

------------------------------------------------------------------------

## 5. Testing

-   Backend APIs can be tested using Postman or curl.
-   Health check endpoint: `GET /api/health`
-   Frontend functionality can be verified using a web browser.

------------------------------------------------------------------------

## 6. Deployment Overview

For production deployment:

-   Frontend is deployed on Vercel
-   Backend is deployed on Render
-   Database is hosted on a managed PostgreSQL service
-   Docker is used for local development and evaluation to ensure consistent and reproducible environments.
