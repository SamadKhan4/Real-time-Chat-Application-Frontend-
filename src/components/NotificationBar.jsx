import React, { useContext, useState } from "react";
import assets from "../assets/assets";
import { ChatContext } from "../../context/ChatContext.jsx";

const NotificationBar = () => {
  const {
    contactRequests,
    outgoingContactRequests,
    respondToContactRequest,
  } = useContext(ChatContext);
  const [isOpen, setIsOpen] = useState(false);

  const requestCount = contactRequests.length;
  const pendingCount = outgoingContactRequests.length;

  const handleRespond = async (requestId, action) => {
    const completed = await respondToContactRequest(requestId, action);
    if (completed && contactRequests.length <= 1) {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative z-30 rounded-2xl border border-gray-600 bg-[#0f0a1f]/80 px-4 py-3 text-white shadow-lg backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">Notifications</p>
          <p className="truncate text-xs text-neutral-400">
            {requestCount > 0
              ? `${requestCount} chat request${requestCount > 1 ? "s" : ""} waiting`
              : pendingCount > 0
                ? `${pendingCount} sent request${pendingCount > 1 ? "s" : ""} pending`
                : "No new chat requests"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative rounded-full bg-violet-600 px-4 py-2 text-sm font-medium hover:bg-violet-500"
        >
          Requests
          {requestCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-green-500 px-1 text-[11px] text-white">
              {requestCount}
            </span>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+10px)] w-[min(92vw,420px)] rounded-2xl border border-gray-600 bg-[#1f1834] p-4 shadow-2xl">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium">Chat Requests</h2>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-full bg-white/10 text-sm hover:bg-white/15"
            >
              x
            </button>
          </div>

          <div className="mt-4 max-h-80 overflow-y-auto pr-1">
            {contactRequests.length > 0 ? (
              <div className="flex flex-col gap-3">
                {contactRequests.map((request) => (
                  <div key={request._id} className="rounded-xl bg-white/5 p-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={request.requester?.profilePic || assets.avatar_icon}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {request.requester?.fullName || request.requester?.fullname}
                        </p>
                        <p className="truncate text-xs text-neutral-400">{request.requester?.email}</p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleRespond(request._id, "decline")}
                        className="rounded-full bg-white/10 py-2 text-xs hover:bg-white/15"
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRespond(request._id, "accept")}
                        className="rounded-full bg-violet-600 py-2 text-xs hover:bg-violet-500"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-600 p-4 text-center">
                <p className="text-sm">No incoming requests</p>
                <p className="mt-1 text-xs text-neutral-400">New chat requests will appear here.</p>
              </div>
            )}

            {outgoingContactRequests.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs uppercase text-neutral-400">Pending Sent</p>
                <div className="flex flex-col gap-2">
                  {outgoingContactRequests.map((request) => (
                    <div key={request._id} className="flex items-center gap-2 rounded-lg bg-white/5 p-2">
                      <img
                        src={request.recipient?.profilePic || assets.avatar_icon}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-xs">{request.recipient?.fullName || request.recipient?.fullname}</p>
                        <p className="truncate text-[11px] text-neutral-400">Waiting for accept</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBar;
