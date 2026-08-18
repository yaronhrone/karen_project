# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app

# Cache node_modules in their own layer - only reinstalled when package*.json changes
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# CRA bakes REACT_APP_* vars into the JS bundle at build time (not readable at
# container runtime). All three are passed in via docker-compose's build.args,
# sourced from .env - this is the only mechanism that actually reaches a CI
# build: .env.local is gitignored on purpose and never exists in a fresh
# `actions/checkout`, so relying on it here silently shipped a placeholder
# Google client ID to production (found via a real "error 400" from Google -
# the deployed bundle had no client_id in it at all). ARGs default to empty
# when not passed (e.g. a bare `docker build` with no --build-arg), which
# falls back to the localhost/"unset" defaults already handled in code
# (apiServise.js's `||` fallbacks, GoogleOAuthProvider's own error if empty).
ARG REACT_APP_GOOGLE_CLIENT_ID
ARG REACT_APP_ITEMS_API_URL
ARG REACT_APP_USERS_API_URL
ENV REACT_APP_GOOGLE_CLIENT_ID=$REACT_APP_GOOGLE_CLIENT_ID
ENV REACT_APP_ITEMS_API_URL=$REACT_APP_ITEMS_API_URL
ENV REACT_APP_USERS_API_URL=$REACT_APP_USERS_API_URL

RUN npm run build

# --- run stage ---
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
