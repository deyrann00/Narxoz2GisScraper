# Build the bundled MCP server from TypeScript sources.
FROM node:22-alpine AS build
WORKDIR /src/plugins/mcp
COPY plugins/mcp/package.json plugins/mcp/package-lock.json ./
RUN npm ci
COPY plugins/mcp/ ./
RUN npm run build

# Runtime: the bundle has no dependencies, only Node is needed.
FROM node:22-alpine
ENV NODE_ENV=production \
    NARXOZ_2GIS_ROOT=/app
WORKDIR /app
COPY --from=build /src/plugins/claude/server/index.js ./server/index.js
COPY config.json ./config.json
RUN mkdir -p /app/data/runs && chown -R node:node /app
USER node
VOLUME ["/app/data"]

# MCP server over stdio: run with `docker run -i`.
ENTRYPOINT ["node", "/app/server/index.js"]
