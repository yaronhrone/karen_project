# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app

# Cache node_modules in their own layer - only reinstalled when package*.json changes
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- run stage ---
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
