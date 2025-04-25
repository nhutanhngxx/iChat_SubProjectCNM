const GroupChat = require("../schemas/GroupChat");
const GroupMember = require("../schemas/GroupMember");
const User = require("../schemas/UserDetails");
const Message = require("../schemas/Messages");
const mongoose = require("mongoose");
const { uploadFile } = require("../services/upload-file");
const { get } = require("http");
const crypto = require("crypto");
const GroupInvitation = require("../schemas/GroupInvitation");

const GroupModel = {
  //   Lấy danh sách nhóm mà người dùng tham gia
  getUserGroups: async (userId) => {
    try {
      const groups = await GroupMember.find({ user_id: userId });
      const groupIds = groups.map((group) => group.group_id);
      const groupChats = await GroupChat.find({ _id: { $in: groupIds } });
      return groupChats;
    } catch (error) {
      console.error("Không tìm thấy các nhóm của người dùng:", error);
      throw new Error("Không tìm thấy group của người dùng");
    }
  },

  // Lấy danh sách thành viên của nhóm với thông tin đầy đủ
  getGroupMembers: async (groupId) => {
    try {
      // Chuyển đổi ID thành ObjectId nếu cần
      const groupObjectId = mongoose.isValidObjectId(groupId)
        ? new mongoose.Types.ObjectId(groupId)
        : groupId;

      // Sử dụng aggregate để join dữ liệu từ GroupMember và UserInfo
      const members = await GroupMember.aggregate([
        // Lọc theo group_id
        { $match: { group_id: groupObjectId, status: "approved" } },

        // Join với collection UserInfo để lấy thông tin user
        {
          $lookup: {
            from: "UserInfo",
            localField: "user_id",
            foreignField: "_id",
            as: "userDetails",
          },
        },

        // Giải phẳng mảng userDetails
        { $unwind: "$userDetails" },

        // Định dạng kết quả trả về
        {
          $project: {
            _id: 1,
            user_id: 1,
            group_id: 1,
            role: 1,
            joined_at: 1,
            full_name: "$userDetails.full_name",
            avatar_path: "$userDetails.avatar_path",
            status: "$userDetails.status",
            phone: "$userDetails.phone",
          },
        },

        // Sắp xếp: admin trước, sau đó theo thứ tự gia nhập
        { $sort: { role: -1, joined_at: 1 } },
      ]);

      if (!members || members.length === 0) {
        console.log("Không tìm thấy thành viên nào trong nhóm:", groupId);
      }

      return members;
    } catch (error) {
      console.error("Lỗi khi lấy thành viên nhóm:", error);
      throw new Error("Không thể lấy danh sách thành viên của nhóm");
    }
  },

  // Tìm kiếm nhóm
  searchGroup: async (keyword) => {
    try {
      const groups = await GroupChat.find({
        name: { $regex: keyword, $options: "i" }, // Tìm kiếm không phân biệt hoa thường
      }).sort({ created_at: -1 });
      return groups;
    } catch (error) {
      console.error("Lỗi tìm kiếm nhóm:", error);
      throw new Error("Lỗi tìm kiếm nhóm");
    }
  },

  // 1. Tạo Group mới
  createGroup: async ({ name, admin_id, avatar, participant_ids = [] }) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // Đảm bảo participant_ids luôn là mảng
      const participantArray = Array.isArray(participant_ids)
        ? participant_ids
        : participant_ids
        ? participant_ids.split(",")
        : [];

      // Xử lý avatar nếu có
      // let avatarUrl = null;
      // if (avatar) {
      //   avatarUrl = await uploadFile(avatar);
      // }

      // Xử lý avatar nếu có (Merge code)
      let avatarUrl =
        "https://nhutanhngxx.s3.ap-southeast-1.amazonaws.com/root/new-logo.png"; // default avatar
      if (avatar && avatar.buffer) {
        try {
          avatarUrl = await uploadFile({
            buffer: avatar.buffer,
            mimetype: avatar.mimetype,
            originalname: avatar.originalname,
            size: avatar.size,
          });
        } catch (error) {
          console.error("Lỗi upload avatar:", error);
          // Tiếp tục với avatar mặc định nếu upload thất bại
        }
      }

      // Tạo group
      const group = await GroupChat.create(
        [
          {
            name,
            admin_id,
            avatar:
              avatarUrl ||
              "https://nhutanhngxx.s3.ap-southeast-1.amazonaws.com/root/new-logo.png",
          },
        ],
        { session }
      );

      const gid = group[0]._id;

      // Tạo mảng thành viên với admin có role là "admin"
      const members = [];

      // Thêm admin với role="admin"
      members.push({
        group_id: gid,
        user_id: admin_id,
        role: "admin", // Thiết lập role admin
      });

      // Thêm các thành viên khác với role mặc định (member)
      if (participantArray.length > 0) {
        // Lọc ra các ID khác với admin để tránh trùng lặp
        const otherMembers = participantArray
          .filter((id) => String(id) !== String(admin_id))
          .map((uid) => ({
            group_id: gid,
            user_id: uid,
            // role mặc định là "member" từ schema
          }));

        members.push(...otherMembers);
      }

      await GroupMember.insertMany(members, { session });
      await session.commitTransaction();
      return group[0];
    } catch (err) {
      await session.abortTransaction();
      console.error("Lỗi khi tạo nhóm:", err);
      throw err;
    } finally {
      session.endSession();
    }
  },

  // 2. Thêm thành viên
  addMember: async (groupId, userId) => {
    return GroupMember.create({ group_id: groupId, user_id: userId });
  },

  // Thêm nhiều thành viên cùng lúc
  addMembers: async (groupId, userIds, inviterId) => {
    try {
      // Kiểm tra groupId và userIds
      const group = await GroupChat.findById(groupId);
      if (!group) {
        throw new Error("Nhóm không tồn tại");
      }

      // Chuyển đổi thành mảng nếu chỉ là một ID
      const userIdArray = Array.isArray(userIds) ? userIds : [userIds];

      // Chuyển đổi tất cả ID thành chuỗi để so sánh
      const userIdStrings = userIdArray.map((id) => String(id));

      // Kiểm tra các thành viên đã tồn tại trong nhóm
      const existingMembers = await GroupMember.find({
        group_id: groupId,
        user_id: { $in: userIdArray },
      });

      // Tạo danh sách ID đã tồn tại để lọc ra
      const existingIds = existingMembers.map((member) =>
        String(member.user_id)
      );

      // Lọc ra các ID chưa tồn tại trong nhóm
      const newUserIds = userIdStrings.filter(
        (id) => !existingIds.includes(id)
      );

      // Nếu không có thành viên mới để thêm
      if (newUserIds.length === 0) {
        return {
          added: [],
          skipped: existingIds,
          message: "Tất cả thành viên đã có trong nhóm",
        };
      }

      // Tạo mảng các đối tượng thành viên mới để thêm vào
      const membersToAdd = newUserIds.map((userId) => ({
        group_id: groupId,
        user_id: new mongoose.Types.ObjectId(userId),
        invited_by: inviterId,
        status: group.require_approval ? "pending" : "approved",
      }));

      // Thêm các thành viên mới
      const result = await GroupMember.insertMany(membersToAdd);

      return {
        // added: result.map((m) => String(m.user_id)),
        result,
        // skipped: existingIds,
        // message: `Đã thêm ${result.length} thành viên mới, bỏ qua ${existingIds.length} thành viên đã tồn tại`,
      };
    } catch (error) {
      console.error("Lỗi khi thêm nhiều thành viên:", error);
      throw error;
    }
  },

  // 3. Xóa thành viên / Rời nhóm
  removeMember: async (groupId, userId) => {
    return GroupMember.deleteOne({ group_id: groupId, user_id: userId });
  },

  // 4. Gửi tin nhắn nhóm
  sendGroupMessage: async ({ groupId, sender_id, content, type, file }) => {
    let messageContent = content;

    // Xử lý file nếu có
    if (file) {
      const fileUrl = await uploadFile(file);
      messageContent = fileUrl;
    }

    const msg = await Message.create({
      sender_id,
      chat_type: "group",
      receiver_id: groupId,
      content: messageContent,
      type,
    });

    return msg;
  },

  // 5. Đổi tên Group / Set avatar
  updateGroup: async (
    groupId,
    { name, avatar, allow_add_members, allow_change_name, allow_change_avatar }
  ) => {
    try {
      const update = {};

      // Chỉ cập nhật tên nếu có
      if (name) {
        update.name = name;
      }

      // Chỉ cập nhật avatar nếu có
      if (avatar) {
        const avatarUrl = await uploadFile(avatar);
        update.avatar = avatarUrl; // Sửa từ avatarUrl thành avatar để phù hợp
      }

      update.allow_add_members = allow_add_members;
      update.allow_change_name = allow_change_name;
      update.allow_change_avatar = allow_change_avatar;

      return GroupChat.findByIdAndUpdate(groupId, update, { new: true });
    } catch (error) {
      console.error("Lỗi cập nhật nhóm:", error);
      throw error;
    }
  },

  // 6. Phân quyền (role: "admin"||"member")
  setRole: async (groupId, userId, role) => {
    return GroupMember.findOneAndUpdate(
      { group_id: groupId, user_id: userId },
      { role },
      { new: true }
    );
  },

  // 7. Xóa nhóm (chỉ creator || admin chính)
  deleteGroup: async (groupId) => {
    await GroupMember.deleteMany({ group_id: groupId });
    return GroupChat.findByIdAndDelete(groupId);
  },

  // 8. Tìm kiếm tin nhắn trong group
  searchMessages: async (groupId, keyword) => {
    return Message.find({
      chat_type: "group",
      receiver_id: groupId,
      content: { $regex: keyword, $options: "i" },
    }).sort({ timestamp: -1 });
  },

  // 9 Lấy thông tin nhóm theo ID
  getGroupById: async (groupId) => {
    try {
      const group = await GroupChat.findById(groupId);
      if (!group) {
        throw new Error("Nhóm không tồn tại");
      }
      return group;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin nhóm:", error);
      throw error;
    }
  },

  // 10. Kiểm tra xem người dùng có phải là admin phụ (phó nhóm) của nhóm không
  isGroupSubAdmin: async (groupId, userId) => {
    try {
      // Chuyển đổi ID thành ObjectId nếu cần
      const groupObjectId = mongoose.isValidObjectId(groupId)
        ? new mongoose.Types.ObjectId(groupId)
        : groupId;

      const userObjectId = mongoose.isValidObjectId(userId)
        ? new mongoose.Types.ObjectId(userId)
        : userId;

      // Kiểm tra role trong GroupMember
      const memberInfo = await GroupMember.findOne({
        group_id: groupObjectId,
        user_id: userObjectId,
      });

      if (!memberInfo) {
        return {
          isSubAdmin: false,
          message: "Người dùng không phải là thành viên của nhóm",
        };
      }

      // Kiểm tra xem là admin phụ không (role là admin trong GroupMember)
      if (memberInfo.role === "admin") {
        // Kiểm tra xem có phải admin chính không
        const group = await GroupChat.findById(groupObjectId);

        if (!group) {
          return {
            isSubAdmin: false,
            message: "Nhóm không tồn tại",
          };
        }

        // Nếu không phải admin chính nhưng có role admin => admin phụ
        const isMainAdmin = String(group.admin_id) === String(userObjectId);
        const isSubAdmin = !isMainAdmin && memberInfo.role === "admin";

        return {
          isSubAdmin: isSubAdmin,
          isMainAdmin: isMainAdmin,
          role: memberInfo.role,
          message: isSubAdmin
            ? "Người dùng là admin phụ của nhóm"
            : isMainAdmin
            ? "Người dùng là admin chính của nhóm"
            : "Người dùng là thành viên thường của nhóm",
        };
      }

      // Nếu role không phải admin
      return {
        isSubAdmin: false,
        role: memberInfo.role,
        message: "Người dùng là thành viên thường của nhóm",
      };
    } catch (error) {
      console.error("Lỗi khi kiểm tra quyền admin phụ:", error);
      throw new Error("Không thể kiểm tra quyền admin phụ của nhóm");
    }
  },

  transferAdmin: async (groupId, userId) => {
    try {
      // Cập nhật admin_id trong GroupChat
      const updatedGroup = await GroupChat.findByIdAndUpdate(
        groupId,
        { admin_id: userId },
        { new: true }
      );

      if (!updatedGroup) {
        throw new Error("Nhóm không tồn tại");
      }

      return updatedGroup;
    } catch (error) {
      console.error("Lỗi khi chuyển nhường quyền admin:", error);
      throw error;
    }
  },
  // Tạo lời mời nhóm
  createGroupInvitation: async (
    groupId,
    userId,
    expiresInHours = 24,
    maxUses = null
  ) => {
    // Kiểm tra xem nhóm có tồn tại không
    const group = await GroupChat.findById(groupId);
    if (!group) {
      throw new Error("Không tìm thấy nhóm");
    }

    // Kiểm tra xem người tạo có phải là thành viên nhóm
    const isMember = await GroupMember.findOne({
      group_id: groupId,
      user_id: userId,
    });

    if (!isMember) {
      throw new Error("Bạn không phải là thành viên của nhóm này");
    }
    const existingInvite = await GroupInvitation.findOne({
      group_id: groupId,
      active: true,
      expires_at: { $gt: new Date() },
      max_uses: maxUses,
    });

    if (existingInvite) {
      return existingInvite; // Trả về lời mời hiện có thay vì tạo mới
    }

    // Tạo token ngẫu nhiên
    const token = crypto.randomBytes(16).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    // Tạo lời mời mới
    const invitation = await GroupInvitation.create({
      group_id: groupId,
      token,
      created_by: userId,
      expires_at: expiresAt,
      max_uses: maxUses,
      use_count: 0,
      active: true,
    });

    return invitation;
  },

  // Xác thực và sử dụng lời mời
  validateAndJoinGroup: async (token, userId) => {
    // Tìm lời mời theo token
    const invitation = await GroupInvitation.findOne({
      token,
      active: true,
      expires_at: { $gt: new Date() },
    });

    if (!invitation) {
      throw new Error("Lời mời không hợp lệ hoặc đã hết hạn");
    }

    // Kiểm tra số lần sử dụng
    if (invitation.max_uses && invitation.use_count >= invitation.max_uses) {
      throw new Error("Lời mời đã đạt giới hạn sử dụng");
    }

    // Kiểm tra xem người dùng đã là thành viên chưa
    const existingMember = await GroupMember.findOne({
      group_id: invitation.group_id,
      user_id: userId,
    });

    if (existingMember) {
      throw new Error("Bạn đã là thành viên của nhóm này");
    }

    // Thêm người dùng vào nhóm (nếu thành viên đã có thì không thêm chỉ cập nhật)
    await GroupMember.updateOne(
      { group_id: invitation.group_id, user_id: userId },
      { $setOnInsert: { role: "member", joined_at: new Date() } },
      { upsert: true }
    );

    // Cập nhật số lần sử dụng
    invitation.use_count += 1;
    await invitation.save();

    // Lấy thông tin nhóm để trả về
    const group = await GroupChat.findById(invitation.group_id);
    return group;
  },

  // Hủy lời mời
  revokeInvitation: async (inviteId, userId) => {
    const invitation = await GroupInvitation.findById(inviteId);

    if (!invitation) {
      throw new Error("Không tìm thấy lời mời");
    }

    // Kiểm tra quyền (chỉ người tạo hoặc admin nhóm mới có thể hủy)
    const group = await GroupChat.findById(invitation.group_id);
    const isAdmin = group.admin_id.toString() === userId.toString();
    const isCreator = invitation.created_by.toString() === userId.toString();

    if (!isAdmin && !isCreator) {
      throw new Error("Bạn không có quyền hủy lời mời này");
    }

    invitation.active = false;
    await invitation.save();

    return invitation;
  },

  // Lấy danh sách lời mời của nhóm
  getGroupInvitations: async (groupId, userId) => {
    // Kiểm tra xem người dùng có quyền xem không (là thành viên nhóm)
    const member = await GroupMember.findOne({
      group_id: groupId,
      user_id: userId,
    });
    console.log("Group ID:", groupId);
    console.log("User ID:", userId);
    console.log("Member:", member);

    if (!member) {
      throw new Error("Bạn không phải là thành viên của nhóm này");
    }

    // Lấy các lời mời còn hoạt động
    const invitations = await GroupInvitation.find({
      group_id: groupId,
      active: true,
      expires_at: { $gt: new Date() },
    }).populate("created_by", "full_name avatar_path");

    return invitations;
  },
  // Kiểm tra trạn thái của phê duyệt thành viên của nhóm
  checkMemberApproval: async (groupId) => {
    try {
      const group = await GroupChat.findById(groupId);
      if (!group) {
        throw new Error("Nhóm không tồn tại");
      }
      return group.require_approval;
    } catch (error) {
      console.error("Lỗi khi kiểm tra trạng thái phê duyệt thành viên:", error);
      throw error;
    }
  },

  // Cập nhật trạng thái của phê duyệt thành viên của nhóm
  updateMemberApproval: async ({ groupId, requireApproval }) => {
    try {
      const updatedGroup = await GroupChat.findByIdAndUpdate(
        groupId,
        { require_approval: requireApproval },
        { new: true }
      );
      if (!updatedGroup) {
        throw new Error("Nhóm không tồn tại");
      }
      return updatedGroup;
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái phê duyệt thành viên:", error);
      throw error;
    }
  },

  // Lấy danh sách yêu cầu tham gia nhóm đang đợi được duyệt
  getPendingMembers: async (groupId) => {
    try {
      const pendingMembers = await GroupMember.aggregate([
        {
          $match: {
            group_id: new mongoose.Types.ObjectId(groupId),
            status: "pending",
          },
        },
        {
          $lookup: {
            from: "UserInfo",
            localField: "user_id",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $lookup: {
            from: "UserInfo",
            localField: "invited_by",
            foreignField: "_id",
            as: "inviterDetails",
          },
        },
        {
          $unwind: "$userDetails",
        },
        {
          $unwind: "$inviterDetails",
        },
        {
          $project: {
            _id: 1,
            user_id: 1,
            status: 1,
            requested_at: "$joined_at",
            member: {
              _id: "$userDetails._id",
              full_name: "$userDetails.full_name",
              avatar_path: "$userDetails.avatar_path",
            },
            invited_by: {
              _id: "$inviterDetails._id",
              full_name: "$inviterDetails.full_name",
              avatar_path: "$inviterDetails.avatar_path",
            },
          },
        },
      ]);

      return pendingMembers;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách yêu cầu tham gia:", error);
      throw error;
    }
  },

  // Lấy danh sách thành viên được mời bởi bạn
  getInvitedMembersByUserId: async (userId) => {
    try {
      const invitedMembers = await GroupMember.aggregate([
        {
          $match: {
            invited_by: new mongoose.Types.ObjectId(userId),
            status: "approved",
          },
        },
        {
          $lookup: {
            from: "UserInfo",
            localField: "user_id",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: "$userDetails",
        },
        {
          $project: {
            _id: 1,
            user_id: 1,
            status: 1,
            joined_at: "$joined_at",
            member: {
              _id: "$userDetails._id",
              full_name: "$userDetails.full_name",
              avatar_path: "$userDetails.avatar_path",
            },
          },
        },
      ]);

      return invitedMembers;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách thành viên được mời:", error);
      throw error;
    }
  },

  // Chấp nhận thành viên vào nhóm
  acceptMember: async ({ groupId, memberId }) => {
    try {
      return await GroupMember.findOneAndUpdate(
        { group_id: groupId, user_id: memberId },
        { status: "approved" },
        { new: true }
      );
    } catch (error) {
      console.error("Lỗi khi chấp nhận thành viên:", error);
      throw error;
    }
  },

  // Từ chối thành viên vào nhóm
  rejectMember: async ({ groupId, memberId }) => {
    try {
      return await GroupMember.findOneAndDelete({
        group_id: groupId,
        user_id: memberId,
        status: "pending",
      });
    } catch (error) {
      console.error("Lỗi khi từ chối thành viên:", error);
      throw error;
    }
  },
};

module.exports = GroupModel;
