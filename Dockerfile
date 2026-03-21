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

# Copy Solana + pump.fun SDK packages for creator-fee collection at runtime
COPY --from=builder /app/node_modules/@solana ./node_modules/@solana
COPY --from=builder /app/node_modules/@pump-fun ./node_modules/@pump-fun
COPY --from=builder /app/node_modules/@coral-xyz ./node_modules/@coral-xyz
COPY --from=builder /app/node_modules/bn.js ./node_modules/bn.js
COPY --from=builder /app/node_modules/borsh ./node_modules/borsh
COPY --from=builder /app/node_modules/buffer-layout ./node_modules/buffer-layout
COPY --from=builder /app/node_modules/superstruct ./node_modules/superstruct
COPY --from=builder /app/node_modules/rpc-websockets ./node_modules/rpc-websockets
COPY --from=builder /app/node_modules/jayson ./node_modules/jayson
COPY --from=builder /app/node_modules/@noble ./node_modules/@noble
COPY --from=builder /app/node_modules/@babel ./node_modules/@babel
COPY --from=builder /app/node_modules/agentkeepalive ./node_modules/agentkeepalive
COPY --from=builder /app/node_modules/node-fetch ./node_modules/node-fetch
COPY --from=builder /app/node_modules/buffer ./node_modules/buffer
COPY --from=builder /app/node_modules/camelcase ./node_modules/camelcase
COPY --from=builder /app/node_modules/cross-fetch ./node_modules/cross-fetch
COPY --from=builder /app/node_modules/eventemitter3 ./node_modules/eventemitter3
COPY --from=builder /app/node_modules/pako ./node_modules/pako
COPY --from=builder /app/node_modules/toml ./node_modules/toml
COPY --from=builder /app/node_modules/fast-stable-stringify ./node_modules/fast-stable-stringify
COPY --from=builder /app/node_modules/ws ./node_modules/ws
COPY --from=builder /app/node_modules/uuid ./node_modules/uuid
COPY --from=builder /app/node_modules/isomorphic-ws ./node_modules/isomorphic-ws
COPY --from=builder /app/node_modules/json-stringify-safe ./node_modules/json-stringify-safe
COPY --from=builder /app/node_modules/delay ./node_modules/delay
COPY --from=builder /app/node_modules/es6-promisify ./node_modules/es6-promisify
COPY --from=builder /app/node_modules/eyes ./node_modules/eyes
COPY --from=builder /app/node_modules/stream-json ./node_modules/stream-json
COPY --from=builder /app/node_modules/@swc ./node_modules/@swc
COPY --from=builder /app/node_modules/commander ./node_modules/commander
COPY --from=builder /app/node_modules/humanize-ms ./node_modules/humanize-ms
COPY --from=builder /app/node_modules/ms ./node_modules/ms
COPY --from=builder /app/node_modules/tr46 ./node_modules/tr46
COPY --from=builder /app/node_modules/whatwg-url ./node_modules/whatwg-url
COPY --from=builder /app/node_modules/webidl-conversions ./node_modules/webidl-conversions
COPY --from=builder /app/node_modules/@solana/spl-token ./node_modules/@solana/spl-token

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
