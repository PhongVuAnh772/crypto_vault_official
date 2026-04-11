const WebSocket = require('ws');
console.log('Connecting...');
const ws = new WebSocket('wss://cryptovault-backend-latest.onrender.com/');
ws.on('open', () => {
  console.log('CONNECTED');
  process.exit(0);
});
ws.on('error', (err) => {
  console.log('ERROR:', err.message);
  process.exit(1);
});
ws.on('close', (code, reason) => {
  console.log('CLOSED:', code, reason.toString());
  process.exit(1);
});
