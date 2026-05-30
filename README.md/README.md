# CodeSense AI

CodeSense AI is a full-stack AI-powered code review platform designed to help developers write cleaner, more secure, and maintainable code. The platform provides automated code analysis, security scanning, repository integration, pull request reviews, and AI-generated suggestions to improve development productivity and code quality.

## Overview

Modern software development requires continuous code reviews, security checks, and quality assurance. Manual reviews are often time-consuming and may miss important issues. CodeSense AI addresses this challenge by providing intelligent code analysis and automated review capabilities through an easy-to-use web interface.

The platform integrates with GitHub repositories, analyzes source code, detects potential bugs and security vulnerabilities, and generates actionable recommendations for developers.

## Features

### AI Code Review

* Automated code quality analysis
* Bug detection and code improvement suggestions
* Readability and maintainability assessment
* AI-generated recommendations

### Security Scanning

* Detection of common security vulnerabilities
* Secure coding recommendations
* Risk assessment reports
* Security score evaluation

### GitHub Integration

* GitHub OAuth authentication
* Repository connection and management
* Pull Request analysis
* Automated review workflow

### Analytics Dashboard

* Code quality metrics visualization
* Security insights and trends
* Repository performance monitoring
* Historical review tracking

### Review History

* Store and manage previous code reviews
* Access historical analysis reports
* Compare review results over time

### User Management

* Secure authentication system
* User profile management
* Personalized dashboard experience

## Technology Stack

### Frontend

* React.js
* TypeScript
* CSS3
* Axios
* React Router

### Backend

* Node.js
* Express.js
* Passport.js
* JWT Authentication

### Database

* SQLite

### Integrations

* GitHub OAuth API
* Claude AI API

## Project Structure

```text
codesense-ai/
│
├── backend/
│   ├── config/
│   ├── database/
│   ├── middleware/
│   ├── routes/
│   └── index.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.tsx
│   └── package.json
│
└── README.md
```

## Installation

### Clone Repository

```bash
git clone https://github.com/deepikagupta8050/codesense-ai.git
cd codesense-ai
```

### Backend Setup

```bash
cd backend
npm install
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## Environment Variables

Create a `.env` file in the backend directory and configure:

```env
PORT=5000

JWT_SECRET=your_jwt_secret

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

CLAUDE_API_KEY=your_claude_api_key
```

## Future Enhancements

* Multi-language code support
* Team collaboration features
* CI/CD pipeline integration
* Advanced AI review models
* Real-time collaboration tools
* Detailed project health analytics

## Author

**Deepika Gupta**

Computer Science Engineering (AI & ML)

UEM Jaipur

GitHub: https://github.com/deepikagupta8050

## License

This project is developed for educational, learning, and portfolio purposes.
