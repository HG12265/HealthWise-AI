import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import { request } from "../services/api";
import "./AIChat.css";

function AIChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  // Check if user is authenticated
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial greeting message
  useEffect(() => {
    setMessages([
      {
        id: 1,
        type: "bot",
        text: "👋 Hi! I'm your HealthWise AI Assistant. I can help you with questions about health, nutrition, and dietetics. What would you like to know?",
        timestamp: new Date(),
      },
    ]);
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    // Add user message to chat
    const userMessage = {
      id: messages.length + 1,
      type: "user",
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setError("");

    try {
      // Send message to backend for Gemini AI processing
      const response = await request("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: inputValue }),
      });

      if (response.success) {
        const botMessage = {
          id: messages.length + 2,
          type: "bot",
          text: response.reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        setError(response.message || "Failed to get response from AI");
        const errorMessage = {
          id: messages.length + 2,
          type: "error",
          text: response.message || "Failed to get response from AI",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setError("Connection error. Please try again.");
      const errorMessage = {
        id: messages.length + 2,
        type: "error",
        text: "Connection error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="aichat-container">
      <div className="aichat-wrapper">
        {/* Header */}
        <div className="aichat-header">
          <div className="aichat-header-content">
            <h1>💬 HealthWise AI Chat</h1>
            <p>Ask me anything about health, nutrition, and dietetics</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="aichat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.type}`}>
              <div className="message-content">
                <p>{msg.text}</p>
                <span className="message-time">
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message bot loading">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="aichat-footer">
          {error && <div className="chat-error">{error}</div>}
          <form onSubmit={handleSendMessage} className="chat-input-form">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask your health question..."
              className="chat-input"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={isLoading || !inputValue.trim()}
            >
              {isLoading ? "..." : "Send"}
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className="aichat-info">
          <p>
            <strong>Note:</strong> This chatbot is designed to provide educational
            information about health, nutrition, and dietetics. It is not a substitute
            for professional medical advice. Please consult a healthcare provider for
            medical concerns.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AIChat;
