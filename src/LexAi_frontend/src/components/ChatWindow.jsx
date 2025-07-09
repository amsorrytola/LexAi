import React, { useEffect, useRef } from "react";
import dayjs from "dayjs";
import { Scale } from "lucide-react";

const ChatWindow = ({ messages, loading }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {messages.length === 0 && !loading ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Scale className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Ready to Help!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start a conversation by typing your message below. I'm here to assist you with any questions or tasks.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-sm mx-auto">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="text-blue-600 dark:text-blue-400 text-sm font-medium">💡 Ask questions</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Get answers and explanations</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="text-purple-600 dark:text-purple-400 text-sm font-medium">🛠️ Get help</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Solve problems together</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-6 max-w-4xl mx-auto">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} items-start space-x-3`}
            >
              {msg.role === "assistant" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
                  <Scale className="w-5 h-5 text-white" />
                </div>
              )}

              <div className={`max-w-2xl ${msg.role === "user" ? "order-first" : ""}`}>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {msg.role === "user" ? "You" : "AI Assistant"}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {dayjs(msg.timestamp).format("HH:mm")}
                  </span>
                </div>

                <div
                  className={`rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-auto"
                      : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 shadow-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>

              {msg.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
                <Scale className="w-5 h-5 text-white" /> 
              </div>

              <div className="max-w-2xl">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Assistant</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">typing...</span>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
