# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app

# Cache node_modules in their own layer - only reinstalled when package*.json changes
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# CRA bakes REACT_APP_* vars into the JS bundle at build time (not readable at
# container runtime). REACT_APP_GOOGLE_CLIENT_ID deliberately stays out of this -
# it's already supplied via the committed .env/.env.local files (copied in by
# COPY . . above) and apiServise.js has no fallback for it, so an unset build
# ARG would silently blank it out. The two API URLs below DO have safe
# localhost fallbacks in code, so they're safe to wire through build args -
# passed via docker-compose's build.args, sourced from the deploy env's .env,
# to point at the real server address instead of localhost in production.
ARG REACT_APP_ITEMS_API_URL
ARG REACT_APP_USERS_API_URL
ENV REACT_APP_ITEMS_API_URL=$REACT_APP_ITEMS_API_URL
ENV REACT_APP_USERS_API_URL=$REACT_APP_USERS_API_URL

RUN npm run build

# --- run stage ---
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
