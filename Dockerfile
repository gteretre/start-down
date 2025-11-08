# Use a lightweight Node.js image as the base
FROM node:18-alpine AS base

# Prevent husky from trying to install git hooks during docker builds
ENV HUSKY=0 \
	NEXT_TELEMETRY_DISABLED=1

# Set the working directory
WORKDIR /app

FROM base AS deps

# Install required OS packages
RUN apk add --no-cache libc6-compat

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install all dependencies (including dev for the build step)
RUN npm ci --include=dev

FROM base AS builder

# Reuse dependencies from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

FROM base AS runner

ENV NODE_ENV=production \
	PORT=3000

# Install runtime OS packages
RUN apk add --no-cache libc6-compat

# Include package metadata for runtime
COPY package.json package-lock.json ./

# Copy node_modules from deps stage and prune dev dependencies
COPY --from=deps /app/node_modules ./node_modules
RUN npm prune --omit=dev && npm cache clean --force

# Copy the build output and any static assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/lib/allowedDomains.ts ./lib/allowedDomains.ts
COPY --from=builder /app/lib/allowedDomains.js ./lib/allowedDomains.js

# Expose the port (adjust if needed)
EXPOSE 3000

# Start the Next.js production server
CMD ["npm", "run", "start"]