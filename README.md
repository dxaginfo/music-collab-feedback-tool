# Collaborative Song Feedback Tool

A modern web application designed to streamline the music production and review process by providing a platform for structured, contextual feedback on audio tracks.

## Features

- **Time-stamped Comments**: Leave feedback at specific points in a track
- **Visual Waveform Interface**: See comments in context with the audio
- **Version Control**: Track changes and progress across multiple versions
- **Collaboration Tools**: Work together with your team in real-time
- **Project Management**: Organize tracks by project and manage access
- **Mobile Responsive**: Give and receive feedback on any device

## Technology Stack

### Frontend
- React.js with TypeScript
- Redux for state management
- Material-UI components
- Web Audio API and Wavesurfer.js for audio visualization
- Socket.io for real-time updates

### Backend
- Node.js with Express
- MongoDB for data storage
- JWT authentication
- Socket.io for real-time communication
- AWS S3 for audio file storage

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (v4+)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/dxaginfo/music-collab-feedback-tool.git
cd music-collab-feedback-tool
```

2. Install dependencies for both client and server
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables
```bash
# In the server directory, create a .env file with:
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_BUCKET_NAME=your_s3_bucket_name
```

4. Start the development servers
```bash
# Start the backend server (from the server directory)
npm run dev

# Start the frontend server (from the client directory)
npm start
```

## API Documentation

The API documentation is available at `/api/docs` when running the development server.

### Main Endpoints:

- **Authentication**: `/api/auth/*`
- **Projects**: `/api/projects/*`
- **Tracks**: `/api/tracks/*`
- **Comments**: `/api/comments/*`

## Project Structure

```
music-collab-feedback-tool/
├── client/                 # React frontend
│   ├── public/             # Static files
│   └── src/                # Source files
│       ├── components/     # React components
│       ├── context/        # React context providers
│       ├── hooks/          # Custom React hooks
│       ├── pages/          # Page components
│       ├── redux/          # Redux store and slices
│       ├── services/       # API service functions
│       └── utils/          # Utility functions
├── server/                 # Node.js backend
│   ├── src/                # Source files
│   │   ├── controllers/    # API controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   └── utils/          # Utility functions
│   └── uploads/            # Temporary file uploads
└── README.md               # Project documentation
```

## Deployment

### Backend Deployment
1. Set up an AWS EC2 instance or similar service
2. Configure MongoDB Atlas or a self-hosted MongoDB instance
3. Set up environment variables on your server
4. Use PM2 or similar to manage the Node.js process

### Frontend Deployment
1. Build the React application with `npm run build`
2. Deploy the static files to AWS S3, Netlify, Vercel, or similar
3. Configure CORS on the backend to allow requests from your frontend domain

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Wavesurfer.js](https://wavesurfer-js.org/) for the audio visualization
- [Material-UI](https://mui.com/) for the UI components
- [Socket.io](https://socket.io/) for the real-time functionality