# 🍗 CNT - Chicken Nugget Tuesday

> *The ultimate platform for organizing and celebrating Chicken Nugget Tuesday!*

A full-stack web application for managing "The Great Chicken Nugget Tuesday" event - a fun competition where brokers compete to sell the most chicken nuggets! Built for extensibility and ready to grow with your nugget-selling ambitions.

## ✨ Features

### For Everyone
- 🏠 Beautiful customer-facing home page to browse brokers and place orders
- 📝 EULA/Terms popup with the "Adam Clause" 
- 🔐 Secure authentication system
- 🎨 Customizable site content including dynamic CEO messages

### For Brokers
- 👤 Personal profile management (bio, mission statement, testimonials, profile picture)
- 📊 Order dashboard showing all customer orders
- 💰 Revenue tracking (total and paid)
- 🤖 A special twist awaits... (AI-powered content generation)

### For Super Admin
- 👑 Full system configuration (nugget pricing, event end date)
- 📈 Broker leaderboard and statistics
- 💳 Order management (mark orders as paid/unpaid)
- 🎯 Access to all broker profiles and orders
- 🔧 Per-broker configuration for AI content visibility
- 🎙️ Customizable site content (CEO section with name, title, image, and message)

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose (recommended)
- OR: Go 1.22+, Node.js 20+, and npm

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/Adam-Evans/CNT.git
cd CNT

# Create a .env file
cp .env.example .env

# Edit .env and set your secrets
# JWT_SECRET=your-super-secret-jwt-key
# GEMINI_API_KEY=your-gemini-api-key  # Optional - for AI features

# Start the application
docker-compose up -d
```

Access the application at `http://localhost:8080`

### Option 2: Local Development

#### Backend Setup

```bash
# Install Go dependencies
go mod download

# Set environment variables
export JWT_SECRET=your-secret-key
export GEMINI_API_KEY=your-api-key  # Optional
export DB_PATH=./cnt.db
export PORT=8080

# Run the server
go run main.go
```

#### Frontend Setup

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8080/api" > .env
npm run dev
```

Access the frontend at `http://localhost:5173`

## 🔐 Default Credentials

- **Username:** `admin`
- **Password:** `admin123`

⚠️ **IMPORTANT:** Change this password immediately after first login!

## 🛠️ Tech Stack

### Backend
- **Go 1.22+** - Main backend language
- **Gin** - Web framework
- **SQLite** - Embedded database (zero configuration)
- **Google Gemini Flash API** - AI content generation
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

## 📚 API Documentation

### Public Endpoints
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new broker account
- `GET /api/brokers` - List all brokers with profiles
- `GET /api/brokers/:id` - Get specific broker profile
- `POST /api/orders` - Place an order
- `GET /api/config` - Get system configuration
- `GET /api/site-config` - Get site content configuration

### Authenticated Endpoints (Broker)
- `GET /api/auth/me` - Get current user info
- `GET /api/my/profile` - Get my broker profile
- `PUT /api/my/profile` - Update my broker profile
- `GET /api/my/propaganda` - Get AI-generated content for my profile
- `GET /api/my/orders` - Get all my orders

### Admin Endpoints
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id` - Update order
- `GET /api/admin/stats` - Get broker statistics
- `PUT /api/admin/config` - Update system configuration
- `PUT /api/admin/site-config` - Update site content configuration
- `PUT /api/admin/brokers/:id` - Update any broker's profile
- `PUT /api/admin/brokers/:id/ai-content` - Toggle AI content for a specific broker

## 🗄️ Database Schema

The SQLite database contains the following tables:
- `users` - User accounts (brokers and admin)
- `broker_profiles` - Broker profile information (includes per-broker AI toggle)
- `orders` - Customer orders
- `config` - System configuration
- `site_config` - Customizable site content (CEO section)
- `ai_cache` - Cached AI-generated content

## 📊 Scoring System

The final scores on the leaderboard reflect **only paid orders**. Unpaid orders are tracked but do not count toward the competition standings. This ensures fair and accurate results for Chicken Nugget Tuesday!

## 🔧 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DB_PATH` | No | `./cnt.db` | Path to SQLite database file |
| `PORT` | No | `8080` | Server port |
| `JWT_SECRET` | Yes | - | Secret key for JWT tokens |
| `GEMINI_API_KEY` | No | - | Google Gemini API key for AI features |
| `GIN_MODE` | No | `release` | Gin framework mode (debug/release) |

## 🚢 Deployment

### Docker Hub Deployment

The GitHub Actions workflow automatically builds and pushes Docker images to Docker Hub when pushing to the `main` branch.

Required secrets:
- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password/token

### Manual Deployment

```bash
# Build the Docker image
docker build -t cnt:latest .

# Run the container
docker run -d \
  -p 8080:8080 \
  -e JWT_SECRET=your-secret \
  -e GEMINI_API_KEY=your-key \
  -v cnt-data:/data \
  cnt:latest
```

## 🔒 Security Considerations

- Change default admin password immediately
- Use strong JWT_SECRET in production
- Enable HTTPS in production (use reverse proxy like nginx)
- Regularly update dependencies
- Keep API keys secure and never commit them to git

## 📄 License

This project is for personal/educational use.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 💬 Support

For issues and questions, please use the GitHub issue tracker.

---

Made with 🍗 and ❤️ for Chicken Nugget Tuesday

*Remember: Every nugget counts... but only if it's paid for! 🎉*
