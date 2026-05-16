/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";
import { ChatContext } from "../../context/ChatContext.jsx";

const Sidebar = () => {
  const { createGroup, getUsers, groups, users, selectedUser, setSelectedUser, unseenMessages, setUnseenMessages } = useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);
  
  const [input , setInput] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const navigate = useNavigate();
  const filteredUsers = input ? users.filter((user)=> user.fullName.toLowerCase().includes(input.toLowerCase())) : users ;
  const filteredGroups = input ? groups.filter((group)=> group.name.toLowerCase().includes(input.toLowerCase())) : groups ;

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const toggleMember = (userId) => {
    setSelectedMemberIds((prevIds) => (
      prevIds.includes(userId)
        ? prevIds.filter((id) => id !== userId)
        : [...prevIds, userId]
    ));
  };

  const handleCreateGroup = async (event) => {
    event.preventDefault();
    const created = await createGroup({ name: groupName, memberIds: selectedMemberIds });

    if (created) {
      setGroupName("");
      setSelectedMemberIds([]);
      setIsGroupModalOpen(false);
    }
  };

  return (
    <div className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${selectedUser ? "max-md:hidden" : ""}`}>
      <div className="pb-5">
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="Logo" className="max-w-40" />
          <div className="relative py-2">
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/15 cursor-pointer"
              aria-label="Open menu"
            >
              <img src={assets.menu_icon} alt="" className="max-h-5" />
            </button>
            {isMenuOpen && (
            <div className="absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600">
              <p
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate("/profile");
                }}
                className="cursor-pointer text-sm"
              >
                Edit Profile
              </p>
              <hr className="my-2 border-t border-grey-500" />
              <p
                onClick={() => {
                  setIsMenuOpen(false);
                  logout();
                }}
                className="cursor-pointer text-sm"
              >
                Logout
              </p>
            </div>
            )}
          </div>
        </div>

        <div className="bg-[#282142] rounded-full flex items-center gap-2 mt-5 px-4 py-3">
          <img src={assets.search_icon} alt="Search Icon" className="w-3" />
          <input onChange={(e) =>setInput(e.target.value)} 
          type="text" className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8]" placeholder="Search user..." />
        </div>
        <button
          type="button"
          onClick={() => setIsGroupModalOpen(true)}
          className="mt-3 w-full py-2 rounded-full bg-violet-600/80 hover:bg-violet-600 text-sm cursor-pointer"
        >
          + Create Group
        </button>
      </div>

      <div className="flex flex-col">
        {filteredGroups.length > 0 && <p className="px-4 pb-2 text-xs uppercase text-gray-400">Groups</p>}
        {filteredGroups.map((group) => (
          <div
            key={group._id}
            className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${selectedUser?._id === group._id ? "bg-[#282142]/50" : ""}`}
            onClick={() => {
              setSelectedUser(group);
              setUnseenMessages((prev) => ({ ...prev, [group._id]: 0 }));
            }}
          >
            <div className="w-[35px] aspect-[1/1] rounded-full bg-violet-500/70 flex items-center justify-center text-sm font-medium">
              {group.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col leading-5">
              <p className="text-sm text-white">{group.name}</p>
              <span className="text-neutral-400 text-xs">{group.members?.length || 0} members</span>
            </div>
            {unseenMessages[group._id] > 0 && (
              <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
                {unseenMessages[group._id]}
              </p>
            )}
          </div>
        ))}

        {filteredUsers.length > 0 && <p className="px-4 py-2 text-xs uppercase text-gray-400">People</p>}
        {filteredUsers.map((user) => (
          <div
            key={user._id}
            className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${selectedUser?._id === user._id ? "bg-[#282142]/50" : ""}`}
            onClick={() => {
              setSelectedUser(user);
              setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }));
            }}
          >
            <img src={user?.profilePic || assets.avatar_icon} alt="" className="w-[35px] aspect-[1/1] rounded-full" />
            <div className="flex flex-col leading-5">
              <p className="text-sm text-white">{user.fullName}</p>
              {onlineUsers.includes(user._id) ? (
                <span className="text-green-500 text-xs">Online</span>
              ) : (
                <span className="text-neutral-400 text-xs">offline</span>
              )}
            </div>
            {unseenMessages[user._id] > 0 && (
              <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
                {unseenMessages[user._id]}
              </p>
            )}
          </div>
        ))}
      </div>

      {isGroupModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
          <form onSubmit={handleCreateGroup} className="w-full max-w-sm rounded-lg border border-gray-600 bg-[#1f1834] p-5 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-medium">Create Group</h2>
              <button
                type="button"
                onClick={() => setIsGroupModalOpen(false)}
                className="h-8 w-8 rounded-full bg-white/10 cursor-pointer"
                aria-label="Close group form"
              >
                x
              </button>
            </div>
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="mt-4 w-full rounded-md border border-gray-600 bg-transparent p-2 outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Group name"
              required
            />
            <div className="mt-4 max-h-52 overflow-y-auto">
              {users.map((user) => (
                <label key={user._id} className="flex items-center gap-3 rounded-md p-2 hover:bg-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedMemberIds.includes(user._id)}
                    onChange={() => toggleMember(user._id)}
                  />
                  <img src={user?.profilePic || assets.avatar_icon} alt="" className="w-8 aspect-square rounded-full" />
                  <span className="text-sm">{user.fullName}</span>
                </label>
              ))}
            </div>
            <button
              type="submit"
              className="mt-5 w-full rounded-md bg-gradient-to-r from-purple-400 to-violet-600 py-2 text-sm cursor-pointer"
            >
              Create
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
