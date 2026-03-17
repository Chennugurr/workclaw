# Use the official Bun image as the base
FROM oven/bun:1 as base

# Set the working directory
WORKDIR /app

# Add build arguments for all env variables
ARG DATABASE_URL
ARG DIRECT_URL
ARG JWT_SECRET
ARG JWT_REFRESH_SECRET
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_PROJECT_ID

# Set environment variables
ENV DATABASE_URL=$DATABASE_URL
ENV DIRECT_URL=$DIRECT_URL
ENV JWT_SECRET=$JWT_SECRET
ENV JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_PROJECT_ID=$NEXT_PUBLIC_PROJECT_ID

# Install OpenSSL
RUN apt-get update -y && apt-get install -y openssl

# Copy package.json and bun.lockb (if it exists)
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN bunx prisma generate

# Build the Next.js application
RUN bun run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["bun", "run", "start"]
