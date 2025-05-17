module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Client connected - Group:", socket.id);

    // Tham gia room theo groupId
    socket.on("join-room", (groupId) => {
      socket.join(groupId);
      // console.log(` Socket ${socket.id} joined room: ${groupId}`);
    });
    //lawng nghe tao nhom
    socket.on("create-group", (groupId, groupData) => {
      console.log("Create group:", groupId, groupData);
      // io.to(groupId).emit("group-created", groupId, groupData);
      // Emit đến người tạo nhóm
      socket.emit("group-created", groupId, groupData);

      // Emit đến tất cả thành viên được mời
      if (
        groupData.participant_ids &&
        Array.isArray(groupData.participant_ids)
      ) {
        groupData.participant_ids.forEach((userId) => {
          // Đảm bảo không gửi trùng lặp đến người tạo
          if (userId !== socket.userId && userId !== groupData.admin_id) {
            io.to(userId).emit("group-created", groupId, groupData);
          }
        });
      }
    });
    // Lắng nghe rời room theo groupId
    socket.on("leave-room", (groupId) => {
      socket.leave(groupId);
      console.log(` Socket ${socket.id} left room: ${groupId}`);
    });

    // Lắng nghe sự kiện thêm thành viên mới
    socket.on("add-members", ({ groupId, userIds }) => {
      console.log("Add member:", groupId, userIds);
      io.to(groupId).emit("members-added", { groupId, userIds });
    });

    // Lắng nghe sự kiện xóa thành viên
    socket.on("remove-member", ({ groupId, userId }) => {
      console.log("Remove member:", groupId, userId);
      io.to(groupId).emit("member-removed", { groupId, userId });
    });

    // Lắng nghe sự kiện cập nhật thông tin nhóm
    socket.on("update-group", ({ groupId, name, avatar }) => {
      console.log("Update group:", groupId, name, avatar);
      io.in(groupId).emit("group-updated", { groupId, name, avatar });

      const room = io.sockets.adapter.rooms.get(groupId);
      console.log(
        `Broadcasted to room ${groupId}, connected clients:`,
        room ? room.size : 0
      );
    });

    // Lắng nghe sự kiện giải tán/xóa nhóm
    socket.on("delete-group", (groupId) => {
      console.log("Delete group:", groupId);
      io.to(groupId).emit("group-deleted", groupId);
    });

    // Lắng nghe sự kiện rời nhóm
    socket.on("leave-group", ({ groupId, userId }) => {
      console.log("Leave group:", groupId, userId);
      io.to(groupId).emit("member-left", { groupId, userId });
    });

    // Lắng nghe sự kiện chuyển quyền quản trị viên
    socket.on("transfer-admin", ({ groupId, userId }) => {
      console.log("Transfer admin:", groupId, userId);
      io.to(groupId).emit("admin-transferred", { groupId, userId });
    });

    // Lắng nghe sự kiện cập nhật quyền thành viên
    socket.on("set-role", ({ groupId, userId, role }) => {
      console.log("Set role:", groupId, userId, role);
      io.to(groupId).emit("role-updated", { groupId, userId, role });
    });

    // Lắng nghe sự kiện cập nhật trạng thái phê duyệt thành viên
    socket.on("update-member-approval", ({ groupId, requireApproval }) => {
      console.log("Update member approval:", groupId, requireApproval);
      io.to(groupId).emit("member-approval-updated", {
        groupId,
        requireApproval,
      });
    });

    // Lắng nghe sự kiện chấp nhận thành viên vào nhóm
    socket.on("accept-member", ({ groupId, memberId }) => {
      console.log("Accept member:", groupId, memberId);
      io.to(groupId).emit("member-accepted", { groupId, memberId });
    });

    // Lắng nghe sự kiện từ chối thành viên vào nhóm
    socket.on("reject-member", ({ groupId, memberId }) => {
      console.log("Reject member:", groupId, memberId);
      io.to(groupId).emit("member-rejected", { groupId, memberId });
    });
  });
};
