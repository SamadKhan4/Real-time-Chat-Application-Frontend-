import React, { useEffect, useRef, useState } from "react";

const languages = ["javascript", "typescript", "python", "java", "cpp"];

const starterCode = `// Start coding together here
function hello() {
  return "Live Code Space";
}
`;

const CodeSpace = ({
  authUser,
  codeSpace,
  codeState,
  isOwnMessage,
  onJoin,
  onUpdate,
  onLanguageChange,
}) => {
  const joined = Boolean(codeState);
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(codeState?.content || starterCode);
  const latestRemoteUpdate = useRef(codeState?.updatedAt);
  const syncTimer = useRef(null);
  const language = codeState?.language || codeSpace.language || "javascript";

  useEffect(() => {
    if (!codeState) return;
    if (codeState.updatedBy === authUser?._id) return;
    if (latestRemoteUpdate.current === codeState.updatedAt) return;

    latestRemoteUpdate.current = codeState.updatedAt;
    setDraft(codeState.content || "");
  }, [authUser?._id, codeState]);

  useEffect(() => (
    () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    }
  ), []);

  const handleChange = (event) => {
    const content = event.target.value;
    setDraft(content);

    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      onUpdate({
        codeSpaceId: codeSpace.codeSpaceId,
        content,
        language,
      });
    }, 250);
  };

  const handleLanguageChange = (event) => {
    const nextLanguage = event.target.value;
    onLanguageChange({
      codeSpaceId: codeSpace.codeSpaceId,
      language: nextLanguage,
    });
    onUpdate({
      codeSpaceId: codeSpace.codeSpaceId,
      content: draft,
      language: nextLanguage,
    });
  };

  const handleOpen = () => {
    onJoin(codeSpace);
    setIsOpen(true);
  };

  return (
    <>
      <div className={`w-[min(320px,74vw)] overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#080b12]/95 text-white shadow-2xl ${isOwnMessage ? "rounded-br-none" : "rounded-bl-none"}`}>
        <div className="border-b border-white/10 bg-cyan-500/10 px-4 py-3">
          <p className="text-sm font-semibold">Code Space</p>
          <p className="text-xs text-cyan-100/70">{joined ? "Live workspace ready" : "Live coding invite"}</p>
        </div>

        <div className="p-3">
          <button
            type="button"
            onClick={handleOpen}
            className="w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400"
          >
            Open Code Space
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#080b12] text-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#0e1420] px-4 py-3 md:px-6">
            <div>
              <p className="text-base font-semibold">Code Space</p>
              <p className="text-xs text-cyan-100/70">{joined ? "Connected live" : "Connecting workspace..."}</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={handleLanguageChange}
                className="rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none"
              >
                {languages.map((item) => (
                  <option key={item} value={item} className="bg-[#111827]">
                    {item}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Close
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col p-3 md:p-5">
            <textarea
              value={draft}
              onChange={handleChange}
              spellCheck="false"
              className="min-h-0 flex-1 resize-none rounded-2xl border border-white/10 bg-black/45 p-4 font-mono text-sm leading-6 text-cyan-50 outline-none focus:border-cyan-300/50"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default CodeSpace;
