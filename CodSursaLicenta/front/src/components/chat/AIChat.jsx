"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, User } from "react-feather"
import { RiRobot3Fill } from "react-icons/ri";

import { sendChatMessage, clearChatHistory } from "../../api/api";
import "./AIChat.css"

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [hasNewMessage, setHasNewMessage] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setHasNewMessage(false)
    }
  }, [isOpen])

  
  // const simulateAIResponse = (userMessage) => {
  //   const responses = [
  //     "That's a great question! Let me help you with that.",
  //     "I understand what you're looking for. Here's what I can suggest:",
  //     "Based on your request, I recommend the following approach:",
  //     "That's interesting! Let me provide you with some insights:",
  //     "I'd be happy to assist you with that. Here's my recommendation:",
  //     "Great point! Here's how you can approach this:",
  //     "I can definitely help you with that task. Let me guide you:",
  //     "That's a common question. Here's what you should know:",
  //   ]

  //   const lowerMessage = userMessage.toLowerCase()

  //   if (lowerMessage.includes("calendar") || lowerMessage.includes("schedule")) {
  //     return "I can help you manage your calendar! You can add new events, view your schedule, or set reminders. Would you like me to guide you through any specific calendar feature?"
  //   }

  //   if (lowerMessage.includes("task") || lowerMessage.includes("todo")) {
  //     return "For task management, you can create new tasks, set priorities, and track your progress. I can help you organize your tasks more efficiently. What specific task management feature interests you?"
  //   }

  //   if (lowerMessage.includes("friend") || lowerMessage.includes("contact")) {
  //     return "You can manage your friends and contacts in the Friends section. Add new contacts, organize groups, or sync with your existing contacts. Need help with any specific contact management feature?"
  //   }

  //   if (lowerMessage.includes("settings") || lowerMessage.includes("profile")) {
  //     return "In Settings, you can customize your profile, notification preferences, privacy settings, and more. What specific setting would you like to adjust?"
  //   }

  //   if (lowerMessage.includes("help") || lowerMessage.includes("how")) {
  //     return "I'm here to help! You can ask me about calendar management, task organization, friend connections, or any feature of the Daily Planner. What would you like to learn about?"
  //   }

  //   return responses[Math.floor(Math.random() * responses.length)]
  // }

  // const handleSendMessage = async () => {
  //   if (!inputMessage.trim()) return

  //   const userMessage = {
  //     id: Date.now(),
  //     text: inputMessage,
  //     sender: "user",
  //     timestamp: new Date(),
  //   }

  //   setMessages((prev) => [...prev, userMessage])
  //   setInputMessage("")
  //   setIsTyping(true)

  //   setTimeout(
  //     () => {
  //       const aiResponse = {
  //         id: Date.now() + 1,
  //         text: simulateAIResponse(inputMessage),
  //         sender: "ai",
  //         timestamp: new Date(),
  //       }

  //       setMessages((prev) => [...prev, aiResponse])
  //       setIsTyping(false)

  //       // Show notification if chat is closed
  //       if (!isOpen) {
  //         setHasNewMessage(true)
  //       }
  //     },
  //     1000 + Math.random() * 2000,
  //   )
  // }

// 
const handleSendMessage = async () => {
  if (!inputMessage.trim()) return;

  const userMessage = {
    id: Date.now(),
    text: inputMessage,
    sender: "user",
    timestamp: new Date(),
  };

  setMessages((prev) => [...prev, userMessage]);
  setInputMessage("");
  setIsTyping(true);

  try {
    // Apelează backend-ul
    const res = await sendChatMessage(inputMessage);
    const aiText = typeof res.data === "string" ? res.data : res.data.text || "AI did not respond.";

    const aiResponse = {
      id: Date.now() + 1,
      text: aiText,
      sender: "ai",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiResponse]);
  } catch (err) {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 2,
        text: "Sorry, I couldn't reach the AI service.",
        sender: "ai",
        timestamp: new Date(),
      },
    ]);
  } finally {
    setIsTyping(false);
    if (!isOpen) setHasNewMessage(true);
  }
};

// CLEAR CHAT HISTORY
const handleCloseChat = async () => {
  setIsOpen(false);
  setMessages([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  try {
    await clearChatHistory();
  } catch (err) {
    // poți ignora sau afișa o eroare
  }
};

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setHasNewMessage(false)
    }
  }

  return (
    <>
      {/* Floating Chat Button - Always Visible */}
      <div className="floating-chat-button" onClick={isOpen ? handleCloseChat : toggleChat}>
        <div className={`chat-button ${isOpen ? "active" : ""}`}>
          {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
          {hasNewMessage && !isOpen && <span className="notification-dot"></span>}
        </div>
      </div>

      {/* Chat Overlay */}
      {isOpen && (
        <div className="chat-overlay">
          <div className="chat-container">
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-header-info">
                <div className="ai-avatar">
                  <RiRobot3Fill size={20} />
                </div>
                <div className="chat-title">
                  <h3>AI Assistant</h3>
                  <span className="chat-status">Online</span>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="chat-messages">
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.sender}`}>
                  <div className="message-avatar">
                    {message.sender === "ai" ? <RiRobot3Fill size={16} /> : <User size={16} />}
                  </div>
                  <div className="message-content">
                    <div className="message-text">{message.text}</div>
                    <div className="message-time">{formatTime(message.timestamp)}</div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="message ai">
                  <div className="message-avatar">
                    <RiRobot3Fill size={16} />
                  </div>
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

            {/* Chat Input */}
            <div className="chat-input-container">
              <div className="chat-input-wrapper">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="chat-input"
                  rows="1"
                />
                <button
                  className="send-button"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  title="Send message"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AIChat
