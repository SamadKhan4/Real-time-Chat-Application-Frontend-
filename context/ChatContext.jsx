import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext.jsx";
import toast from "react-hot-toast";

export const ChatContext = createContext();

const normalizeUser = (user) => ({
  ...user,
  fullName: user.fullName || user.fullname,
});

const normalizeContactRequest = (request) => ({
  ...request,
  requester: request.requester ? normalizeUser(request.requester) : request.requester,
  recipient: request.recipient ? normalizeUser(request.recipient) : request.recipient,
});

const createLocalId = () => (
  crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`
);

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [contactRequests, setContactRequests] = useState([]);
  const [outgoingContactRequests, setOutgoingContactRequests] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [typingUserId, setTypingUserId] = useState(null);
  const [groupTypingUsers, setGroupTypingUsers] = useState({});
  const [gameStates, setGameStates] = useState({});

  const { authUser, socket, axios } = useContext(AuthContext);

  const getUsers = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/messages/users");

      if (data.success) {
        setUsers(data.users.map(normalizeUser));
        setGroups((data.groups || []).map((group) => ({ ...group, isGroup: true })));
        setUnseenMessages(data.unseenMessages);
        setContactRequests((data.contactRequests || []).map(normalizeContactRequest));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  }, [axios]);

  const getContactRequests = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/messages/contact-requests");

      if (data.success) {
        setContactRequests((data.incoming || []).map(normalizeContactRequest));
        setOutgoingContactRequests((data.outgoing || []).map(normalizeContactRequest));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  }, [axios]);

  const sendContactRequest = async (email) => {
    try {
      const { data } = await axios.post("/api/messages/contact-requests", { email });

      if (data.success) {
        setOutgoingContactRequests((prevRequests) => [
          normalizeContactRequest(data.contactRequest),
          ...prevRequests.filter((request) => request._id !== data.contactRequest._id),
        ]);
        toast.success(data.message || "Contact request sent");
        return true;
      }

      toast.error(data.message);
      return false;
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      return false;
    }
  };

  const respondToContactRequest = async (requestId, action) => {
    try {
      const { data } = await axios.put(`/api/messages/contact-requests/${requestId}`, { action });

      if (data.success) {
        setContactRequests((prevRequests) => prevRequests.filter((request) => request._id !== requestId));

        if (action === "accept" && data.user) {
          const acceptedUser = normalizeUser(data.user);
          setUsers((prevUsers) => [
            acceptedUser,
            ...prevUsers.filter((user) => user._id !== acceptedUser._id),
          ]);
        }

        toast.success(data.message);
        return true;
      }

      toast.error(data.message);
      return false;
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      return false;
    }
  };

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

  const updateGroup = async ({ groupId, name, bio, groupPic }) => {
    try {
      const { data } = await axios.put(`/api/messages/groups/${groupId}`, { name, bio, groupPic });

      if (data.success) {
        const group = { ...data.group, isGroup: true };
        setGroups((prevGroups) => prevGroups.map((item) => item._id === group._id ? group : item));
        setSelectedUser((currentChat) => currentChat?._id === group._id ? group : currentChat);
        toast.success("Group updated");
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

  const createTicTacToeInvite = async () => {
    if (!selectedUser?._id) {
      toast.error("Select a chat first");
      return;
    }

    if (selectedUser.isGroup) {
      toast.error("Games are available in one-to-one chats for now");
      return;
    }

    const gameId = createLocalId();
    const game = {
      type: "tic-tac-toe",
      gameId,
      players: {
        x: authUser._id,
        o: selectedUser._id,
      },
      status: "invited",
    };

    await sendMessage({
      text: "Let's play Tic Tac Toe",
      game,
    });

    socket?.emit("game:join", { gameId, players: game.players });
  };

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      const senderId = typeof newMessage.senderId === "object" ? newMessage.senderId._id : newMessage.senderId;
      const groupId = newMessage.groupId?.toString();
      const selectedChatId = selectedUser?._id?.toString();
      const isSelectedGroupMessage = selectedUser?.isGroup && groupId === selectedChatId;
      const isSelectedUserMessage = selectedUser && !selectedUser.isGroup && senderId === selectedChatId;

      if (groupId) {
        setGroupTypingUsers((prevTypingUsers) => {
          const groupTyping = { ...(prevTypingUsers[groupId] || {}) };
          delete groupTyping[senderId];

          return {
            ...prevTypingUsers,
            [groupId]: groupTyping,
          };
        });
      }

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

    const handleGroupUpdated = (group) => {
      const updatedGroup = { ...group, isGroup: true };
      setGroups((prevGroups) => prevGroups.map((item) => item._id === group._id ? updatedGroup : item));
      setSelectedUser((currentChat) => currentChat?._id === group._id ? updatedGroup : currentChat);
    };

    const handleNewContactRequest = (request) => {
      const normalizedRequest = normalizeContactRequest(request);
      setContactRequests((prevRequests) => [
        normalizedRequest,
        ...prevRequests.filter((item) => item._id !== normalizedRequest._id),
      ]);
      toast.success(`${normalizedRequest.requester?.fullName || "Someone"} sent you a chat request`);
    };

    const handleContactRequestAccepted = ({ requestId, user }) => {
      setOutgoingContactRequests((prevRequests) => prevRequests.filter((request) => request._id !== requestId));

      if (user) {
        const acceptedUser = normalizeUser(user);
        setUsers((prevUsers) => [
          acceptedUser,
          ...prevUsers.filter((item) => item._id !== acceptedUser._id),
        ]);
        toast.success(`${acceptedUser.fullName} accepted your chat request`);
      }
    };

    const handleContactRequestDeclined = ({ requestId }) => {
      setOutgoingContactRequests((prevRequests) => prevRequests.filter((request) => request._id !== requestId));
      toast.error("Chat request declined");
    };

    const handleTyping = ({ senderId }) => {
      setTypingUserId(senderId);
    };

    const handleStopTyping = ({ senderId }) => {
      setTypingUserId((currentTypingUserId) => (
        currentTypingUserId === senderId ? null : currentTypingUserId
      ));
    };

    const handleGroupTyping = ({ groupId, senderId, senderName }) => {
      setGroupTypingUsers((prevTypingUsers) => ({
        ...prevTypingUsers,
        [groupId]: {
          ...(prevTypingUsers[groupId] || {}),
          [senderId]: senderName || "Someone",
        },
      }));
    };

    const handleGroupStopTyping = ({ groupId, senderId }) => {
      setGroupTypingUsers((prevTypingUsers) => {
        const groupTyping = { ...(prevTypingUsers[groupId] || {}) };
        delete groupTyping[senderId];

        return {
          ...prevTypingUsers,
          [groupId]: groupTyping,
        };
      });
    };

    const handleGameState = ({ gameId, state }) => {
      setGameStates((prevStates) => ({
        ...prevStates,
        [gameId]: state,
      }));
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("newGroup", handleNewGroup);
    socket.on("groupUpdated", handleGroupUpdated);
    socket.on("contactRequest:new", handleNewContactRequest);
    socket.on("contactRequest:accepted", handleContactRequestAccepted);
    socket.on("contactRequest:declined", handleContactRequestDeclined);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    socket.on("groupTyping", handleGroupTyping);
    socket.on("groupStopTyping", handleGroupStopTyping);
    socket.on("game:state", handleGameState);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("newGroup", handleNewGroup);
      socket.off("groupUpdated", handleGroupUpdated);
      socket.off("contactRequest:new", handleNewContactRequest);
      socket.off("contactRequest:accepted", handleContactRequestAccepted);
      socket.off("contactRequest:declined", handleContactRequestDeclined);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      socket.off("groupTyping", handleGroupTyping);
      socket.off("groupStopTyping", handleGroupStopTyping);
      socket.off("game:state", handleGameState);
    };
  }, [axios, socket, selectedUser]);

  const startTyping = useCallback(() => {
    if (!socket || !selectedUser?._id) return;

    if (selectedUser.isGroup) {
      socket.emit("groupTyping", {
        groupId: selectedUser._id,
        members: selectedUser.members?.map((member) => member._id) || [],
        senderName: authUser?.fullName || authUser?.fullname || "Someone",
      });
    } else {
      socket.emit("typing", { receiverId: selectedUser._id });
    }
  }, [authUser, socket, selectedUser]);

  const stopTyping = useCallback(() => {
    if (!socket || !selectedUser?._id) return;

    if (selectedUser.isGroup) {
      socket.emit("groupStopTyping", {
        groupId: selectedUser._id,
        members: selectedUser.members?.map((member) => member._id) || [],
      });
    } else {
      socket.emit("stopTyping", { receiverId: selectedUser._id });
    }
  }, [socket, selectedUser]);

  const joinGame = useCallback((game) => {
    if (!socket || !game?.gameId || !game?.players) return;

    socket.emit("game:join", {
      gameId: game.gameId,
      players: game.players,
    });
  }, [socket]);

  const makeGameMove = useCallback((gameId, index) => {
    if (!socket || !gameId) return;

    socket.emit("game:move", { gameId, index });
  }, [socket]);

  const restartGame = useCallback((gameId) => {
    if (!socket || !gameId) return;

    socket.emit("game:restart", { gameId });
  }, [socket]);

  const value = {
    messages,
    users,
    groups,
    contactRequests,
    outgoingContactRequests,
    selectedUser,
    unseenMessages,
    typingUserId,
    groupTypingUsers,
    gameStates,
    getUsers,
    getContactRequests,
    sendContactRequest,
    respondToContactRequest,
    createGroup,
    updateGroup,
    getMessages,
    createTicTacToeInvite,
    joinGame,
    makeGameMove,
    restartGame,
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
