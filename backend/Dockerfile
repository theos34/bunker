FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile || bun install

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN bunx prisma generate

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start the server
CMD ["sh", "-c", "bunx prisma migrate deploy && bun run src/index.ts"]
