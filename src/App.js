import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import bgImage from './background.jpg';
import html2pdf from 'html2pdf.js';
import PDFTemplate from './components/PDFTemplate';
import { createRoot } from 'react-dom/client';
import MultiChoiceCard from './components/MultiChoiceCard';
//import QuoteTemplate from './components/QuoteTemplate';

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
      //return;
    }
    else{
      setIsByProtoOpen(false);
      setMessages([{ sender: "agent", text: `👋 Welcome to the ${topic} module! How can I assist you?` }]);
      setActiveModule(topic);
      setCompletedSteps((prev) => [...new Set([...prev, topic])]);
    }
    
    setSessionId(null);
    const newSessionId = await createSession(topic);
    setSessionId(newSessionId);
    if (topic === "Product Configuration") {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            sender: "agent",
            text: "Choose a material for the product:",
            multipleChoice: true,
            options: [
              { label: "Plastic", image: "" },
              { label: "Metal", image: "" },
              { label: "Wood", icon: "" }
            ]
          }
        ]);
      }, 500); // delay so it appears after welcome message
    }
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

  const handlePDFDownload = () => {
  const pdfData = {
    customerName: "Customer Name",
    customerAddress: "1234 Customer St, Customer Town, ST 12345",
    quoteNo: "0000226",
    quoteDate: "11-04-2023",
    dueDate: "25-04-2023",
    items: [
      {
        qty: 1,
        description: "Replacement of spark plugs",
        unitPrice: 40.00
      },
      {
        qty: 2,
        description: "Brake pad replacement (front)",
        unitPrice: 40.00
      },
      {
        qty: 4,
        description: "Wheel alignment",
        unitPrice: 17.50
      },
      {
        qty: 1,
        description: "Oil change and filter replacement",
        unitPrice: 40.00
      }
    ],
    subtotal: 230.00,
    tax: 11.50,
    total: 241.50
  };

  /*const pdfData = {
    quotationNo: '004',
    quotationDate: 'June 19, 2019',
    logo: '/logo.png', // Path to your logo image
    from: {
      companyName: 'Foobar Labs',
      address: '52-69 HSR Layout, 3rd Floor Orion mall, Bengaluru, Karnataka, India - 560055',
      pan: 'ABCDE1234F'
    },
    to: {
      companyName: 'Studio Den',
      address: '305, 3rd Floor Orion mall, Bengaluru, Karnataka, India - 560055',
      pan: 'ABCDE1234F'
    },
    placeOfSupply: 'Karnataka',
    countryOfSupply: 'India',
    items: [
      { description: 'Basic Web Development', qty: 1, rate: 10000 },
      { description: 'Logo Design', qty: 1, rate: 1000 },
      { description: 'Web Design', qty: 1, rate: 5000 },
      { description: 'Full Stack Web development', qty: 1, rate: 40000 },
    ],
    subtotal: 101000,
    discountPercent: 5,
    discountAmount: 5050,
    total: 95950,
    totalInWords: 'Ninety Thousand Nine Hundred Fifty Rupees Only',
    terms: [
      'Please pay within 15 days from the date of invoice, overdue interest @ 14% will be charged on delayed payments.',
      'Please quote invoice number when remitting funds.'
    ],
    notes: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.',
    contactEmail: 'info@foobarlabs.com',
    contactPhone: '+91-98765-43210',
    signature: '/signature.png' // Path to signature image
  };*/

  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  root.render(<PDFTemplate data={pdfData} />);

  setTimeout(() => {
    html2pdf()
      .set({
        margin: 0.5,
        filename: 'Quotation.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      })
      .from(container)
      .save()
      .then(() => {
        root.unmount();
        document.body.removeChild(container);
      });
  }, 100);
};

  return (
    <div className="app-wrapper" style={{ backgroundImage: `url(${bgImage})` }}>
      <h1 className="title">WednesdAI 3D Labs</h1>
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
                  {/*<button
                    className="open-editor-btn"
                    onClick={handlePDFDownload}
                  >
                    📄 Download Design PDF
                  </button>*/}
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
            {/*<div className="chat-body">
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
            </div>*/}
            <div className="chat-body">
              {messages.map((msg, i) => (
                <div key={i} className={`chat-message ${msg.sender}`}>
                  {msg.isLoading ? (
                    <div className="typing-indicator"><span></span><span></span><span></span></div>
                  ) : msg.sender === 'agent' && msg.multipleChoice && activeModule === 'Product Configuration' ? (
                    <MultiChoiceCard
                    text={msg.text}
                    options={msg.options}
                    onSelect={(option) => {
                      const userMsg = { sender: "user", text: option.label };
                      const loadingMsg = { sender: "agent", text: "...", isLoading: true };
                      setMessages((prev) => [...prev, userMsg, loadingMsg]);

                      sendMessageToSession(sessionId, option.label).then((resText) => {
                        setMessages((prev) => [...prev.slice(0, -1), { sender: 'agent', text: resText }]);
                      });
                    }}
                  />
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