export class FakeWebSocketServer {
    constructor() {
      this.clients = new Set();
      this.messageInterval = undefined;
    }

    start() {
      // Simulate incoming messages from clients
      this.messageInterval = setInterval(() => {
        const randomClient = Array.from(this.clients)[Math.floor(Math.random() * this.clients.size)];
        const randomMessage = this.generateRandomMessage();
        this.sendToClient(randomClient, randomMessage);
      }, 3000); // Send a message every 3 seconds

      console.log(`Start fake server`);

    }

    stop() {
      clearInterval(/** @type {{ id: number | undefined; }} */ this.messageInterval);
    }

    /**
     * @param {{ onmessage: ((event: any) => void) | ((event: any) => void); }} client
     */
    connect(client) {
      this.clients.add(client);
      console.log(`Client connected. Total clients: ${this.clients.size}`);
    }

    /**
     * @param {{ onmessage: (event: any) => void; }} client
     */
    disconnect(client) {
      this.clients.delete(client);
      console.log(`Client disconnected. Total clients: ${this.clients.size}`);
    }

    /**
     * @param {{ onmessage: (arg0: { data: any; }) => void; }} client
     * @param {string} message
     */
    sendToClient(client, message) {
      if (this.clients.has(client)) {
        client.onmessage({ data: message });
      }
    }

    generateRandomMessage() {
      const messages = [
        "안녕하세요! 오늘은 어떻게 지내셨나요?",
        "지금은 어떤 기분인가요?",
        "오늘의 목표는 무엇인가요? 저에게 이야기해보세요.",
        "지금은 조금 지루하신가요? 함께 이야기를 나누며 시간을 보내보는 건 어떨까요?",
        "최근에 무슨 일이 있었나요? 이야기해주실래요?",
        "오늘의 날씨는 어떤가요? 날씨에 따라 기분이 달라질 수 있어요.",
        "어떤 새로운 도전을 하고 싶으세요? 함께 계획을 세워보는 건 어떨까요?",
        "최근에 본 좋은 영화나 듣고 싶은 음악이 있나요? 공유해주세요!",
        "고양이와 개 중에 어떤 동물을 더 좋아하시나요? 그 이유도 함께 이야기해주세요.",
        "최근에 읽은 책이 있나요? 인상 깊었던 내용을 나누어주세요."
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }
}