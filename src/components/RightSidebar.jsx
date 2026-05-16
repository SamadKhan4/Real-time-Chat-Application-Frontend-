/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { ChatContext } from "../../context/ChatContext.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";

const RightSidebar = ({ isOpen, onClose }) => {
  const { selectedUser, messages, updateGroup } = useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);
  const [msgImages, setMsgImages] = useState([]);
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupBio, setGroupBio] = useState("");
  const [groupPic, setGroupPic] = useState("");
  const [groupPicPreview, setGroupPicPreview] = useState("");

  useEffect(() => {
    setMsgImages(messages.filter((msg) => msg.image).map((msg) => msg.image));
  }, [messages]);

  useEffect(() => {
    if (selectedUser?.isGroup) {
      setGroupName(selectedUser.name || "");
      setGroupBio(selectedUser.bio || "");
      setGroupPic("");
      setGroupPicPreview(selectedUser.groupPic || "");
      setIsEditingGroup(false);
    }
  }, [selectedUser]);

  if (!selectedUser) return null;

  const handleGroupPicChange = (event) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setGroupPic(reader.result);
      setGroupPicPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateGroup = async (event) => {
    event.preventDefault();

    const updated = await updateGroup({
      groupId: selectedUser._id,
      name: groupName,
      bio: groupBio,
      groupPic,
    });

    if (updated) {
      setGroupPic("");
      setIsEditingGroup(false);
    }
  };

  return (
    <div className={`bg-[#8185B2]/10 text-white w-full overflow-y-scroll md:relative max-md:absolute max-md:inset-0 max-md:z-30 max-md:bg-[#0f0a1f]/95 max-md:backdrop-blur-xl ${isOpen ? "max-md:block" : "max-md:hidden"}`}>
      <button
        onClick={onClose}
        className="md:hidden absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 text-white text-lg cursor-pointer"
        type="button"
      >
        x
      </button>
      <div className="pt-6 pb-4 flex flex-col items-center gap-2 text-xs font-light mx-auto">
        {isEditingGroup ? (
          <form onSubmit={handleUpdateGroup} className="w-full px-5 flex flex-col items-center gap-3">
            <label className="relative cursor-pointer">
              <img src={groupPicPreview || assets.avatar_icon} alt="" className="w-20 aspect-[1/1] rounded-full object-cover" />
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-3 py-1 text-[10px]">
                Edit
              </span>
              <input type="file" accept="image/png, image/jpeg" onChange={handleGroupPicChange} hidden />
            </label>
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full rounded-md border border-gray-600 bg-transparent p-2 text-sm outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Group name"
              required
            />
            <textarea
              value={groupBio}
              onChange={(e) => setGroupBio(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-600 bg-transparent p-2 text-sm outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Group bio"
            />
            <div className="grid w-full grid-cols-2 gap-2">
              <button type="button" onClick={() => setIsEditingGroup(false)} className="rounded-md bg-white/10 py-2 text-sm cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="rounded-md bg-violet-600 py-2 text-sm cursor-pointer">
                Save
              </button>
            </div>
          </form>
        ) : (
          <>
            <img src={selectedUser?.isGroup ? selectedUser.groupPic || assets.avatar_icon : selectedUser?.profilePic || assets.avatar_icon} alt="" className="w-20 aspect-[1/1] rounded-full object-cover" />
            <h1 className="px-10 text-[15px] font-medium mx-auto flex items-center gap-3">
              {!selectedUser.isGroup && onlineUsers.includes(selectedUser._id) && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
              {selectedUser.isGroup ? selectedUser.name : selectedUser.fullName}
            </h1>
            <p className="px-5 mx-auto text-center">
              {selectedUser.isGroup ? selectedUser.bio || `${selectedUser.members?.length || 0} members` : selectedUser?.bio}
            </p>
            {selectedUser.isGroup && (
              <button
                type="button"
                onClick={() => setIsEditingGroup(true)}
                className="mt-2 rounded-full bg-white/10 px-4 py-2 text-xs cursor-pointer hover:bg-white/15"
              >
                Edit Group
              </button>
            )}
          </>
        )}
      </div>
      <hr className="border-[#ffffff50] my-2" />

      {selectedUser.isGroup && (
        <div className="px-5 text-xs">
          <p>Members</p>
          <div className="mt-4 flex flex-col gap-3">
            {selectedUser.members?.map((member) => (
              <div key={member._id} className="flex items-center gap-3">
                <img src={member.profilePic || assets.avatar_icon} alt="" className="w-8 aspect-square rounded-full" />
                <div>
                  <p className="text-sm">{member.fullName || member.fullname}</p>
                  <p className="text-neutral-400">{onlineUsers.includes(member._id) ? "Online" : "offline"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
