import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// const API_URL = "http://localhost:5001/messages/";
const API_URL = `http://${window.location.hostname}:5001/api/groups/`;

// Lấy danh sách nhóm mà người dùng tham gia
export const getUserGroups = createAsyncThunk(
  "groups/getUserGroups",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}${userId}`);
      const data = await response.json();

      if (data.status === "error") {
        return rejectWithValue(data.message);
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Tìm kiếm nhóm
export const searchGroup = createAsyncThunk(
  "groups/searchGroup",
  async (keyword, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}search?search=${keyword}`);
      const data = await response.json();

      if (data.status === "error") {
        return rejectWithValue(data.message);
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Lấy danh sách thành viên của nhóm
export const getGroupMembers = createAsyncThunk(
  "groups/getGroupMembers",
  async (groupId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}${groupId}/members`);
      const data = await response.json();

      if (data.status === "error") {
        return rejectWithValue(data.message);
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Tạo nhóm mới
export const createGroup = createAsyncThunk(
  "groups/createGroup",
  async ({ name, admin_id, avatar, participant_ids }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("admin_id", admin_id);

      if (avatar) {
        formData.append("avatar", avatar);
      }

      // Xử lý participant_ids
      if (Array.isArray(participant_ids)) {
        formData.append("participant_ids", JSON.stringify(participant_ids));
      } else if (participant_ids) {
        formData.append("participant_ids", participant_ids);
      }

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.status === "error") {
        return rejectWithValue(data.message);
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thêm thành viên vào nhóm
export const addMember = createAsyncThunk(
  "groups/addMember",
  async ({ groupId, userId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}add-member`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupId, userId }),
      });

      const data = await response.json();

      if (data.status === "error") {
        return rejectWithValue(data.message);
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thêm nhiều thành viên vào nhóm
export const addMembers = createAsyncThunk(
  "groups/addMembers",
  async ({ groupId, userIds, inviterId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}add-members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupId, userIds, inviterId }),
      });

      const data = await response.json();

      if (data.status === "error") {
        return rejectWithValue(data.message);
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Xóa thành viên khỏi nhóm
export const removeMember = createAsyncThunk(
  "groups/removeMember",
  async ({ groupId, userId, adminId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}remove-member`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupId, userId, adminId }),
      });

      const data = await response.json();

      if (data.status === "error") {
        return rejectWithValue(data.message);
      }

      return { groupId, userId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Cập nhật thông tin nhóm
export const updateGroup = createAsyncThunk(
  "groups/updateGroup",
  async (
    {
      groupId,
      name,
      avatar,
      allow_add_members,
      allow_change_name,
      allow_change_avatar,
      currentUserId,
    },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();

      if (name) {
        formData.append("name", name);
      }

      if (avatar) {
        formData.append("avatar", avatar);
      }
      formData.append("allow_add_members", allow_add_members.toString());
      formData.append("allow_change_name", allow_change_name.toString());
      formData.append("allow_change_avatar", allow_change_avatar.toString());
      formData.append("currentUserId", currentUserId);
      const response = await fetch(`${API_URL}${groupId}`, {
        method: "PUT",
        body: formData,
      });

      const data = await response.json();

      if (data.status === "error") {
        return rejectWithValue(data.message);
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Xóa nhóm
export const deleteGroup = createAsyncThunk(
  "groups/deleteGroup",
  async (groupId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}${groupId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.status === "error") {
        return rejectWithValue(data.message);
      }

      return groupId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Gửi tin nhắn nhóm
export const sendGroupMessage = createAsyncThunk(
  "groups/sendGroupMessage",
  async ({ groupId, sender_id, content, type, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      formData.append("sender_id", sender_id);
      formData.append("content", content);
      formData.append("type", type || "text");

      if (file) {
        if (type === "image") {
          formData.append("image", file);
        } else {
          formData.append("file", file);
        }
      }

      const response = await fetch(`${API_URL}${groupId}/messages`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.status === "error") {
        return rejectWithValue(data.message);
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Tìm kiếm tin nhắn trong nhóm
export const searchGroupMessages = createAsyncThunk(
  "groups/searchGroupMessages",
  async ({ groupId, keyword }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_URL}${groupId}/messages/search?q=${keyword}`
      );
      const data = await response.json();

      if (data.status === "error") {
        return rejectWithValue(data.message);
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Cập nhật quyền thành viên trong nhóm
export const setRole = createAsyncThunk(
  "groups/setRole",
  async ({ groupId, userId, role, adminId }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_URL}${groupId}/members/${userId}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role, adminId }),
        }
      );

      const data = await response.json();

      if (data.status === "error") {
        return rejectWithValue(data.message);
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Lấy thông tin nhóm theo ID
export const getGroupById = createAsyncThunk(
  "groups/getGroupById",
  async (groupId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}group/${groupId}`);
      const data = await response.json();

      if (data.status === "error") {
        return rejectWithValue(data.message);
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Kiểm tra quyền admin
export const isGroupSubAdmin = createAsyncThunk(
  "groups/isGroupSubAdmin",
  async ({ groupId, userId }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_URL}${groupId}/admin-check/${userId}`
      );
      const data = await response.json();

      if (data.status === "error") {
        return rejectWithValue(data.message);
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
// Chuyển nhường quyền admin chính cho người khác
export const transferAdmin = createAsyncThunk(
  "groups/transferAdmin",
  async ({ groupId, userId, currentAdminId }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_URL}transferAdmin/${groupId}/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ groupId, userId, currentAdminId }),
        }
      );
      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
