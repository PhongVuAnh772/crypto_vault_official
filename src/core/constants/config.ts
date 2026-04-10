/**
 * CONFIGURATION FILE
 * 
 * Replace NGROK_URL with your actual ngrok public URL.
 * Example: 'https://a1b2-c3d4.ngrok-free.app'
 * 
 * Note: For standard ngrok (free), this URL changes every time you restart ngrok.
 * If you want a fixed URL, use a 'Static Domain' in your ngrok dashboard.
 */

// Khi test trên Simulator/Emulator, hãy dùng 'http://localhost:3000'
// Khi test trên máy thật, hãy dùng IP của máy tính (VD: 'http://192.168.1.10:3000')
const NGROK_URL = 'http://localhost:3000'; 

export const CONFIG = {
  API_BASE_URL: NGROK_URL,
  WS_BASE_URL: NGROK_URL.replace('http', 'ws'),
};
