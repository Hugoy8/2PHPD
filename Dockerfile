### Etape 1 : Installation de nodeJs et des dépendances, build de l'application ###
FROM node:latest AS build
WORKDIR /app
COPY package*.json ./
RUN npm cache clean --force && npm install
COPY . .
RUN npm run build

### Etape 2 : Installation de NGINX, ouverture des ports ###
FROM nginx:alpine AS production
COPY --from=build /app/dist/scorelt/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
EXPOSE 443