// Thêm các createAsyncThunk mới
export const createGroupInvitation = createAsyncThunk(
  "groups/createInvitation",
  async ({ groupId, userId, expiresInHours, maxUses }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}${groupId}/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, expiresInHours, maxUses }),
      });

      const data = await response.json();

      if (data.status === "error") {
        return rejectWithValue(data.message);
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getGroupInvitations = createAsyncThunk(
  "groups/getInvitations",
  async ({ groupId, userId }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_URL}${groupId}/invitations?userId=${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log("API response for invitations:", data);

      if (data.status === "error") {
        return rejectWithValue(data.message);
      }

      return data.data || data;
    } catch (error) {
      console.error("Error fetching invitations:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const revokeGroupInvitation = createAsyncThunk(
  "groups/revokeInvitation",
  async ({ inviteId, userId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}invitations/${inviteId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.status === "error") {
        return rejectWithValue(data.message);
      }

      return { inviteId, ...data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const joinGroupByInvitation = createAsyncThunk(
  "groups/joinByInvitation",
  async ({ token, userId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}join-by-invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, userId }),
      });

      const data = await response.json();

      if (data.status === "error") {
        return rejectWithValue(data.message);
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
// Kiểm tra trạng thái của phê duyệt thành viên của nhóm
export const checkMemberApproval = createAsyncThunk(
  "groups/checkMemberApproval",
  async (groupId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/member-approval/${groupId}`);
      const data = await response.json();

      if (data.status === "error") {
        return rejectWithValue(data.message);
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Cập nhật trạng thái của phê duyệt thành viên của nhóm
export const updateMemberApproval = createAsyncThunk(
  "groups/updateMemberApproval",
  async ({ groupId, requireApproval }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/member-approval/${groupId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requireApproval }),
      });

      const data = await response.json();

      if (data.status === "error") {
        return rejectWithValue(data.message);
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Lấy danh sách yêu cầu tham gia nhóm đang chờ duyệt
export const getPendingMembers = createAsyncThunk(
  "groups/getPendingMembers",
  async (groupId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/pending-members/${groupId}`);
      const data = await response.json();

      if (data.status === "error") {
        return rejectWithValue(data.message);
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Lấy danh sách thành viên được mời bởi người dùng
export const getInvitedMembersByUserId = createAsyncThunk(
  "groups/getInvitedMembersByUserId",
  async ({ groupId, userId }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_URL}invited-members/${groupId}/${userId}`
      );
      const data = await response.json();

      if (data.status === "error") {
        return rejectWithValue(data.message);
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Chấp nhận thành viên vào nhóm
export const acceptMember = createAsyncThunk(
  "groups/acceptMember",
  async ({ groupId, memberId, adminId }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_URL}/accept-member/${groupId}/${memberId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ adminId }),
        }
      );

      const data = await response.json();

      if (data.status === "error") {
        return rejectWithValue(data.message);
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Từ chối thành viên vào nhóm
export const rejectMember = createAsyncThunk(
  "groups/rejectMember",
  async ({ groupId, memberId, adminId }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_URL}/reject-member/${groupId}/${memberId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ adminId }),
        }
      );

      const data = await response.json();

      if (data.status === "error") {
        return rejectWithValue(data.message);
      }

      return { groupId, memberId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  userGroups: [],
  currentGroup: null,
  groupMembers: [],
  groupMessages: [],
  searchResults: [],
  messageSearchResults: [],
  adminStatus: null,
  status: "idle",
  error: null,
  groupInvitations: [],
  invitationStatus: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  invitationError: null,
  currentInvitation: null,
};

const groupSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {
    setCurrentGroup: (state, action) => {
      state.currentGroup = action.payload;
    },
    resetGroupState: (state) => {
      return initialState;
    },
    updateGroupMessage: (state, action) => {
      // Add new message to group messages if it belongs to current group
      const message = action.payload;
      if (
        state.currentGroup &&
        message.receiver_id === state.currentGroup._id
      ) {
        state.groupMessages.push(message);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // getUserGroups
      .addCase(getUserGroups.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getUserGroups.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userGroups = action.payload;
      })
      .addCase(getUserGroups.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })

      // searchGroup
      .addCase(searchGroup.pending, (state) => {
        state.status = "loading";
      })
      .addCase(searchGroup.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.searchResults = action.payload;
      })
      .addCase(searchGroup.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })

      // getGroupMembers
      .addCase(getGroupMembers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getGroupMembers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.groupMembers = action.payload;
      })
      .addCase(getGroupMembers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })

      // createGroup
      .addCase(createGroup.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userGroups.push(action.payload);
        state.currentGroup = action.payload;
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })

      // addMember
      .addCase(addMember.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Update members would need a full refresh from server
      })

      // addMembers
      .addCase(addMembers.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Update members would need a full refresh from server
      })

      // removeMember
      .addCase(removeMember.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Filter out removed member if we're viewing that group
        if (
          state.currentGroup &&
          action.payload.groupId === state.currentGroup._id
        ) {
          state.groupMembers = state.groupMembers.filter(
            (member) => member.user_id !== action.payload.userId
          );
        }
      })

      // updateGroup
      .addCase(updateGroup.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Update current group if it's the one being updated
        if (
          state.currentGroup &&
          state.currentGroup._id === action.payload._id
        ) {
          state.currentGroup = action.payload;
        }
        // Update in userGroups list as well
        state.userGroups = state.userGroups.map((group) =>
          group._id === action.payload._id ? action.payload : group
        );
      })

      // deleteGroup
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Remove from userGroups
        state.userGroups = state.userGroups.filter(
          (group) => group._id !== action.payload
        );
        // Reset currentGroup if it was deleted
        if (state.currentGroup && state.currentGroup._id === action.payload) {
          state.currentGroup = null;
          state.groupMembers = [];
          state.groupMessages = [];
        }
      })
      // sendGroupMessage
      .addCase(sendGroupMessage.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.groupMessages.push(action.payload);
      })

      // searchGroupMessages
      .addCase(searchGroupMessages.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.messageSearchResults = action.payload;
      })

      // getGroupById
      .addCase(getGroupById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentGroup = action.payload;
      })

      // isGroupSubAdmin
      .addCase(isGroupSubAdmin.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.adminStatus = action.payload;
      })

      // setRole
      .addCase(setRole.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Update the member role in the members list
        if (state.groupMembers.length > 0) {
          state.groupMembers = state.groupMembers.map((member) =>
            member.user_id === action.payload.user_id
              ? { ...member, role: action.payload.role }
              : member
          );
        }
      })
      .addCase(transferAdmin.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Update the group members list to reflect the new admin
        if (state.groupMembers.length > 0) {
          state.groupMembers = state.groupMembers.map((member) =>
            member.user_id === action.payload.user_id
              ? { ...member, role: "admin" }
              : member
          );
        }
      })
      .addCase(transferAdmin.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      // createGroupInvitation
      .addCase(createGroupInvitation.pending, (state) => {
        state.invitationStatus = "loading";
      })
      .addCase(createGroupInvitation.fulfilled, (state, action) => {
        state.invitationStatus = "succeeded";
        state.currentInvitation = action.payload;
      })
      .addCase(createGroupInvitation.rejected, (state, action) => {
        state.invitationStatus = "failed";
        state.invitationError = action.payload || action.error.message;
      })

      // getGroupInvitations
      .addCase(getGroupInvitations.pending, (state) => {
        state.invitationStatus = "loading";
      })
      .addCase(getGroupInvitations.fulfilled, (state, action) => {
        state.invitationStatus = "succeeded";
        // Ensure we're storing an array, handle potential API response formats
        state.groupInvitations = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data || action.payload?.invitations || [];
      })
      .addCase(getGroupInvitations.rejected, (state, action) => {
        state.invitationStatus = "failed";
        state.invitationError = action.payload || action.error.message;
      })

      // revokeGroupInvitation
      .addCase(revokeGroupInvitation.fulfilled, (state, action) => {
        state.invitationStatus = "succeeded";
        state.groupInvitations = state.groupInvitations.filter(
          (invite) => invite._id !== action.payload.inviteId
        );
      })

      // joinGroupByInvitation
      .addCase(joinGroupByInvitation.pending, (state) => {
        state.invitationStatus = "loading";
      })
      .addCase(joinGroupByInvitation.fulfilled, (state, action) => {
        state.invitationStatus = "succeeded";
        if (
          !state.userGroups.some((group) => group._id === action.payload._id)
        ) {
          state.userGroups.push(action.payload);
        }
      })
      .addCase(joinGroupByInvitation.rejected, (state, action) => {
        state.invitationStatus = "failed";
        state.invitationError = action.payload || action.error.message;
      })
      // checkMemberApproval
      .addCase(checkMemberApproval.pending, (state) => {
        state.status = "loading";
      })
      .addCase(checkMemberApproval.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.memberApprovalStatus = action.payload;
      })
      .addCase(checkMemberApproval.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })

      // updateMemberApproval
      .addCase(updateMemberApproval.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateMemberApproval.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.memberApprovalStatus = action.payload;
        if (state.currentGroup) {
          state.currentGroup = {
            ...state.currentGroup,
            member_approval: action.payload,
          };
        }
      })
      .addCase(updateMemberApproval.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })

      // getPendingMembers
      .addCase(getPendingMembers.pending, (state) => {
        state.pendingMembersStatus = "loading";
      })
      .addCase(getPendingMembers.fulfilled, (state, action) => {
        state.pendingMembersStatus = "succeeded";
        state.pendingMembers = action.payload;
      })
      .addCase(getPendingMembers.rejected, (state, action) => {
        state.pendingMembersStatus = "failed";
        state.pendingMembersError = action.payload || action.error.message;
      })

      // getInvitedMembersByUserId
      .addCase(getInvitedMembersByUserId.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getInvitedMembersByUserId.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.invitedMembers = action.payload;
      })
      .addCase(getInvitedMembersByUserId.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })

      // acceptMember
      .addCase(acceptMember.pending, (state) => {
        state.status = "loading";
      })
      .addCase(acceptMember.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Remove member from pending list
        state.pendingMembers = state.pendingMembers.filter(
          (member) => member.user_id !== action.payload.user_id
        );
        // Add to members list if we're viewing that group
        if (
          state.currentGroup &&
          state.currentGroup._id === action.payload.group_id
        ) {
          state.groupMembers.push(action.payload);
        }
      })
      .addCase(acceptMember.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })

      // rejectMember
      .addCase(rejectMember.pending, (state) => {
        state.status = "loading";
      })
      .addCase(rejectMember.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Remove member from pending list
        state.pendingMembers = state.pendingMembers.filter(
          (member) => member.user_id !== action.payload.memberId
        );
      })
      .addCase(rejectMember.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      });
  },
});

export const { setCurrentGroup, resetGroupState, updateGroupMessage } =
  groupSlice.actions;

export default groupSlice.reducer;
