const { v4: uuidv4 } = require("uuid");
const sessionStore = require("../utils/sessionStore");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET;

module.exports = {
  async generateSession() {
    const sessionId = uuidv4();
    await sessionStore.createSession(sessionId);
    console.log("PID generateSession:", process.pid);
    return sessionId;
  },

  async validateAndLogin(sessionId, userInfo) {
    const session = await sessionStore.getSession(sessionId);
    if (!session) return false;

    await sessionStore.updateSession(sessionId, {
      isLoggedIn: true,
      userInfo,
    });

    return true;
  },
};
