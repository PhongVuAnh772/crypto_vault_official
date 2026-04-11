# Sử dụng Node.js bản stable nhẹ (Alpine)
FROM node:20-alpine

# Tạo thư mục làm việc trong container
WORKDIR /app

# Copy các file cấu hình package trước để tối ưu hóa cache của Docker
COPY package*.json ./
COPY yarn.lock* ./

# Cài đặt dependencies
RUN npm install --production

# Copy toàn bộ mã nguồn vào container
COPY . .

# Mở cổng mà server đang chạy (mặc định trong index.js của bạn là 3000 hoặc PORT từ enviroment)
EXPOSE 3000

# Lệnh chạy server
CMD ["node", "src/server.js"]
