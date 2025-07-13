import React, { useState } from "react";

const Sidebar = ({
  chats,
  setSelectedChatId,
  selectedChatId,
  onNewChat,
  onCollapse,
  onRename,
  onDelete,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  const handleRename = (chatId) => {
    if (newTitle.trim()) {
      onRename(chatId, newTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="w-80 lg:w-72 xl:w-80 flex flex-col bg-white border-r border-gray-200 shadow-lg">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <button
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
            onClick={onNewChat}
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
          <button
            className="ml-3 p-2.5 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-gray-500 hover:text-gray-700"
            onClick={onCollapse}
            aria-label="Collapse sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          Chat History
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {chats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-sm">No chats yet</p>
            <p className="text-xs mt-1">Start a new conversation</p>
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className={`group p-3 rounded-xl transition-all duration-200 ${
                chat.id === selectedChatId
                  ? "bg-gradient-to-r from-blue-50 to-purple-50 shadow-md ring-2 ring-blue-200"
                  : "hover:bg-gray-50"
              }`}
            >
              {editingId === chat.id ? (
                <div className="flex gap-2">
                  <input
                    className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(chat.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    autoFocus
                  />
                  <button
                    className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
                    onClick={() => handleRename(chat.id)}
                    aria-label="Save changes"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                    onClick={() => setEditingId(null)}
                    aria-label="Cancel"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div
                    onClick={() => setSelectedChatId(chat.id)}
                    className="flex-1 cursor-pointer mr-2 min-w-0"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></div>
                      <p className="text-sm font-medium text-gray-800 truncate">{chat.title}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {chat.messages.length} message{chat.messages.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(chat.id);
                        setNewTitle(chat.title);
                      }}
                      aria-label="Edit chat title"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(chat.id);
                      }}
                      aria-label="Delete chat"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;