# Stage 1: Build the Angular application
FROM node:18 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build --prod

# Stage 2: Serve the application with Nginx
FROM nginx:alpine
COPY --from=build /app/dist/web-java-final-layout/browser /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
