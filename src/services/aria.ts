import { sendMessage } from "./api";

class ARIA {
  async execute(message: string) {
    return sendMessage(message);
  }
}

export default new ARIA();
