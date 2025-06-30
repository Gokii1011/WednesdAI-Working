import React, { useState, useRef, useEffect } from "react";
import "./App.css";

const topics = ["WednesdAI", "B Y Porto", "Product Configuration", "cafe"];

function App() {
  const [activeModule, setActiveModule] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [isByProtoOpen, setIsByProtoOpen] = useState(false);
  const [selectedSketch, setSelectedSketch] = useState(1);
  const recordTimerRef = useRef(null);
  const chatEndRef = useRef(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const createSession = async (topic) => {
    const res = await fetch("http://localhost:5001/create-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({topic})
    });
    const data = await res.json();
    const id = data.sessionId ? data.sessionId : null;
    setSessionId(id);
    return id;
  };

  const sendMessageToSession = async (sessionId, text) => {
    const res = await fetch(`http://localhost:5001/session/${sessionId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: {
          sequenceId: Date.now(),
          type: "Text",
          text
        }
      })
    });
    const data = await res.json();
    return data?.messages?.[0]?.message || data?.messages?.[0]?.text || "(no response)";
  };

  const closeProtoWindow = () => {
    setIsByProtoOpen(false);
  };

  const handleTopicClick = async (topic) => {
    if(topic === 'B Y Porto'){
      setIsByProtoOpen(true);
      setActiveModule(null);
      return;
    }
    setIsByProtoOpen(false);
    setMessages([{ sender: "agent", text: `👋 Welcome to the ${topic} module! How can I assist you?` }]);
    setActiveModule(topic);
    setSessionId(null);
    const newSessionId = await createSession(topic);
    setSessionId(newSessionId);
    setCompletedSteps((prev) => [...new Set([...prev, topic])]);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    const loadingMsg = { sender: "agent", text: "...", isLoading: true };
    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput("");

    try {
      const resText = await sendMessageToSession(sessionId, input);
      setMessages((prev) => [...prev.slice(0, -1), { sender: "agent", text: resText }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev.slice(0, -1), { sender: "agent", text: "❌ Failed to contact agent." }]);
    }
  };

  const toggleVoiceRecording = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert("Your browser doesn't support Speech Recognition.");
      return;
    }

    if (!isRecording) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      setIsRecording(true);
      setRecordTime(0);
      recordTimerRef.current = setInterval(() => setRecordTime(prev => prev + 1), 1000);

      recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        clearInterval(recordTimerRef.current);
        setIsRecording(false);
        setMessages(prev => [...prev, { sender: 'user', text: transcript }, { sender: 'agent', text: "...", isLoading: true }]);
        const resText = await sendMessageToSession(sessionId, transcript);
        setMessages(prev => [...prev.slice(0, -1), { sender: 'agent', text: resText }]);
      };

      recognition.onerror = (e) => {
        console.error("Speech recognition error:", e.error);
        clearInterval(recordTimerRef.current);
        setIsRecording(false);
        setMessages(prev => [...prev, { sender: 'agent', text: "❌ Could not recognize speech." }]);
      };

      recognition.onend = () => {
        clearInterval(recordTimerRef.current);
        setIsRecording(false);
      };

      recognition.start();
    }

  };

  return (
    <div className="app-wrapper">
      <h1 className="title">3D Printing Modules</h1>
      <div className="module-grid">
        {topics.map((name, index) => (
          <div key={name} className="module-card-container">
            <div
              className={`module-card ${completedSteps.includes(name) ? 'completed' : ''}`}
              onClick={() => handleTopicClick(name)}
            >
              <div className="icon-circle" />
              <p>{name}</p>
            </div>
            {index < topics.length - 1 && <div className="route-line" />}
          </div>
        ))}
      </div>

      {isByProtoOpen && (
        <div className="chat-overlay">
          <div className="chat-box-window2">
            <div className="chat-header2">
              <h2>🧪 B Y Proto Module</h2>
              <button onClick={closeProtoWindow} className="close-btn">
                ×
              </button>
            </div>

            <div className="carousel-container">
              <div className="carousel-track">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`carousel-item ${
                      selectedSketch === i ? "focused" : "blurred"
                    }`}
                    onClick={() => setSelectedSketch(i)}
                  >
                    <img
                      src={`/sketches/sketch${i + 1}.png`}
                      alt={`Sketch ${i + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                className="open-editor-btn"
                onClick={() => {
                  setIsEditorOpen(true);
                  closeProtoWindow();
                }}
              >
                ✍️ Open Design Editor
              </button>
            </div>
          </div>
        </div>
      )}
      {isEditorOpen && (
        <div className="editor-overlay">
          <div className="editor-window">
            <div className="editor-header">
              <h3>🖊️ Design Editor</h3>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>

            <div className="editor-body">
              <div className="editor-image">
                <img
                  src={`/sketches/sketch${selectedSketch + 1}.png`}
                  alt="Selected Sketch"
                />
              </div>

              <div className="editor-divider" />

              <div className="editor-input">
                <textarea placeholder="Describe your design requirements here..." />
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                  <button
                    className="open-editor-btn"
                    onClick={() => {
                      
                    }}
                  >
                    Show Suggestions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModule && (
        <div className="chat-overlay">
          <div className="chat-box-window">
            <div className="chat-header">
              <h2>{activeModule} Assistant</h2>
              <button onClick={() => setActiveModule(null)} className="close-btn">×</button>
            </div>
            <div className="chat-body">
              {messages.map((msg, i) => (
                <div key={i} className={`chat-message ${msg.sender}`}>
                  {msg.isLoading ? (
                    <div className="typing-indicator"><span></span><span></span><span></span></div>
                  ) : (
                    <p dangerouslySetInnerHTML={{ __html: msg.text }}></p>
                  )}
                </div>
              ))}
              <div ref={chatEndRef}></div>
            </div>
            <form className="chat-input" onSubmit={sendMessage}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
              />
              <button type="submit">Send</button>
              <button type="button" onClick={toggleVoiceRecording} className={`mic-btn ${isRecording ? 'recording' : ''}`}>
                🎙️ {isRecording && `${recordTime}s`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;