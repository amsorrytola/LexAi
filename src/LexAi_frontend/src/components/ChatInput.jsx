import React, { useState } from 'react';

const ChatInput = ({ onSend }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput('');
  };

  return (
    <div className="p-4 bg-base-300 flex gap-2">
      <input
        className="input input-bordered w-full"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Ask something..."
      />
      <button className="btn btn-primary" onClick={handleSend}>Send</button>
    </div>
  );
};

export default ChatInput;
