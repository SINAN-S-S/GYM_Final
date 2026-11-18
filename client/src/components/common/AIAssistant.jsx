import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FaRobot, FaTimes, FaPaperPlane, FaDumbbell, FaBurn, FaAppleAlt } from "react-icons/fa";
import "./AIAssistant.css";

const QUICK_PROMPTS = [
  { label: "4-Day Hypertrophy Split", icon: <FaDumbbell />, text: "Can you design a 4-day push/pull/legs/upper hypertrophy workout routine for muscle gain?" },
  { label: "Daily Protein Intake", icon: <FaAppleAlt />, text: "How much protein should I consume daily to build muscle while staying lean at 75kg?" },
  { label: "Post-Workout Recovery", icon: <FaBurn />, text: "What is the most effective post-workout recovery routine for sore muscles?" },
  { label: "Bench Press Form Cues", icon: <FaDumbbell />, text: "What are the most important form cues and safety tips for the flat barbell bench press?" },
];

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "assistant",
      text: "Welcome to AlphaFit AI Coach! I can help you with hypertrophy splits, progressive overload, diet macros, and recovery strategies. What's your fitness goal today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (messageToSend = input) => {
    const text = (messageToSend || "").trim();
    if (!text || loading) return;

    const userMsg = {
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
      const conversationHistory = messages.map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        content: m.text,
      }));

      const res = await axios.post(
        `${backendUrl}/api/ai/chat`,
        {
          message: text,
          history: conversationHistory.slice(-8), // send last 8 turns
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const replyText = res.data?.reply || "I am currently optimizing workout programs. Please try again in a moment.";

      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error("AI Coach Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: "I experienced a momentary connection delay with the AlphaFit fitness engine. Try asking again, or check your internet connection.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="alpha-ai-container">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          className="alpha-ai-fab"
          onClick={() => setIsOpen(true)}
          title="Open AlphaFit AI Fitness Assistant"
          aria-label="Open AlphaFit AI Fitness Assistant"
        >
          <div className="fab-pulse-ring"></div>
          <FaRobot className="fab-icon" />
          <span className="fab-text">AI COACH</span>
        </button>
      )}

      {/* Chat Drawer / Modal */}
      {isOpen && (
        <div className="alpha-ai-chatbox">
          {/* Header */}
          <div className="chatbox-header">
            <div className="header-info">
              <div className="ai-status-indicator">
                <span className="status-dot"></span>
                <FaRobot className="header-robot-icon" />
              </div>
              <div>
                <h3 className="header-title">ALPHAFIT AI COACH</h3>
                <span className="header-subtitle">Performance & Nutrition Engine</span>
              </div>
            </div>
            <button
              className="chatbox-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close Assistant"
            >
              <FaTimes />
            </button>
          </div>

          {/* Quick Prompts Carousel */}
          <div className="quick-prompts-bar">
            {QUICK_PROMPTS.map((qp, index) => (
              <button
                key={index}
                className="quick-prompt-chip"
                onClick={() => handleSend(qp.text)}
                disabled={loading}
              >
                {qp.icon}
                <span>{qp.label}</span>
              </button>
            ))}
          </div>

          {/* Messages Body */}
          <div className="chatbox-messages">
            {messages.map((m, idx) => (
              <div key={idx} className={`message-bubble-wrapper ${m.sender}`}>
                <div className="message-bubble">
                  <div className="message-text" style={{ whiteSpace: "pre-line" }}>
                    {m.text}
                  </div>
                  <span className="message-time">{m.time}</span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="message-bubble-wrapper assistant">
                <div className="message-bubble typing-indicator-box">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="chatbox-input-container">
            <input
              type="text"
              className="chatbox-input"
              placeholder="Ask for workouts, macros, form tips..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              className="chatbox-send-btn"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
