import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext.jsx";
import toast from "react-hot-toast";

export const ChatContext = createContext();

const normalizeUser = (user) => ({
  ...user,
  fullName: user.fullName || user.fullname,
});

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [typingUserId, setTypingUserId] = useState(null);

  const { socket, axios } = useContext(AuthContext);

  const getUsers = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/messages/users");

      if (data.success) {
        setUsers(data.users.map(normalizeUser));
        setGroups((data.groups || []).map((group) => ({ ...group, isGroup: true })));
        setUnseenMessages(data.unseenMessages);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  }, [axios]);

  const createGroup = async ({ name, memberIds }) => {
    try {
      const { data } = await axios.post("/api/messages/groups", { name, memberIds });

      if (data.success) {
        const group = { ...data.group, isGroup: true };
        setGroups((prevGroups) => [group, ...prevGroups.filter((item) => item._id !== group._id)]);
        setSelectedUser(group);
        toast.success("Group created");
        return true;
      }

      toast.error(data.message);
      return false;
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      return false;
    }
  };

  const getMessages = useCallback(async (userId) => {
    try {
      const endpoint = selectedUser?.isGroup ? `/api/messages/groups/${userId}` : `/api/messages/${userId}`;
      const { data } = await axios.get(endpoint);

      if (data.success) {
        setMessages(data.messages);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  }, [axios, selectedUser]);

  const sendMessage = async (messageData) => {
    if (!selectedUser?._id) {
      toast.error("Select a chat first");
      return;
    }

    try {
      const endpoint = selectedUser.isGroup
        ? `/api/messages/send-group/${selectedUser._id}`
        : `/api/messages/send/${selectedUser._id}`;
      const { data } = await axios.post(endpoint, messageData);

      if (data.success) {
        setMessages((prevMessages) => [...prevMessages, data.newMessage]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      const senderId = typeof newMessage.senderId === "object" ? newMessage.senderId._id : newMessage.senderId;
      const groupId = newMessage.groupId?.toString();
      const selectedChatId = selectedUser?._id?.toString();
      const isSelectedGroupMessage = selectedUser?.isGroup && groupId === selectedChatId;
      const isSelectedUserMessage = selectedUser && !selectedUser.isGroup && senderId === selectedChatId;

      if (isSelectedGroupMessage || isSelectedUserMessage) {
        const seenMessage = { ...newMessage, seen: true };
        setMessages((prevMessages) => [...prevMessages, seenMessage]);
        if (!groupId) axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        const unseenKey = groupId || senderId;
        setUnseenMessages((prevUnseenMessages) => ({
          ...prevUnseenMessages,
          [unseenKey]: (prevUnseenMessages[unseenKey] || 0) + 1,
        }));
      }
    };

    const handleNewGroup = (group) => {
      setGroups((prevGroups) => [
        { ...group, isGroup: true },
        ...prevGroups.filter((item) => item._id !== group._id),
      ]);
    };

    const handleTyping = ({ senderId }) => {
      setTypingUserId(senderId);
    };

    const handleStopTyping = ({ senderId }) => {
      setTypingUserId((currentTypingUserId) => (
        currentTypingUserId === senderId ? null : currentTypingUserId
      ));
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("newGroup", handleNewGroup);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("newGroup", handleNewGroup);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [axios, socket, selectedUser]);

  const startTyping = useCallback(() => {
    if (socket && selectedUser?._id && !selectedUser.isGroup) {
      socket.emit("typing", { receiverId: selectedUser._id });
    }
  }, [socket, selectedUser]);

  const stopTyping = useCallback(() => {
    if (socket && selectedUser?._id && !selectedUser.isGroup) {
      socket.emit("stopTyping", { receiverId: selectedUser._id });
    }
  }, [socket, selectedUser]);

  const value = {
    messages,
    users,
    groups,
    selectedUser,
    unseenMessages,
    typingUserId,
    getUsers,
    createGroup,
    getMessages,
    startTyping,
    stopTyping,
    setMessages,
    sendMessage,
    setSelectedUser,
    setUnseenMessages,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
