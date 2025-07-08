import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import ChatInput from '../components/ChatInput';


const AskAiPage = () => {
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);


  const handleNewMessage = async (message) => {
    let chatId = selectedChatId;

    if (!chatId) {
      chatId = `chat-${Date.now()}`;
      const newChat = {
        id: chatId,
        title: message.slice(0, 20),
        messages: [],
        lastUpdated: Date.now()
      };
      setChats((prev) => [newChat, ...prev]);
      setSelectedChatId(chatId);
    }

    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              messages: [...c.messages, { role: 'user', content: message, timestamp: new Date().toISOString() }],
              title: c.messages.length === 0 ? message.slice(0, 20) : c.title,
              lastUpdated: Date.now()
            }
          : c
      )
    );

    setLoading(true);
    setTimeout(() => {
      setChats((prev) => {
        const updated = prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  { role: 'assistant', content: 'This is a test reply from GPT.', timestamp: new Date().toISOString() }
                ],
                lastUpdated: Date.now()
              }
            : c
        );
        updated.sort((a, b) => b.lastUpdated - a.lastUpdated);
        return updated;
      });
      setLoading(false);
    }, 2000);
  };

  const handleNewChat = () => {
    const newId = `chat-${Date.now()}`;
    const newChat = { id: newId, title: 'New Chat', messages: [], lastUpdated: Date.now() };
    setChats((prev) => [newChat, ...prev]);
    setSelectedChatId(newId);
  };

  const handleRenameChat = (chatId, newTitle) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, title: newTitle } : c))
    );
  };

  const handleDeleteChat = (chatId) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    if (chatId === selectedChatId) setSelectedChatId(null);
  };

  const selectedMessages = chats.find((c) => c.id === selectedChatId)?.messages || [];

  return (
    <div className="flex h-screen bg-base-200">
      {!sidebarCollapsed ? (
        <Sidebar
          chats={chats}
          setSelectedChatId={setSelectedChatId}
          selectedChatId={selectedChatId}
          onNewChat={handleNewChat}
          onCollapse={() => setSidebarCollapsed(true)}
          onRename={handleRenameChat}
          onDelete={handleDeleteChat}
        />
      ) : (
        <div className="w-10 p-2 bg-base-300">
          <button className="btn btn-sm btn-ghost" onClick={() => setSidebarCollapsed(false)}>&gt;</button>
        </div>
      )}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-2 bg-base-100 shadow">
        </div>
    
        <ChatWindow messages={selectedMessages} loading={loading}  />
        <ChatInput onSend={handleNewMessage} />
      </div>
    </div>
  );
};

export default AskAiPage;
