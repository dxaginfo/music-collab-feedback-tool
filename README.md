# Collaborative Song Feedback Tool

A web application that enables musicians, producers, and collaborators to provide structured feedback on music tracks with real-time collaboration, version tracking, and AI-assisted analysis.

## 🎵 Overview

The Collaborative Song Feedback Tool addresses a critical need in the music production workflow by providing structured, context-aware feedback mechanisms that enhance creative collaboration. The platform streamlines the revision process, improves communication between collaborators, and ultimately helps artists create better music more efficiently.

## ✨ Key Features

### Core Features

- **Real-time Audio Playback and Annotation**
  - Time-stamped comments on specific sections of tracks
  - Frequency range marking on audio visualizations for precise feedback

- **Version Control and History**
  - Upload and compare multiple versions of songs
  - Complete history of changes and comments to track evolution

- **Collaboration Management**
  - Role-based permissions system for team members
  - Notification system for updates and comments

- **Integration Capabilities**
  - Import/export tracks from common DAWs with metadata
  - Share feedback sessions to streaming platforms or social media

- **Mobile Responsiveness**
  - Review and respond to feedback on mobile devices
  - Record quick vocal demonstrations through mobile interface

### Advanced Features

- **AI-Assisted Feedback**
  - Automatic detection of technical issues (clipping, phase problems)
  - AI-generated suggestions for song structure and arrangements

- **Analytics Dashboard**
  - Metrics on feedback implementation rates and project progress
  - Identification of most-commented sections to focus revisions

- **Rights Management**
  - Contribution tracking and automatic split sheet generation
  - Terms agreement system for all collaborators

## 🛠️ Technology Stack

### Frontend
- React.js with TypeScript
- Redux for global state management
- Material-UI for responsive design
- Web Audio API for waveform visualization
- Socket.io for real-time updates

### Backend
- Node.js with Express.js
- MongoDB for database
- JWT authentication
- Redis for caching
- Elasticsearch for search

### Infrastructure
- AWS (EC2, S3, CloudFront)
- GitHub Actions for CI/CD
- Docker for containerization

## 📋 System Architecture

The system follows a microservices architecture with the following components:

1. **Client Application**
   - Web and mobile interfaces
   - Real-time collaboration features
   - Audio processing capabilities

2. **API Gateway**
   - Route management
   - Authentication and authorization
   - Rate limiting

3. **Microservices**
   - User Service
   - Project Service
   - Comment Service
   - Version Service
   - Notification Service

4. **Storage Layer**
   - Document database (MongoDB)
   - Object storage (S3)
   - Caching layer (Redis)

5. **Background Workers**
   - Audio processing jobs
   - AI analysis tasks
   - Notification dispatch

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB
- Redis
- AWS Account (for production deployment)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/dxaginfo/music-collab-feedback-tool.git
   cd music-collab-feedback-tool
   ```

2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. Configure environment variables:
   ```bash
   # Copy example environment files
   cp server/.env.example server/.env
   cp client/.env.example client/.env

   # Edit the .env files with your configuration
   ```

4. Run development servers:
   ```bash
   # Start backend server
   cd server
   npm run dev

   # Start frontend application
   cd ../client
   npm start
   ```

### Deployment

For production deployment, we use Docker and AWS:

1. Build Docker images:
   ```bash
   docker-compose build
   ```

2. Deploy to AWS:
   ```bash
   # Configure AWS credentials
   aws configure

   # Deploy using CloudFormation template
   aws cloudformation deploy --template-file deployment/cloudformation.yml --stack-name music-collab-feedback --capabilities CAPABILITY_IAM
   ```

## 📝 API Documentation

Our API follows RESTful principles with the following main endpoints:

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Projects
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details

### Tracks
- `POST /api/projects/:id/tracks` - Upload new track
- `GET /api/tracks/:id` - Get track details
- `GET /api/tracks/:id/waveform` - Get track waveform data

### Comments
- `GET /api/tracks/:id/comments` - Get comments for track
- `POST /api/tracks/:id/comments` - Add new comment
- `PUT /api/comments/:id` - Update comment

## 🧪 Testing

Run tests with the following commands:

```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test

# Run end-to-end tests
npm run test:e2e
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Contact

For questions or support, please contact us at dxag.info@gmail.com