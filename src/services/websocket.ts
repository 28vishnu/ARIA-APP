import { ENV } from "@/config/env";

class ARIAWebSocket {
  private socket: WebSocket | null = null;

  connect() {
    if (this.socket) return;

    this.socket = new WebSocket(ENV.WS_URL);

    this.socket.onopen = () => {
      console.log("ARIA WebSocket Connected");
    };

    this.socket.onclose = () => {
      console.log("ARIA WebSocket Closed");
    };

    this.socket.onerror = (error) => {
      console.error(error);
    };
  }

  disconnect() {
    this.socket?.close();

    this.socket = null;
  }

  send(data: unknown) {
    if (
      this.socket &&
      this.socket.readyState === WebSocket.OPEN
    ) {
      this.socket.send(JSON.stringify(data));
    }
  }

  onMessage(callback: (message: string) => void) {
    if (!this.socket) return;

    this.socket.onmessage = (event) => {
      callback(event.data);
    };
  }
}

const websocket = new ARIAWebSocket();

export default websocket;
