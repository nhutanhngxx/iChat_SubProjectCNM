const Redis = require("ioredis");

const redis = new Redis({
  host: "localhost",
  port: 6379,
  maxRetriesPerRequest: 5,
  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  },
});

module.exports = {
  // Tạo session ban đầu
  async createSession(sessionId) {
    const sessionData = {
      createdAt: Date.now(),
      isLoggedIn: false,
    };
    await redis.set(
      `session:${sessionId}`,
      JSON.stringify(sessionData),
      "EX",
      300 // 5 phút
    );
  },

  // Lấy session
  async getSession(sessionId) {
    const sessionStr = await redis.get(`session:${sessionId}`);
    if (!sessionStr) return null;

    const session = JSON.parse(sessionStr);
    console.log("📦 Lấy session từ Redis của store:", sessionId, session);
    return session;
  },

  // Cập nhật session (VD: thêm userInfo)
  async updateSession(sessionId, data) {
    const existing = await this.getSession(sessionId);
    if (!existing) return;

    const updated = { ...existing, ...data };
    await redis.set(`session:${sessionId}`, JSON.stringify(updated), "EX", 300);
  },

  // Xoá session nếu cần sau khi login xong
  async deleteSession(sessionId) {
    await redis.del(`session:${sessionId}`);
  },

  // Liên kết sessionId với socketId (web)
  async registerSocket(sessionId, socketId) {
    await redis.set(`socket:${sessionId}`, socketId, "EX", 300);
  },

  // Lấy socketId theo sessionId
  async getSocketId(sessionId) {
    return await redis.get(`socket:${sessionId}`);
  },

  // Khi socket bị disconnect → xóa khỏi Redis
  async removeSocketById(socketId) {
    const keys = await redis.keys("socket:*");
    for (const key of keys) {
      const val = await redis.get(key);
      if (val === socketId) {
        await redis.del(key);
        break;
      }
    }
  },
};
