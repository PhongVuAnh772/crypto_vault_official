/**
 * Service tập trung để quản lý và gửi lỗi.
 */
class ErrorLogger {
  /**
   * Ghi nhận một exception.
   * @param error Lỗi cần ghi nhận (Error object hoặc bất kỳ kiểu dữ liệu nào).
   * @param context Chuỗi mô tả vị trí hoặc hành động xảy ra lỗi (ví dụ: 'network/sendPost').
   */
  static log(error: any, context?: string) {
    if (__DEV__) {
      console.log(`[ErrorLogger] ${context ? context + ": " : ""}`, error);
    }
  }

  /**
   * Ghi nhận một tin nhắn thông báo.
   * @param message Nội dung tin nhắn.
   * @param level Mức độ nghiêm trọng.
   */
  static message(message: string, level: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug' = "info") {
    if (__DEV__) {
      console.log(`[ErrorLogger Message] [${level}]`, message);
    }
  }
}

export default ErrorLogger;
