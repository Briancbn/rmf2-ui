# Use an official node runtime as a build image
FROM node:22 AS build

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Setup PNPM
RUN corepack enable && \
    corepack prepare pnpm@latest-10 --activate

# Install dependencies
RUN pnpm install

# Build the React app for production
ARG MODE=development
RUN echo "Building in $MODE mode" && \
    pnpm run -r build --mode $MODE

# APPS Dashboard
# Use Nginx as the production server
FROM nginx:alpine AS dashboard

# Copy the built React app to Nginx's web server directory
COPY --from=build /app/apps/dashboard/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for the Nginx server
EXPOSE 80
