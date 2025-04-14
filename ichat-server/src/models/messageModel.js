const Messages = require("../schemas/Messages");
const MessageCard = require("../schemas/MessageCard");
const GroupChat = require("../schemas/GroupChat");
const GroupMembers = require("../schemas/GroupMember");
const mongoose = require("mongoose");
const { uploadFile } = require("../services/uploadImageToS3");

const MessageModel = {
  searchMessages: async (keyword, userId) => {
    if (!keyword)
      throw { status: 400, message: "Từ khóa tìm kiếm là bắt buộc" };
    if (!userId) throw { status: 400, message: "ID người dùng là bắt buộc" };

    try {
      const query = {
        $and: [
          { content: { $regex: keyword, $options: "i" } }, // Tìm kiếm không phân biệt hoa thường
          { content: { $ne: "Tin nhắn đã được thu hồi" } }, // Loại bỏ tin nhắn thu hồi
          {
            $or: [
              // Tin nhắn cá nhân
              {
                chat_type: "private",
                $or: [
                  { sender_id: new mongoose.Types.ObjectId(userId) },
                  { receiver_id: new mongoose.Types.ObjectId(userId) },
                ],
              },
              // Tin nhắn nhóm
              {
                chat_type: "group",
                receiver_id: {
                  $in: await GroupChat.find({
                    members: new mongoose.Types.ObjectId(userId),
                  }).distinct("_id"),
                },
              },
            ],
          },
        ],
      };

      const messages = await Messages.find(query)
        .sort({ timestamp: -1 }) // Sắp xếp mới nhất trước
        .populate("sender_id", "full_name avatar_path") // Lấy thông tin người gửi
        .populate("receiver_id", "full_name avatar_path"); // Lấy thông tin người nhận hoặc nhóm

      return messages;
    } catch (error) {
      console.error("Lỗi khi tìm kiếm tin nhắn:", error);
      throw {
        status: error.status || 500,
        message: "Lỗi server khi tìm kiếm tin nhắn",
      };
    }
  },

  uploadImage: async ({ sender_id, receiver_id, chat_type, file }) => {
    if (!file || !sender_id || !receiver_id || !chat_type) {
      throw { status: 400, message: "Thiếu dữ liệu" };
    }

    const imageUrl = await uploadFile(file);
    const newMessage = new Messages({
      sender_id,
      receiver_id,
      content: imageUrl,
      type: "image",
      chat_type,
    });

    await newMessage.save();
    return newMessage;
  },

  sendMessage: async ({
    sender_id,
    receiver_id,
    content,
    type,
    chat_type,
    file,
  }) => {
    if (!sender_id || !receiver_id || !chat_type || (!content && !file)) {
      throw { status: 400, message: "Thiếu dữ liệu" };
    }

    let messageContent = content;
    if (file) {
      const imageUrl = await uploadFile(file);
      messageContent = imageUrl;
    }

    const newMessage = new Messages({
      sender_id,
      receiver_id,
      content: messageContent,
      type,
      chat_type,
    });

    await newMessage.save();
    return newMessage;
  },

  sendGroupMessage: async ({ sender_id, receiver_id, content, type }) => {
    const groupChat = await GroupChat.findOne({ chat_id: receiver_id });
    if (!groupChat) {
      throw { status: 404, message: "Group chat not found" };
    }

    const newMessage = new Messages({
      sender_id,
      receiver_id,
      content,
      type,
      chat_type: "group",
      status: "send",
    });
    await newMessage.save();

    const groupMembers = await GroupMembers.find({
      group_id: receiver_id,
    }).select("user_id");
    const messageCards = groupMembers
      .filter((member) => member.user_id.toString() !== sender_id.toString())
      .map((member) => ({
        receiver_id: member.user_id,
        message_id: newMessage._id,
        status: "unread",
        card_color: "#FF0000",
        title: `New message in group ${groupChat.name}`,
      }));

    await MessageCard.insertMany(messageCards);

    return { message: newMessage, group: groupChat.name };
  },

  getUserMessages: async (userId) => {
    return await Messages.find({
      $or: [{ sender_id: userId }, { receiver_id: userId }],
    }).sort({ createdAt: 1 });
  },

  getPrivateMessages: async (userId, receiverId) => {
    return await Messages.find({
      $or: [
        { sender_id: userId, receiver_id: receiverId },
        { sender_id: receiverId, receiver_id: userId },
      ],
    }).sort({ createdAt: 1 });
  },

  deleteAllMessages: async (userId, receiverId) => {
    await Messages.deleteMany({
      $or: [
        { sender_id: userId, receiver_id: receiverId },
        { sender_id: receiverId, receiver_id: userId },
      ],
    });
  },

  recallMessage: async (messageId) => {
    const message = await Messages.findById(messageId);
    if (!message) throw { status: 404, message: "Message not found" };

    message.type = "text";
    message.content = "Tin nhắn đã được thu hồi";
    await message.save();
    return message;
  },

  addReaction: async ({ messageId, user_id, reaction_type }) => {
    const message = await Messages.findById(messageId);
    if (!message) throw { status: 404, message: "Message not found" };

    const validReactions = ["like", "love", "haha", "wow", "sad", "angry"];
    if (!validReactions.includes(reaction_type)) {
      throw { status: 400, message: "Invalid reaction type" };
    }

    const existingReaction = message.reactions.find(
      (r) => r.user_id.toString() === user_id
    );

    if (existingReaction) {
      existingReaction.reaction_type = reaction_type;
    } else {
      message.reactions.push({ user_id, reaction_type });
    }

    await message.save();
    return message;
  },

  removeReaction: async (messageId, userId) => {
    const message = await Messages.findByIdAndUpdate(
      messageId,
      { $pull: { reactions: { user_id: userId } } },
      { new: true }
    );
    if (!message) throw { status: 404, message: "Message not found" };
    return message;
  },

  pinMessage: async (messageId, is_pinned) => {
    const message = await Messages.findById(messageId);
    if (!message) throw { status: 404, message: "Message not found" };

    message.is_pinned = is_pinned;
    await message.save();
    return message;
  },

  getPinnedMessages: async (chatId) => {
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      throw { status: 400, message: "Invalid chat ID" };
    }

    return await Messages.find({
      receiver_id: new mongoose.Types.ObjectId(chatId),
      is_pinned: true,
    });
  },
};

module.exports = MessageModel;
