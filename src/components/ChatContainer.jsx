/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { AuthContext } from "../../context/AuthContext.jsx";
import { ChatContext } from "../../context/ChatContext.jsx";
import toast from "react-hot-toast";
import TicTacToeGame from "./TicTacToeGame.jsx";

const ChatContainer = ({ onOpenProfile }) => {
  const { authUser , onlineUsers } = useContext(AuthContext);
  const {
    messages,
    selectedUser,
    setSelectedUser,
    getMessages,
    sendMessage,
    typingUserId,
    groupTypingUsers,
    gameStates,
    createTicTacToeInvite,
    joinGame,
    makeGameMove,
    restartGame,
    startTyping,
    stopTyping,
  } = useContext(ChatContext);
  const [input, setInput] = useState("");
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const scrollEnd = useRef();
  const imageInputRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser, getMessages]);

  useEffect(() => {
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (event) => {
    event?.preventDefault();

    if (!input.trim()) return;

    stopTyping();
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    await sendMessage({ text: input.trim() });
    setInput("");
  };

  const handleInputChange = (event) => {
    setInput(event.target.value);
    startTyping();

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      stopTyping();
    }, 1200);
  };

  useEffect(() => {
    return () => {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      stopTyping();
    };
  }, [stopTyping]);
 const handleSendImage = async (e) =>{
  const file = e.target.files?.[0];
  if(!file || !file.type.startsWith("image/")){
    toast.error("select an image file")
    return;
  }
  const reader = new FileReader();

  reader.onloadend = async ()=>{
    await sendMessage({image: reader.result})
    e.target.value = ""
    setShowAttachmentMenu(false);
  }
  reader.readAsDataURL(file)
  }

  const handleStartGame = async () => {
    await createTicTacToeInvite();
    setShowAttachmentMenu(false);
  };

  const getSenderId = (sender) => typeof sender === "object" ? sender?._id : sender;
  const getSenderName = (sender) => sender?.fullName || sender?.fullname || "Group member";
  const isGroupChat = Boolean(selectedUser?.isGroup);
  const typingNames = Object.values(groupTypingUsers[selectedUser?._id] || {});
  const groupTypingText = typingNames.length > 1
    ? `${typingNames.join(", ")} are typing...`
    : `${typingNames[0]} is typing...`;


  return selectedUser ? (
    <div className="h-full overflow-hidden relative backdrop-blur-lg">
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        <img
          onClick={onOpenProfile}
          src={isGroupChat ? selectedUser.groupPic || assets.avatar_icon : selectedUser.profilePic || assets.avatar_icon}
          alt=""
          className="w-8 aspect-square rounded-full cursor-pointer"
        />
        <p onClick={onOpenProfile} className="flex-1 text-lg text-white flex items-center gap-2 cursor-pointer">
          <span className="flex flex-col leading-5">
            <span className="flex items-center gap-2">
              {isGroupChat ? selectedUser.name : selectedUser.fullName}
              {!isGroupChat && onlineUsers.includes(selectedUser._id) && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
            </span>
            {isGroupChat ? (
              <span className={`text-xs ${typingNames.length ? "text-green-400" : "text-neutral-400"}`}>
                {typingNames.length ? groupTypingText : `${selectedUser.members?.length || 0} members`}
              </span>
            ) : (
              typingUserId === selectedUser._id && <span className="text-xs text-green-400">typing...</span>
            )}
          </span>
        </p>
        <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} alt="" className="md:hidden max-w-7" />
        <img src={assets.help_icon} alt="" className="max-md:hidden max-w-5" />
      </div>

      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
        {messages.map((msg) => {
          const isOwnMessage = getSenderId(msg.senderId) === authUser?._id;
          const senderProfilePic = typeof msg.senderId === "object" ? msg.senderId.profilePic : selectedUser.profilePic;

          return (
            <div key={msg._id} className={`flex items-end gap-2 justify-end ${!isOwnMessage ? "flex-row-reverse" : ""}`}>
              {msg.game?.type === "tic-tac-toe" ? (
                <div className="mb-8">
                  {isGroupChat && !isOwnMessage && <p className="mb-1 text-xs text-violet-200">{getSenderName(msg.senderId)}</p>}
                  <TicTacToeGame
                    authUser={authUser}
                    game={msg.game}
                    gameState={gameStates[msg.game.gameId]}
                    isOwnMessage={isOwnMessage}
                    onJoin={joinGame}
                    onMove={makeGameMove}
                    onRestart={restartGame}
                  />
                </div>
              ) : msg.image ? (
                <div className="mb-8">
                  {isGroupChat && !isOwnMessage && <p className="mb-1 text-xs text-violet-200">{getSenderName(msg.senderId)}</p>}
                  <img src={msg.image} alt="" className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden" />
                </div>
              ) : (
                <div className={`p-2 max-w-[220px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white ${isOwnMessage ? "rounded-br-none" : "rounded-bl-none"}`}>
                  {isGroupChat && !isOwnMessage && <p className="mb-1 text-xs font-medium text-violet-200">{getSenderName(msg.senderId)}</p>}
                  <p>{msg.text}</p>
                </div>
              )}
              <div className="text-center text-xs">
                <img src={isOwnMessage ? authUser?.profilePic || assets.avatar_icon : senderProfilePic || assets.avatar_icon} alt="" className="w-7 aspect-square rounded-full" />
                <p className="text-gray-500">{formatMessageTime(msg.createdAt)}</p>
              </div>
            </div>
          );
        })}
        <div ref={scrollEnd}></div>
      </div>

      <form onSubmit={handleSendMessage} className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
        <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
          <div className="relative">
            {showAttachmentMenu && (
              <div className="absolute bottom-12 left-0 z-20 w-44 overflow-hidden rounded-2xl border border-white/10 bg-[#14101f] p-2 shadow-2xl">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-white transition hover:bg-white/10"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-violet-500/20">IMG</span>
                  Images
                </button>
                <button
                  type="button"
                  onClick={handleStartGame}
                  disabled={isGroupChat}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45"
                  title={isGroupChat ? "Games are available in one-to-one chats for now" : "Start Tic Tac Toe"}
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500/20">XO</span>
                  Games
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowAttachmentMenu((value) => !value)}
              className="mr-2 grid h-8 w-8 place-items-center rounded-full bg-violet-500/25 text-xl leading-none text-white transition hover:bg-violet-500/35"
            >
              +
            </button>
          </div>
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e)=> e.key === "Enter" ? handleSendMessage(e) : null }
            placeholder="Send a message"
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400 bg-transparent"
          />
          <input ref={imageInputRef} onChange={handleSendImage} type="file" id="image" accept="image/png, image/jpeg" hidden />
        </div>
        <button type="submit">
          <img src={assets.send_button} alt="" className="w-7 cursor-pointer" />
        </button>
      </form>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo_icon} className="max-w-16" alt="" />
      <p className="text-lg font-medium text-white">Chat Anytime , Anywhere</p>
    </div>
  );
};

export default ChatContainer;
