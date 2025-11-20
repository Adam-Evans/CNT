# CNT
CNT (Chicken Nugget Tuesday) - Phase 1 Implementation Plan
Repository is currently empty (only README and .gitignore exist). Building complete application from scratch.

Implementation Checklist
Infrastructure & Project Setup

 Create Go backend server structure with proper module initialization
 Create React frontend application structure with Vite
 Set up SQLite database schema with all required tables
 Create Dockerfile with multi-stage build (React + Go + SQLite)
 Create docker-compose for easy local development
 Add necessary .gitignore entries for node_modules, dist, database files
Backend (Go + Gin/Echo + SQLite)

 Implement user authentication with password hashing
 Create broker profile management endpoints
 Implement ordering system endpoints
 Add super admin configuration endpoints (unit cost, end date)
 Integrate Google Gemini Flash API for AI propaganda generation
 Add caching logic for AI-generated content
 Implement CORS and static file serving
Frontend (React + Vite + Tailwind CSS)

 Create broker login/authentication UI
 Build broker profile pages (view and edit)
 Create customer-facing broker selection page
 Implement order placement form
 Build super admin dashboard for configuration
 Add EULA/cookies/terms popup with "Adam clause"
 Style with Tailwind CSS and add animations
Security & Testing

 Add input validation and sanitization
 Implement proper authentication middleware
 Test all API endpoints
 Test frontend flows
 Run security checks
CI/CD

 Create GitHub Actions workflow for testing and deployment
 Set up Docker build and push pipeline
Documentation

 Update README with setup and deployment instructions
Original prompt
This section details on the original issue you should resolve

<issue_title>Project phase 1</issue_title>
<issue_description>Once a year we run an event - The Great Auto-Trail CNT (Chicken Nugget Tuesday). The goal being to involve as many people as possible to make them buy chicken nuggets from one of four brokers.

I'd like to build a dockerised golang/React website making use of sqlite for a database.

I'd like to implement a basic auth (user and password) for our "Brokers" to be able to login and build a profile. Profile may include: a profile picture, name, bio, mission statement, testimonials. I'd also need an ordering system (simple, just name, quantity, cost, isPaid). There is only one product: a 20 pack of chicken nuggets at a quantity of 1-10 boxes. All regular users get see the brokers, choose their preferred broker and place an order. Super admin (myself) would need to have config and write access to all brokers and config to set the unit cost of nuggets so we can work out who owes what.

There will be some twists, when a broker is logged in they will see their own bio, I want to be able to set some silly "anti them" propaganda type entries using AI to basically use their bio and testimonials against them kind of like opposite day (using cache until the bio is altered (or cache is empty)). I'd like to use Google Gemini latest flash for this.

Super admin (me) will be able to set price of nuggets and also end date/time so we can tally up the orders and see whos the winner. Regular users placing orders should not see who is winning or who has ordered with whom.

I also want a mock eula/cookies/terms popup with boilerplate, accept cookies, but sneak in a little jokey phrase about surrendering all of your orders to Adam when you use this site.

Operation: Golden Nugget - Implementation Plan

Architecture Overview
We will build a monolithic application packaged in a single Docker container for ease of deployment (since traffic will be bursty but low-volume).

Frontend: React (Vite), Tailwind CSS, Framer Motion (for juice).

Backend: Go (Golang) using Gin or Echo.

Database: SQLite (embedded, zero config).

AI Layer: Google Gemini Flash 1.5 via Go client.

Infrastructure: Docker, hosted on a cheap VPS (DigitalOcean/Hetzner) or Fly.io.
