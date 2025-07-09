import React, { useState } from 'react';
import { Scale } from 'lucide-react';
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
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
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
        <div className="w-12 flex items-start justify-center pt-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-r border-gray-200 dark:border-gray-700">
          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            onClick={() => setSidebarCollapsed(false)}
            aria-label="Expand sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-16 flex items-center justify-between px-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center space-x-3">
            <Scale className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">AI Assistant</h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {selectedChatId ? 'Active Chat' : 'No Chat Selected'}
            </span>
          </div>
        </div>

        <ChatWindow messages={selectedMessages} loading={loading} />
        <ChatInput onSend={handleNewMessage} />
      </div>
    </div>
  );
};

export default AskAiPage;