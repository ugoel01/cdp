# Use the Node.js image as the base image
FROM node:22.13.1

# Working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production


# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# Expose the application port
EXPOSE 3000

# Start the application in production mode
CMD ["npm", "run", "start:prod"]
