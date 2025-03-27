import React, { useState, useEffect, useRef } from "react";
import api from "../api";

const Chatbot = ({ setShowChatbot }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null); // Reference for auto-scrolling

  // Function to scroll to the bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Function to handle sending message
  const sendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage = { text: input, isUser: true };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      // const response = await api.post("/chatbot", { query: input });
      const response = await api.post("/llm-chatbot", { query: input });

      // Convert response text to an array of lines to maintain newlines
      const botMessage = { sender: "bot", text: response.data.response.split("\n") };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: ["Error retrieving response. Try again!"] },
      ]);
    }

    setInput(""); // Clear input field
  };

  return (
    <div className="fixed bottom-16 right-6 bg-white border border-gray-300 shadow-lg rounded-lg w-80 h-96 flex flex-col">
      {/* Chatbot Header */}
      <div className="flex justify-between items-center bg-blue-600 text-white px-4 py-2 rounded-t-lg">
        <h3 className="text-lg font-bold">Ask Me Bot</h3>
        <button onClick={() => setShowChatbot(false)} className="text-white text-xl">
          ❌
        </button>
      </div>

      {/* Chatbox */}
      <div className="p-4 h-64 overflow-y-auto flex flex-col space-y-2">
        <p className="bg-blue-400 p-2 rounded-md self-start">
          Hi! I'm Ask Me Bot. I am here to help you with fetching data from databases.
        </p>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 rounded-md whitespace-pre-line ${
              msg.isUser ? "bg-green-500 self-end" : "bg-blue-400 self-start"
            }`}
          >
            {Array.isArray(msg.text)
              ? msg.text.map((line, i) => <p key={i}>{line}</p>)
              : msg.text}
          </div>
        ))}
        {/* Empty div to auto-scroll to bottom */}
        <div ref={messagesEndRef} />
      </div>

      {/* User Input */}
      <div className="p-3 border-t border-gray-300 flex">
        <input
          type="text"
          className="flex-1 bg-gray-100 p-2 rounded-md outline-none text-black"
          placeholder="Enter message here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()} // Send on Enter key press
        />
        <button onClick={sendMessage} className="bg-blue-600 text-white px-3 py-2 rounded-md ml-2">
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
