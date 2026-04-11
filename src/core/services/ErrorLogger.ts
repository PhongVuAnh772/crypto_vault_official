import * as Sentry from "@sentry/react-native";

/**
 * Service tập trung để quản lý và gửi lỗi lên Sentry Dashboard.
 */
class ErrorLogger {
  /**
   * Ghi nhận một exception và gửi lên Sentry với ngữ cảnh (context) kèm theo.
   * @param error Lỗi cần ghi nhận (Error object hoặc bất kỳ kiểu dữ liệu nào).
   * @param context Chuỗi mô tả vị trí hoặc hành động xảy ra lỗi (ví dụ: 'network/sendPost').
   */
  static log(error: any, context?: string) {
    if (__DEV__) {
      console.log(`[ErrorLogger] ${context ? context + ": " : ""}`, error);
    }

    // Đảm bảo Sentry được thông báo đúng cách
    Sentry.withScope((scope) => {
      if (context) {
        scope.setTag("context", context);
      }
      Sentry.captureException(error);
    });
  }

  /**
   * Gửi một tin nhắn thông báo lên Sentry dashboard.
   * @param message Nội dung tin nhắn.
   * @param level Mức độ nghiêm trọng (fatal, error, warning, log, info, debug).
   */
  static message(message: string, level: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug' = "info") {
    if (__DEV__) {
      console.log(`[ErrorLogger Message] [${level}]`, message);
    }
    Sentry.captureMessage(message, level);
  }
}

export default ErrorLogger;
