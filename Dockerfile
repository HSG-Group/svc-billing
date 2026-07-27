# syntax=docker/dockerfile:1

# ---- deps: install with Bun (fast) ----
FROM oven/bun:1.3-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ---- build: compile Nest with the deps installed above ----
FROM oven/bun:1.3-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# ---- prod deps: install only production dependencies ----
FROM oven/bun:1.3-alpine AS prod-deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# ---- runtime: run the compiled app on Node ----
# Node is used as the runtime (not `bun run`) since Nest still has some
# rough edges on the Bun runtime (fastify/pino). Bun is only used above
# to install and build, where it's a straightforward, fast win.
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

EXPOSE 3000
CMD ["node", "dist/main.js"]
