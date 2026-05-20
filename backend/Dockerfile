FROM node:22-alpine AS base
WORKDIR /app

# Install OpenSSL (required by Prisma on Alpine)
RUN apk add --no-cache openssl

# Install deps
COPY package.json package-lock.json* ./
RUN npm install --frozen-lockfile

# Copy source
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

# Generate Prisma client with Alpine binary
RUN npm run db:generate

# Start: push schema to DB then serve
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node --import tsx/esm src/index.ts"]
