import React, { useState, useEffect } from "react";
import { Scale } from "lucide-react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import { useUserStore } from "../store";

const AskAiPage = () => {
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const userStore = useUserStore();
  const { actor, isAuthenticated } = userStore;

  useEffect(() => {
    const fetchSessions = async () => {
      if (!isAuthenticated || !actor) return;
      try {
        const sessions = await actor.list_sessions();
        const formattedChats = sessions.map(([id, title, created_at]) => ({
          id,
          title: title?.[0] || "Untitled Chat",
          messages: [],
          lastUpdated: Number(created_at) / 1000000,
        }));
        setChats(formattedChats);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };
    fetchSessions();
  }, [actor, isAuthenticated]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChatId || !actor) return;
      try {
        const messages = await actor.get_session_messages(selectedChatId);
        setChats((prev) =>
          prev.map((c) =>
            c.id === selectedChatId
              ? {
                  ...c,
                  messages: messages.map((msg) => ({
                    role: msg.role,
                    content: msg.content,
                    timestamp: new Date().toISOString(),
                  })),
                }
              : c
          )
        );
      } catch (error) {
        console.error("Error fetching session messages:", error);
      }
    };
    fetchMessages();
  }, [selectedChatId, actor]);

  const handleNewMessage = async (message) => {
    let chatId = selectedChatId;

    if (!chatId) {
      try {
        chatId = await actor.start_session(["New Chat"]);
        const newChat = {
          id: chatId,
          title: "New Chat",
          messages: [],
          lastUpdated: Date.now(),
        };
        setChats((prev) => [newChat, ...prev]);
        setSelectedChatId(chatId);
      } catch (error) {
        console.error("Error starting session:", error);
        return;
      }
    }

    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              messages: [
                ...c.messages,
                { role: "user", content: message, timestamp: new Date().toISOString() },
              ],
              lastUpdated: Date.now(),
            }
          : c
      )
    );

    setLoading(true);
    try {
      const chatResponse = await actor.chat_in_session(chatId, message);
      setChats((prev) =>
        prev
          .map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  messages: [
                    ...c.messages,
                    { role: "assistant", content: chatResponse, timestamp: new Date().toISOString() },
                  ],
                  lastUpdated: Date.now(),
                }
              : c
          )
          .sort((a, b) => b.lastUpdated - a.lastUpdated)
      );
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setLoading(false);
  };

  const handleNewChat = async () => {
    try {
      const sessionId = await actor.start_session(["New Chat"]);
      const newChat = {
        id: sessionId,
        title: "New Chat",
        messages: [],
        lastUpdated: Date.now(),
      };
      setChats((prev) => [newChat, ...prev]);
      setSelectedChatId(sessionId);
    } catch (error) {
      console.error("Error starting new chat:", error);
    }
  };

  const handleRenameChat = async (chatId, newTitle) => {
    try {
      const success = await actor.rename_session(chatId, newTitle);
      if (success) {
        setChats((prev) =>
          prev.map((c) => (c.id === chatId ? { ...c, title: newTitle } : c))
        );
      }
    } catch (error) {
      console.error("Error renaming session:", error);
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      const success = await actor.delete_session(chatId);
      if (success) {
        setChats((prev) => prev.filter((c) => c.id !== chatId));
        if (chatId === selectedChatId) setSelectedChatId(null);
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const selectedMessages = chats.find((c) => c.id === selectedChatId)?.messages || [];

  return (
    <div className="flex h-screen bg-gray-100">
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
        <div className="w-12 flex items-start justify-center pt-4 bg-gray-100 border-r border-gray-200">
          <button
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-gray-600 hover:text-gray-900"
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
        
        <ChatWindow messages={selectedMessages} loading={loading} />
        <ChatInput onSend={handleNewMessage} />
      </div>
    </div>
  );
};

export default AskAiPage;