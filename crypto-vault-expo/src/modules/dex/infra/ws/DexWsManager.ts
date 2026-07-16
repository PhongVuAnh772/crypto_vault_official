type WsHandler = (payload: any) => void;

export class DexWsManager {
  private ws: WebSocket | null = null;
  private handlers = new Map<string, WsHandler>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;
  private shouldRun = false;

  constructor(private readonly wsUrl: string, private readonly authToken: string) {}

  connect() {
    this.shouldRun = true;
    this.open();
  }

  disconnect() {
    this.shouldRun = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }

  subscribe(channel: string, handler: WsHandler) {
    this.handlers.set(channel, handler);
    this.send({ type: "subscribe", channels: [channel] });
  }

  unsubscribe(channel: string) {
    this.handlers.delete(channel);
    this.send({ type: "unsubscribe", channels: [channel] });
  }

  private open() {
    this.ws = new WebSocket(this.wsUrl);
    this.ws.onopen = () => {
      this.reconnectAttempt = 0;
      this.send({ type: "auth", token: this.authToken });
      if (this.handlers.size > 0) {
        this.send({ type: "subscribe", channels: Array.from(this.handlers.keys()) });
      }
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const channel = message.channel;
      if (!channel) return;
      this.handlers.get(channel)?.(message);
    };

    this.ws.onclose = () => this.scheduleReconnect();
    this.ws.onerror = () => this.scheduleReconnect();
  }

  private scheduleReconnect() {
    if (!this.shouldRun) return;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    const delay = Math.min(30000, 1000 * 2 ** this.reconnectAttempt);
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => this.open(), delay);
  }

  private send(payload: Record<string, unknown>) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify(payload));
  }
}

