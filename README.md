# Spine Project

A full-stack note management application built with **Node.js, Express, PostgreSQL, Prisma, and vanilla JavaScript**.

The application provides user authentication, protected API routes, persistent server-side notes, and client-side note storage. It demonstrates backend development concepts including JWT authentication, refresh token handling, database relationships, middleware security, and API design.

---

# Demo

## User Registration & Duplicate Account Protection

Users can register accounts, and duplicate usernames are rejected to prevent account conflicts.

![Registration Demo](./docs/register.gif)

---

## Authentication & Notes Management

Authenticated users can create, edit, delete, clear, and paginate server-side notes.

The application also supports client-side note storage using browser local storage.

![Notes Demo](./docs/main.gif)

---

## Input Validation

User input is validated before storage. Notes exceeding the allowed length are automatically trimmed before being sent to the server.

![Validation Demo](./docs/inputvalidation.gif)

---

# Features

## Authentication

* User registration
* Secure password hashing using bcrypt
* JWT access token authentication
* Refresh token based session renewal
* Protected API routes
* Logout functionality
* User-specific data isolation

---

## Notes Management

* Create notes
* Edit existing notes
* Delete individual notes
* Delete all server-side notes
* Persistent PostgreSQL storage
* Pagination for server-side notes
* User ownership validation

---

## Client-side Functionality

* Local browser note storage using LocalStorage
* Session-based authentication state management
* Dynamic UI updates
* Fetch-based API communication
* Client-side input handling

---

# Security Features

The project includes several security measures:

* Password hashing with bcrypt
* JWT-based authentication
* Refresh token rotation
* HTTP security headers using Helmet
* CSRF protection for state-changing requests
* Login rate limiting
* Secure cookie configuration
* Environment variable configuration for secrets
* Protected database queries using authenticated user IDs

---

# Technology Stack

## Backend

* Node.js
* Express.js
* Prisma ORM
* PostgreSQL
* JWT
* bcrypt
* Helmet
* Express Rate Limit

## Frontend

* HTML
* CSS
* Vanilla JavaScript
* ES Modules
* Fetch API

## Database

PostgreSQL with Prisma migrations.

Database models include:

### User

Stores user account information.

Fields:

* `id`
* `username`
* `password` (hashed)

---

### Note

Stores user-created notes.

Fields:

* `id`
* `text`
* `createdAt`
* `userId`

---

### RefreshToken

Stores active refresh tokens for session management.

Fields:

* `id`
* `token`
* `userId`
* `createdAt`

---

# Application Architecture

```
Client Browser
      |
      |
      v
Express Server
      |
      |
      +----------------+
      |                |
      v                v
Authentication     Notes API
Middleware         Routes
      |                |
      |                |
      +-------+--------+
              |
              v
        Prisma ORM
              |
              v
        PostgreSQL Database
```

---

# Project Structure

```
SpineProject/

├── auth/
│   ├── login.js
│   ├── register.js
│   └── csrfRoute.js
│
├── middleware/
│   ├── authenticate.js
│   ├── csrf.js
│   └── rateLimiter.js
│
├── services/
│   └── authService.js
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── public/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── styles.css
│   └── scripts/
│
├── server.js
├── prismaClient.js
└── package.json
```

---

# Running Locally

## Requirements

* Node.js
* PostgreSQL

---

## Installation

Clone the repository:

```bash
git clone <repository-url>
```

Navigate into the project:

```bash
cd SpineProject
```

Install dependencies:

```bash
npm install
```

---

## Environment Configuration

Create a `.env` file in the project root:

```env
DATABASE_URL="your_postgresql_connection_string"

JWT_SECRET="your_access_token_secret"

REFRESH_SECRET="your_refresh_token_secret"
```

---

## Database Setup

Run Prisma migrations:

```bash
npx prisma migrate deploy
```

Generate Prisma Client:

```bash
npx prisma generate
```

---

## Start Application

Run:

```bash
npm start
```

The application will be available at:

```
http://localhost:8080
```

---

# API Overview

## Authentication Routes

| Method | Route            | Description          |
| ------ | ---------------- | -------------------- |
| POST   | `/auth/register` | Create a new user    |
| POST   | `/auth/login`    | Authenticate user    |
| POST   | `/auth/refresh`  | Refresh access token |
| POST   | `/auth/logout`   | End user session     |

---

## Notes Routes

| Method | Route      | Description         |
| ------ | ---------- | ------------------- |
| GET    | `/api`     | Retrieve user notes |
| POST   | `/api`     | Create a note       |
| PATCH  | `/api/:id` | Update a note       |
| DELETE | `/api/:id` | Delete a note       |
| DELETE | `/api`     | Delete all notes    |

---

# Engineering Concepts Demonstrated

This project demonstrates practical full-stack development concepts:

* REST API design
* Authentication flows
* Middleware architecture
* Database relationships
* ORM usage
* Secure session management
* Client/server state handling
* CRUD operations
* Pagination
* Input validation
* Security best practices

---

# Future Improvements

Potential improvements:

* Add automated backend tests
* Add stronger schema validation
* Improve frontend UI/UX
* Add production deployment
* Add user profile management
* Add note searching and filtering
* Convert frontend/backend to TypeScript

---

# Author

# Project Evolution

This project was built incrementally as both a learning project and a portfolio project. Each stage introduced a new engineering concept, gradually transforming a simple Node.js experiment into a full-stack application.

## Version 1 — Node.js Server Fundamentals

The project started as a way to understand how web servers work at a lower level.

The first version used Node.js directly to:

- Create a server
- Handle HTTP requests and responses
- Serve content to the browser
- Understand the request/response lifecycle

This provided a foundation for understanding what frameworks like Express abstract away.

---

## Version 2 — Express.js Application

The server was migrated to Express to introduce a more structured backend architecture.

Added:

- Express routing
- Middleware
- Cleaner request handling
- API endpoint structure

This changed the application from manually handling server logic into a more maintainable web application structure.

---

## Version 3 — Client-side Functionality

The frontend was expanded using vanilla JavaScript.

Added:

- Dynamic UI updates
- Browser interaction
- Client-side state handling
- Local note management

The application began separating responsibilities between:
Frontend
|
|
HTTP API
|
|
Backend


---

## Version 4 — Data Persistence

The application evolved from temporary storage into persistent storage.

Storage progression:

1. In-memory server storage
2. Browser LocalStorage
3. Database persistence

The database layer was experimented with using MongoDB before migrating to PostgreSQL with Prisma.

This introduced:

- Database schemas
- Migrations
- ORM usage
- Persistent relationships between users and data

---

## Version 5 — Authentication

The application was expanded from a single-user tool into a multi-user system.

Added:

- User registration
- Password hashing
- JWT authentication
- Refresh tokens
- Protected API routes
- User-owned notes

This introduced concepts around authentication, authorization, and session management.

---

## Version 6 — Application Improvements

The project continued to evolve through additional features and refactoring.

Added:

- Pagination
- Improved UI
- Middleware separation
- Authentication services
- Cleaner project structure
- Better error handling

---

## Version 7 — Deployment and Security Hardening

The application was prepared for production deployment.

Added:

- Railway deployment
- Environment-based configuration
- Security headers
- Rate limiting
- Secure cookie configuration
- Removal of sensitive logging

The final result is a full-stack application demonstrating backend development, database design, authentication, frontend integration, deployment, and security practices.
