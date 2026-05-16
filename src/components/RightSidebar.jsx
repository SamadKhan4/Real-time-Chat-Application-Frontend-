/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { ChatContext } from "../../context/ChatContext.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";

const RightSidebar = ({ isOpen, onClose }) => {
  const { selectedUser, messages } = useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);
  const [msgImages, setMsgImages] = useState([]);

  useEffect(() => {
    setMsgImages(messages.filter((msg) => msg.image).map((msg) => msg.image));
  }, [messages]);

  return selectedUser && (
    <div className={`bg-[#8185B2]/10 text-white w-full overflow-y-scroll md:relative max-md:absolute max-md:inset-0 max-md:z-30 max-md:bg-[#0f0a1f]/95 max-md:backdrop-blur-xl ${isOpen ? "max-md:block" : "max-md:hidden"}`}>
      <button
        onClick={onClose}
        className="md:hidden absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 text-white text-lg cursor-pointer"
        type="button"
      >
        x
      </button>
      <div className="pt-6 pb-4 flex flex-col items-center gap-2 text-xs font-light mx-auto">
        <img src={selectedUser?.profilePic || assets.avatar_icon} alt="" className="w-20 aspect-[1/1] rounded-full" />
        <h1 className="px-10 text-[15px] font-medium mx-auto flex items-center gap-3">
          {onlineUsers.includes(selectedUser._id) && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
          {selectedUser.fullName}
        </h1>
        <p className="px-1 mx-auto">{selectedUser.bio}</p>
      </div>
      <hr className="border-[#ffffff50] my-2" />

      <div className="px-5 text-xs">
        <p>Media</p>
        <div className="mt-5 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80">
          {msgImages.map((url, index) => (
            <div key={`${url}-${index}`} onClick={() => window.open(url)} className="cursor-pointer rounded">
              <img src={url} alt="" className="h-full w-full rounded-md object-cover" />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={logout}
        className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light py-2 px-20 rounded-full cursor-pointer"
      >
        Logout
      </button>
    </div>
  );
};

export default RightSidebar;
