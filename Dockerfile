FROM mcr.microsoft.com/playwright:v1.59.0-noble

WORKDIR /app

# Install dependencies first (layer-cached until package-lock changes)
COPY package*.json ./
RUN npm ci

# Copy source after dependencies so code changes don't bust the dep cache
COPY . .

# CI defaults — callers can override via --env
ENV CI=true
ENV HEADLESS=true
ENV LOCATOR_TIMEOUT_MS=3000
ENV CUCUMBER_WORKERS=2

# Default: run the full smoke suite
CMD ["npm", "run", "test:smoke"]
