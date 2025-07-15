import React from "react";
import { Link } from "react-router-dom";

const SessionList = ({ sessions }) => {
  return (
    <div className="border-b border-gray-200 pb-8 animate-slide-in">
      <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Chat Sessions</h2>
      {sessions.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl shadow-sm">
          <svg
            className="w-16 h-16 mx-auto mb-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="text-sm font-medium">No chat sessions yet</p>
          <p className="text-xs mt-2">Start a new conversation in the AI Assistant</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((session) => (
            <Link
              key={session.id}
              to={`/ask?session=${session.id}`}
              className="relative block p-5 rounded-xl bg-white hover:bg-indigo-50 transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-0.5 overflow-hidden group"
            >
              <span className="absolute inset-0 bg-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate">{session.title}</p>
                  <p className="text-xs text-gray-500 mt-1">Created: {session.created_at}</p>
                </div>
                <svg
                  className="w-5 h-5 text-indigo-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionList;