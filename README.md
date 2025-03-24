# Claims Management System

A comprehensive insurance policy and claims management application with separate user and admin interfaces. This system allows users to purchase policies, file claims, and track their status, while administrators can manage policies, process claims, and handle policy purchase requests.

## Project Structure

The project consists of three main components:

1. **Backend**: Node.js/Express API server with MongoDB database
2. **Frontend**: React-based UI with Tailwind CSS styling
3. **API Gateway**: Cloudflare-based API gateway 

## Features

### User Features
- User registration and authentication
- Browse and purchase insurance policies
- File and track insurance claims
- View policy details and status
- Profile management
- Password reset functionality

### Admin Features
- Comprehensive dashboard with statistics
- Policy creation and management
- Claims processing (approve/reject)
- Policy purchase request handling
- User management

## Technologies Used

### Backend
- Node.js and Express
- MongoDB with Mongoose
- JWT for authentication
- Sendgrid and mautic for email notifications
- Swagger for API documentation
- Rate limiting for security
- Google Generative AI integration for chatbot
- Cron jobs for automated reminders

### Frontend
- React 19
- React Router for navigation
- Axios for API requests
- Tailwind CSS for styling
- Chart.js for data visualization
- React Hot Toast for notifications
- React DnD for drag and drop functionality

## Prerequisites

Before running the application, make sure you have the following installed:
- Node.js (v16 or higher)
- npm (v7 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Git
- Docker

## Installation and Setup

### Option 1: Running with Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd task3
   ```

2. Create a `.env` file in the Backend directory with the following variables:
   ```
   PORT=4000
   MONGODB_URI=<your-mongodb-connection-string>
   JWT_SECRET=<your-jwt-secret>
   JWT_EXPIRY=7d
   CORS_ORIGIN=http://localhost:3000
   EMAIL_SERVICE=<your-email-service>
   EMAIL_USER=<your-email>
   EMAIL_PASS=<your-email-password>
   FRONTEND_URL=http://localhost:3000
   ```

3. Run the application using Docker Compose:
   ```bash
   docker-compose up
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - API Documentation: http://localhost:4000/api-docs

### Option 2: Running Without Docker

#### Backend Setup

1. Navigate to the Backend directory:
   ```bash
   cd task3/Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the necessary environment variables (see Docker section above)

4. Start the backend server:
   ```bash
   npm run dev
   ```

5. The backend server will run on http://localhost:4000

#### Frontend Setup

1. Navigate to the Frontend directory:
   ```bash
   cd task3/claims-management-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```

4. The frontend application will run on http://localhost:3000

## API Documentation

The backend API is documented using Swagger. Once the backend server is running, you can access the API documentation at:
```
http://localhost:4000/api-docs
```

## User Roles and Access

### Regular User
- Register and login
- Browse available policies
- Purchase policies
- File claims for purchased policies
- View claim status
- Update profile information

### Admin User
- Access admin dashboard
- Create and manage insurance policies
- Process claims (approve/reject)
- Handle policy purchase requests
- View statistics and reports

## Database Schema

The application uses MongoDB with the following main collections:
- Users: Store user information and authentication details
- Policies: Insurance policy templates available for purchase
- PurchasedPolicies: Policies purchased by users
- Claims: Claims filed by users against their purchased policies
- PolicyRequests: Requests from users to purchase policies

## Testing

The frontend includes Cypress for end-to-end testing:

```bash
cd claims-management-frontend
npm run test
```

## Deployment

The application can be deployed to various cloud platforms:

1. **Backend**: Deploy to services like Heroku, Render, or AWS
2. **Frontend**: Deploy to services like Netlify, Vercel, or GitHub Pages
3. **Database**: Use MongoDB Atlas for the database

Remember to update the environment variables and API endpoints for production deployment.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
