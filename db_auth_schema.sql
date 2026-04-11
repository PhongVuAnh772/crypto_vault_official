-- CHẠY SCRIPT NÀY VÀO SQL EDITOR TRÊN SUPABASE CỦA BẠN NHÉ!

-- 1. Tạo ENUM quản lý các vai trò Admin
CREATE TYPE admin_role AS ENUM ('super_admin', 'manager', 'viewer');

-- 2. Bảng quản trị viên
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role admin_role DEFAULT 'viewer',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- (Không bắt buộc) Tạo data mẫu. Có thể gọi API /admin/setup trên Postman cũng được.
-- Mật khẩu "123456" mã hoá SHA256 là "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92"
