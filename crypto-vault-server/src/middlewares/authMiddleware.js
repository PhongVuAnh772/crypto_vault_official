const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');

// Bạn có thể gán biến môi trường JWT_SECRET riêng trên Render
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_crypto_vault_key_2026';

// 1. Hàm mã hoá mật khẩu
const hashPassword = (password) => {
  return CryptoJS.SHA256(password).toString();
};

// 2. Middleware ngăn chặn thao tác không có token
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Vui lòng đăng nhập' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Định dạng token không đúng' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Object user (id, email, role)
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Phiên đăng nhập hết hạn hoặc bị lỗi' });
  }
};

// 3. Middleware cấp quyền dựa trên Role
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden: Bạn không đủ phân quyền để thực hiện tác vụ này' });
    }
    next();
  };
};

module.exports = {
  requireAuth,
  requireRole,
  hashPassword,
  JWT_SECRET
};
