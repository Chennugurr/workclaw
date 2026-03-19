# ---- Dependencies ----
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lockb* bun.lock* ./
RUN bun install --frozen-lockfile

# ---- Builder ----
FROM node:20-slim AS builder
WORKDIR /app

ARG DATABASE_URL
ARG DIRECT_URL
ARG JWT_SECRET
ARG JWT_REFRESH_SECRET
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_PROJECT_ID

ENV DATABASE_URL=$DATABASE_URL
ENV DIRECT_URL=$DIRECT_URL
ENV JWT_SECRET=$JWT_SECRET
ENV JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_PROJECT_ID=$NEXT_PUBLIC_PROJECT_ID
ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npx next build

# ---- Runner ----
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy Prisma schema + generated client for runtime
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy server-external packages needed at runtime
COPY --from=builder /app/node_modules/jsonwebtoken ./node_modules/jsonwebtoken
COPY --from=builder /app/node_modules/jws ./node_modules/jws
COPY --from=builder /app/node_modules/jwa ./node_modules/jwa
COPY --from=builder /app/node_modules/safe-buffer ./node_modules/safe-buffer
COPY --from=builder /app/node_modules/ua-parser-js ./node_modules/ua-parser-js
COPY --from=builder /app/node_modules/jsend ./node_modules/jsend
COPY --from=builder /app/node_modules/tweetnacl ./node_modules/tweetnacl
COPY --from=builder /app/node_modules/bs58 ./node_modules/bs58
COPY --from=builder /app/node_modules/base-x ./node_modules/base-x

# Copy Prisma CLI for running migrations at startup
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma

# Copy startup script
COPY start.sh ./start.sh
RUN chmod +x start.sh

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./start.sh"]
