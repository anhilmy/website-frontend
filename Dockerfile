# --------------------------
# Stage 1: Base deps install
# --------------------------
FROM node:lts-alpine as deps
WORKDIR /app

# Copy root package.json & lock
COPY package*.json ./

# Copy workspace package.json files
COPY apps/porto/package*.json apps/porto/
COPY apps/pos/package*.json apps/pos/
COPY packages/*/package.json packages/*/

# Install all workspace dependencies
RUN npm install --workspaces

# --------------------------
# Stage 2: Build Porto app
# --------------------------
FROM deps as build-porto
COPY . .
WORKDIR /app/apps/porto
RUN npm run build

# --------------------------
# Stage 3: Build POS app
# --------------------------
FROM deps as build-pos
COPY . .
WORKDIR /app/apps/pos
RUN npm run build

# --------------------------
# Stage 4: Nginx for Porto
# --------------------------
FROM nginx:stable-alpine as vue-porto
COPY --from=build-porto /app/apps/porto/dist /usr/share/nginx/html
COPY apps/porto/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# --------------------------
# Stage 5: Nginx for POS
# --------------------------
FROM nginx:stable-alpine as vue-pos
COPY --from=build-pos /app/apps/pos/dist /usr/share/nginx/html
COPY apps/pos/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]