# Service Desk AI

A full-stack Service Desk application built for learning and practicing:

- React
- Vite
- Nhost
- Hasura
- GraphQL
- PostgreSQL

The application allows authenticated users to create and manage support tickets.

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS
- ESLint
- Prettier

### Backend / Platform

- Nhost
  - Authentication
  - GraphQL client
  - Backend services
- Hasura
  - GraphQL API
  - Database access
  - Permissions
- PostgreSQL
  - Ticket data storage

## Current Features

### Authentication

- User sign-in using Nhost
- Authentication state handling
- Logout
- Protected ticket functionality

### Ticket Management

Users can:

- Create tickets
- View tickets
- Edit tickets
- Delete tickets
- Search tickets
- Filter by status
- Filter by priority

### Dashboard

The dashboard currently displays:

- Total tickets
- Open tickets
- High-priority tickets
- Recent tickets

## Architecture

```text
React
  |
  | @nhost/react
  v
Nhost Client
  |
  | GraphQL
  v
Hasura
  |
  | SQL
  v
PostgreSQL

service-desk-ai/
│
├── backend/
│
├── frontend/
│   ├── public/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── TicketForm.jsx
│   │   │   └── TicketList.jsx
│   │   │
│   │   ├── graphql/
│   │   │   └── tickets.js
│   │   │
│   │   ├── hooks/
│   │   │   └── useTickets.js
│   │   │
│   │   ├── lib/
│   │   │   └── nhost.js
│   │   │
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── .prettierrc
│   ├── eslint.config.js
│   ├── package.json
│   └── vite.config.js
│
├── hasura/
│
├── docker-compose.yml
├── package.json
└── package-lock.json


Getting Started
Prerequisites

Make sure you have installed:

Node.js
npm
Docker Desktop
Install dependencies

From the project root:

npm install

Then install frontend dependencies:

cd frontend
npm install
Start the frontend

From the frontend directory:

npm run dev

The Vite development server will start locally.

Available Scripts

Run these commands from frontend/.

Development
npm run dev

Starts the Vite development server.

Lint
npm run lint

Runs ESLint against the project.

Format
npm run format

Formats the project using Prettier.

Production Build
npm run build

Creates a production build.

Preview Production Build
npm run preview

Runs the production build locally.

GraphQL

GraphQL operations are stored in:

frontend/src/graphql/

For example:

tickets.js

The application uses GraphQL queries and mutations to communicate with Hasura.

Typical operations include:

Query
  └── Get tickets

Mutation
  ├── Create ticket
  ├── Update ticket
  └── Delete ticket
Custom Hooks

Ticket-related GraphQL operations are encapsulated inside:

frontend/src/hooks/useTickets.js

This keeps the GraphQL/data-access logic separate from the UI components.

The React components consume the hook rather than directly implementing all ticket operations.

Authentication Flow

The application uses Nhost authentication.

User
  |
  | Email + Password
  v
Nhost Authentication
  |
  | Authenticated session
  v
React Application
  |
  | GraphQL request
  v
Hasura

Unauthenticated users see the sign-in screen.

Authenticated users can access the ticket functionality.
