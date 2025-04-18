const Messages = require("../schemas/Messages");
const MessageCard = require("../schemas/MessageCard");
const GroupChat = require("../schemas/GroupChat");
const GroupMembers = require("../schemas/GroupMember");
const mongoose = require("mongoose");
const { uploadFile } = require("../services/upload-file");

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

  recallMessage: async (messageId, userId) => {
    const message = await Messages.findById(messageId);
    if (!message) {
      throw { status: 404, message: "Không tìm thấy tin nhắn cần thu hồi!" };
    }

    // Kiểm tra xem người gửi tin nhắn có phải là người đang đăng nhập không
    if (message.sender_id.toString() !== userId.toString()) {
      throw {
        status: 403,
        message: "Chỉ có thể thu hồi tin nhắn của chính mình thui!",
      };
    }

    // Cập nhật các trường cần thiết
    message.type = "text";
    message.content = "Tin nhắn đã được thu hồi";
    message.reactions = []; // Xóa tất cả reactions
    message.reply_to = null; // Xóa liên kết reply_to

    await message.save();
    return message;
  },

  addReaction: async ({ messageId, user_id, reaction_type }) => {
    const message = await Messages.findById(messageId);
    if (!message)
      throw {
        status: 404,
        message: "Không tìm thấy tin nhắn muốn thả react rồi!",
      };

    const validReactions = ["like", "love", "haha", "wow", "sad", "angry"];
    if (!validReactions.includes(reaction_type)) {
      throw { status: 400, message: "Kiểu reaction không hợp lệ!" };
    }

    // Tìm xem user đã từng thả cùng loại reaction này chưa
    const reactionIndex = message.reactions.findIndex(
      (r) =>
        r.user_id.toString() === user_id.toString() &&
        r.reaction_type === reaction_type
    );

    if (reactionIndex !== -1) {
      // Nếu đã thả rồi → gỡ bỏ reaction đó
      message.reactions.splice(reactionIndex, 1);
    } else {
      // Nếu chưa thả → thêm mới reaction này
      message.reactions.push({
        user_id,
        reaction_type,
        timestamp: new Date(),
      });
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

  forwardMessage: async (messageId, receiverId, currentUserId) => {
    const message = await Messages.findById(messageId);
    if (!message) {
      throw { status: 404, message: "Không tìm thấy tin nhắn để chuyển tiếp" };
    }

    // Không cho phép gửi tin nhắn cho chính mình
    if (receiverId.toString() === currentUserId.toString()) {
      throw {
        status: 400,
        message: "Không thể chuyển tiếp tin nhắn cho chính mình",
      };
    }

    const newMessage = new Messages({
      sender_id: currentUserId,
      receiver_id,
      content: message.content,
      type: message.type,
      chat_type: message.chat_type,
    });

    await newMessage.save();
    return newMessage;
  },

  // "Soft delete" - chỉ đánh dấu xóa cho User hiện tại
  softDeleteMessagesForUser: async (userId, messageId) => {
    // Cập nhật chỉ 1 tin nhắn duy nhất nếu chưa chứa userId trong isdelete
    await Messages.updateOne(
      { _id: messageId, isdelete: { $ne: userId } },
      { $push: { isdelete: userId } }
    );

    // Trả về tin nhắn vừa cập nhật (nếu vẫn còn hiển thị cho user đó)
    const message = await Messages.findOne({
      _id: messageId,
    });

    return message; // hoặc return null nếu user đã xóa
  },
};

module.exports = MessageModel;
