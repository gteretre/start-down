# Use a lightweight Node.js image as the base
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Copy environment variables (if you want to bake them in, not recommended for secrets)
# COPY .env.local .env.local

# Build the Next.js application
RUN npm run build

# Set environment to production
ENV NODE_ENV=production

# Expose the port (adjust if needed)
EXPOSE 3000

# Start the Next.js production server
CMD ["npm", "run", "start"]