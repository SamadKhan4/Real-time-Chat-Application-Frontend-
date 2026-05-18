/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
import axios from "axios";
import { createContext, useEffect, useState, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

const normalizeUser = (user) => {
  if (!user) return user;
  return {
    ...user,
    fullName: user.fullName || user.fullname,
  };
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  const connectSocket = useCallback((userData) => {
    if (!userData || socketRef.current?.connected) return;

    const newSocket = io(backendUrl, {
      query: {
        userId: userData._id,
      },
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("socket connected", newSocket.id);
    });

    newSocket.on("connect_error", (error) => {
      console.log("socket connect error", error.message);
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await axios.post("/api/auth/check");

      if (data.success) {
        const user = normalizeUser(data.user);
        setAuthUser(user);
        connectSocket(user);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  }, [connectSocket]);

  const login = async (state, credentials) => {
    try {
      const authData = {
        ...credentials,
        fullname: credentials.fullname || credentials.fullName,
      };

      delete authData.fullName;

      const { data } = await axios.post(`/api/auth/${state}`, authData);

      if (data.success) {
        axios.defaults.headers.common["token"] = data.token;
        localStorage.setItem("token", data.token);

        const user = normalizeUser(data.userData);
        setAuthUser(user);
        connectSocket(user);
        setToken(data.token);

        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);

    delete axios.defaults.headers.common["token"];

    const activeSocket = socketRef.current || socket;
    if (activeSocket) {
      activeSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
    }

    toast.success("Logout ho gaya bhau");
  };

  const updateProfile = async (body) => {
    try {
      const profileData = {
        ...body,
        fullname: body?.fullname || body?.fullName,
      };

      delete profileData.fullName;

      const { data } = await axios.post("/api/auth/update-profile", profileData);

      if (data.success) {
        setAuthUser(normalizeUser(data.user));
        toast.success("Profile updated successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
      checkAuth();
    }
  }, [token, checkAuth]);

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
