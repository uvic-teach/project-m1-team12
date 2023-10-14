# Use the official Node.js image as the base image
FROM node:16-slim

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available) to the working directory
COPY package*.json ./

# Install the project dependencies
RUN npm install

# Copy the local files to the container's working directory
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the server
CMD ["node", "server.js"]

