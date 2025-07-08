import React from "react";
import dayjs from "dayjs";


const ChatWindow = ({ messages, loading }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-100">
   {messages.map((msg, index) => {
  return (
    <div key={index} className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}>
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          <img
            src={
              msg.role === "user"
                ? "/user-avatar.png"
                : "/ai-avatar.png"
            }
            alt={msg.role}
          />
        </div>
      </div>
      <div className="chat-header">
        {msg.role === "user" ? "You" : "AI"} •{" "}
        {dayjs(msg.timestamp).format("HH:mm")}
      </div>
      <div className="chat-bubble">{msg.content}</div>
    </div>
  );
})}


      {loading && (
        <div className="chat chat-start">
          <div className="chat-image avatar">
            <div className="w-10 rounded-full">
              <img src="/ai-avatar.png" alt="AI" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
