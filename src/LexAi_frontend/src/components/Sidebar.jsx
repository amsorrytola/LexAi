import React, { useState } from 'react';

const Sidebar = ({
  chats,
  setSelectedChatId,
  selectedChatId,
  onNewChat,
  onCollapse,
  onRename,
  onDelete
}) => {
  const [editingId, setEditingId] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  const handleRename = (chatId) => {
    if (newTitle.trim()) {
      onRename(chatId, newTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="w-64 p-4 bg-base-300 border-r border-base-200 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <button className="btn btn-primary btn-sm" onClick={onNewChat}>New Chat</button>
        <button className="btn btn-ghost btn-sm" onClick={onCollapse}>⮘</button>
      </div>
      <h3 className="text-lg font-semibold mb-2">Chat History</h3>
      <div className="space-y-2">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`p-2 rounded cursor-pointer ${
              chat.id === selectedChatId ? 'bg-base-100 shadow' : 'hover:bg-base-200'
            }`}
          >
            {editingId === chat.id ? (
              <div className="flex gap-2">
                <input
                  className="input input-sm input-bordered w-full"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <button className="btn btn-sm btn-success" onClick={() => handleRename(chat.id)}>💾</button>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div onClick={() => setSelectedChatId(chat.id)} className="truncate w-full pr-2">{chat.title}</div>
                <div className="flex gap-1">
                  <button className="btn btn-xs btn-outline" onClick={() => { setEditingId(chat.id); setNewTitle(chat.title); }}>✏️</button>
                  <button className="btn btn-xs btn-error" onClick={() => onDelete(chat.id)}>🗑️</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
