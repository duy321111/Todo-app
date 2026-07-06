# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy dependency mappings
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy source code
COPY . .

# Expose backend port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
