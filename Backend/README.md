# Claims Management API

A stateless Claims Management System API built using Node.js and Express.js with in-memory storage. This system enables user registration, policy management, claims filing, and administrative controls.

## Features

* **User Management**: Secure registration and authentication system for users and administrators
* **Policy Operations**: Complete policy lifecycle management including creation, updates, and deletion (admin only)
* **Claims Processing**: End-to-end claims filing system with approval workflows
* **Stateless Architecture**: Lightweight implementation using in-memory storage without database dependencies
* **Admin Controls**: Dedicated administrative interface for policy management and claims approval

## Technology Stack

* **Backend Framework**: Node.js with Express.js
* **Data Storage**: In-memory arrays (No database required)
* **Testing Tools**: Postman, cURL
* **Development**: nodemon for development environment

## Getting Started

### Prerequisites

* Node.js (v14 or higher)
* npm (v6 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/stateless-claims-api.git
   cd stateless-claims-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   # Development mode with nodemon
   npm run dev

   # Production mode
   node index.js
   ```

The server will start on `http://localhost:3000`

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.