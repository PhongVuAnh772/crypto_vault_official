# STAGE 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Ưu tiên copy package.json để cài dependencies trước
COPY package*.json ./
RUN npm install

# Copy source code và build
COPY . .
RUN npm run build

# STAGE 2: Serve với Nginx nhẹ cho hiệu suất cao
FROM nginx:stable-alpine

# Copy file config Nginx để tránh lỗi 404 khi refresh trang (React Router)rai
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy file build từ stage 1 vào thư mục mặc định của Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Mở cổng 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
