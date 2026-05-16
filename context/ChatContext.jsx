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
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [typingUserId, setTypingUserId] = useState(null);

  const { socket, axios } = useContext(AuthContext);

  const getUsers = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/messages/users");

      if (data.success) {
        setUsers(data.users.map(normalizeUser));
        setUnseenMessages(data.unseenMessages);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  }, [axios]);

  const getMessages = useCallback(async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);

      if (data.success) {
        setMessages(data.messages);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  }, [axios]);

  const sendMessage = async (messageData) => {
    if (!selectedUser?._id) {
      toast.error("Select a user first");
      return;
    }

    try {
      const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);

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
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        const seenMessage = { ...newMessage, seen: true };
        setMessages((prevMessages) => [...prevMessages, seenMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessages((prevUnseenMessages) => ({
          ...prevUnseenMessages,
          [newMessage.senderId]: (prevUnseenMessages[newMessage.senderId] || 0) + 1,
        }));
      }
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
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [axios, socket, selectedUser]);

  const startTyping = useCallback(() => {
    if (socket && selectedUser?._id) {
      socket.emit("typing", { receiverId: selectedUser._id });
    }
  }, [socket, selectedUser]);

  const stopTyping = useCallback(() => {
    if (socket && selectedUser?._id) {
      socket.emit("stopTyping", { receiverId: selectedUser._id });
    }
  }, [socket, selectedUser]);

  const value = {
    messages,
    users,
    selectedUser,
    unseenMessages,
    typingUserId,
    getUsers,
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
