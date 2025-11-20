# 🍗 CNT (Chicken Nugget Tuesday)

A full-stack web application for managing "The Great Auto-Trail CNT" event - a fun competition where brokers compete to sell the most chicken nuggets!

## Features

### For Everyone
- 🏠 Customer-facing home page to browse brokers and place orders
- 📝 EULA/Terms popup with the "Adam Clause" 
- 🔐 Secure authentication system

### For Brokers
- 👤 Personal profile management (bio, mission statement, testimonials, profile picture)
- 📊 Order dashboard showing all customer orders
- 💰 Revenue tracking (total and paid)
- 🤖 AI-generated "anti-propaganda" using Google Gemini Flash (opposite day twist on their own bios!)

### For Super Admin
- 👑 Full system configuration (nugget pricing, event end date)
- 📈 Broker leaderboard and statistics
- 💳 Order management (mark orders as paid/unpaid)
- 🎯 Access to all broker profiles and orders

## Tech Stack

### Backend
- **Go 1.22+** - Main backend language
- **Gin** - Web framework
- **SQLite** - Embedded database (zero configuration)
- **Google Gemini Flash API** - AI propaganda generation
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Local development
- **GitHub Actions** - CI/CD pipeline

## Quick Start

### Prerequisites
- Docker & Docker Compose (recommended)
- OR: Go 1.22+, Node.js 20+, and npm

### Option 1: Docker (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/Adam-Evans/CNT.git
cd CNT
```

2. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Edit `.env` and set your secrets:
```env
JWT_SECRET=your-super-secret-jwt-key
GEMINI_API_KEY=your-gemini-api-key  # Optional - for AI features
```

4. Start the application:
```bash
docker-compose up -d
```

5. Access the application at `http://localhost:8080`

### Option 2: Local Development

#### Backend Setup

1. Install Go dependencies:
```bash
go mod download
```

2. Initialize the database:
```bash
go run main.go
# Database will be created at ./cnt.db
```

3. Run the backend:
```bash
# Set environment variables
export JWT_SECRET=your-secret-key
export GEMINI_API_KEY=your-api-key  # Optional
export DB_PATH=./cnt.db
export PORT=8080

# Run the server
go run main.go
```

#### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
echo "VITE_API_URL=http://localhost:8080/api" > .env
```

4. Run the development server:
```bash
npm run dev
```

5. Access the frontend at `http://localhost:5173`

## Default Credentials

The application comes with a default super admin account:
- **Username:** `admin`
- **Password:** `admin123`

⚠️ **IMPORTANT:** Change this password immediately after first login!

## API Documentation

### Public Endpoints

#### Authentication
- `POST /api/auth/login` - Login (broker or admin)
- `POST /api/auth/register` - Register new broker account

#### Brokers
- `GET /api/brokers` - List all brokers with profiles
- `GET /api/brokers/:id` - Get specific broker profile

#### Orders
- `POST /api/orders` - Place an order

#### Configuration
- `GET /api/config` - Get system configuration (price, end date)

### Authenticated Endpoints (Broker)

- `GET /api/auth/me` - Get current user info
- `GET /api/my/profile` - Get my broker profile
- `PUT /api/my/profile` - Update my broker profile
- `GET /api/my/propaganda` - Get AI-generated propaganda for my profile
- `GET /api/my/orders` - Get all my orders

### Admin Endpoints

- `GET /api/admin/orders` - Get all orders in the system
- `PUT /api/admin/orders/:id` - Update order (payment status)
- `GET /api/admin/stats` - Get broker statistics and leaderboard
- `PUT /api/admin/config` - Update system configuration
- `PUT /api/admin/brokers/:id` - Update any broker's profile

## Database Schema

The SQLite database contains the following tables:
- `users` - User accounts (brokers and admin)
- `broker_profiles` - Broker profile information
- `orders` - Customer orders
- `config` - System configuration
- `ai_cache` - Cached AI-generated propaganda

## AI Propaganda Feature

When a broker views their dashboard, the system generates humorous "opposite day" propaganda based on their profile using Google Gemini Flash API. The content is cached until the profile is updated.

To enable this feature:
1. Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Set the `GEMINI_API_KEY` environment variable

If no API key is set, the feature will gracefully degrade with a default message.

## Deployment

### Docker Hub Deployment

The GitHub Actions workflow automatically builds and pushes Docker images to Docker Hub when pushing to the `main` branch.

Required secrets:
- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password/token

### Manual Deployment

1. Build the Docker image:
```bash
docker build -t cnt:latest .
```

2. Run the container:
```bash
docker run -d \
  -p 8080:8080 \
  -e JWT_SECRET=your-secret \
  -e GEMINI_API_KEY=your-key \
  -v cnt-data:/data \
  cnt:latest
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DB_PATH` | No | `./cnt.db` | Path to SQLite database file |
| `PORT` | No | `8080` | Server port |
| `JWT_SECRET` | Yes | - | Secret key for JWT tokens |
| `GEMINI_API_KEY` | No | - | Google Gemini API key for AI features |
| `GIN_MODE` | No | `release` | Gin framework mode (debug/release) |

## Development

### Running Tests

```bash
# Backend tests
go test ./...

# Frontend tests (if added)
cd frontend
npm test
```

### Building for Production

```bash
# Build frontend
cd frontend
npm run build

# Build backend
go build -o cnt-server

# Or use Docker
docker build -t cnt:latest .
```

## Security Considerations

- Change default admin password immediately
- Use strong JWT_SECRET in production
- Enable HTTPS in production (use reverse proxy like nginx)
- Regularly update dependencies
- Keep API keys secure and never commit them to git

## License

This project is for personal/educational use.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues and questions, please use the GitHub issue tracker.

---

Made with 🍗 and ❤️ for Chicken Nugget Tuesday

