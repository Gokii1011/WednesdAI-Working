import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import bgImage from "./IMG_8657.jpg";
import html2pdf from "html2pdf.js";
import PDFTemplate from "./components/PDFTemplate";
import { createRoot } from "react-dom/client";
import MultiChoiceCard from "./components/MultiChoiceCard";
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
  const [transcriptText, setTranscriptText] = useState("");
  const [cafeResponse, setcafeResponseText] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const recognitionRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);
  const [editorInput, setEditorInput] = useState(""); //state to hold the suggestions input
  var sessid = ""; //created to store the session id for Cafeteria Agent
  const [isPrinting, setIsPrinting] = useState(false);
  const [printTimer, setPrintTimer] = useState(5 * 60); // 10 minutes

  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [colors, setColors] = useState([]);
  const [hexCodes, setHexCodes] = useState([]);
  const [suggestionNote, setSuggestionNote] = useState("");
  const [materialType, setMaterialType] = useState([]);
  const [selectedColorIndex, setSelectedColorIndex] = useState(null);
  const [selectedMaterialIndex, setSelectedMaterialIndex] = useState(null);

  useEffect(() => {
    scrollToBottom();

    if ("webkitSpeechRecognition" in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = async (event) => {
        if (sessid === "") {
          const newSessionId = await createSession("cafe");
          sessid = newSessionId;
          console.log("newsessionidinner" + newSessionId);
        }
        const transcript = event.results[0][0].transcript;
        setTranscriptText(transcript);
        setIsRecording(false);
        console.log("newsss" + sessid);
        const resText = await sendMessageToSession(sessid, transcript);
        setcafeResponseText(resText);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setcafeResponseText("");
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, [messages]);

  useEffect(() => {
    let timer;
    if (isPrinting && printTimer > 0) {
      timer = setInterval(() => {
        setPrintTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPrinting, printTimer]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const createSession = async (topic) => {
    try {
      const res = await fetch("http://localhost:5001/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      const id = data.sessionId ? data.sessionId : null;
      setSessionId(id);
      return id;
    } catch (error) {
      console.log(error);
    }
  };

  const sendMessageToSession = async (sessionId, text) => {
    try {
      const res = await fetch(
        `http://localhost:5001/session/${sessionId}/message`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: {
              sequenceId: Date.now(),
              type: "Text",
              text,
            },
          }),
        }
      );
      const data = await res.json();
      return (
        data?.messages?.[0]?.message ||
        data?.messages?.[0]?.text ||
        "(no response)"
      );
    } catch (error) {
      console.log(error);
    }
  };

  const closeProtoWindow = () => {
    setIsByProtoOpen(false);
  };

  const handleTopicClick = async (topic) => {
    if (topic === "B Y Porto") {
      setIsByProtoOpen(true);
      setActiveModule(null);
      return;
    }
    if (topic === "cafe") {
      setActiveModule(topic);
      setMessages([
        {
          sender: "agent",
          text: `👋 Welcome to the ${topic} module! How can I assist you?`,
        },
      ]);
    } else {
      setIsByProtoOpen(false);
      setMessages([
        {
          sender: "agent",
          text: `👋 Welcome to the ${topic} module! How can I assist you?`,
        },
      ]);
      setActiveModule(topic);
      setCompletedSteps((prev) => [...new Set([...prev, topic])]);
    }

    setSessionId(null);
    const newSessionId = await createSession(topic);
    console.log("newsessionid", newSessionId);
    setSessionId(newSessionId);
    if (topic === "Product Configuration") {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            sender: "agent",
            text: "Choose a material for the product:",
            multipleChoice: true,
            options: [
              { label: "Plastic", image: "" },
              { label: "Metal", image: "" },
              { label: "Wood", icon: "" },
            ],
          },
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
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { sender: "agent", text: resText },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { sender: "agent", text: "❌ Failed to contact agent." },
      ]);
    }
  };

  const toggleVoiceRecording = () => {
    console.log("inside1");
    if (!recognitionRef.current) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    if (!isRecording) {
      setIsRecording(true);
      console.log("insidee1");
      //sendMessageToSession(sessionId,'Hi');
      console.log("insidee2");
      recognitionRef.current.start();
    } else {
      recognitionRef.current.stop();
      console.log("insidee3");
      setIsRecording(false);
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
          unitPrice: 40.0,
        },
        {
          qty: 2,
          description: "Brake pad replacement (front)",
          unitPrice: 40.0,
        },
        {
          qty: 4,
          description: "Wheel alignment",
          unitPrice: 17.5,
        },
        {
          qty: 1,
          description: "Oil change and filter replacement",
          unitPrice: 40.0,
        },
      ],
      subtotal: 230.0,
      tax: 11.5,
      total: 241.5,
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

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    root.render(<PDFTemplate data={pdfData} />);

    setTimeout(() => {
      html2pdf()
        .set({
          margin: 0.5,
          filename: "Quotation.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        })
        .from(container)
        .save()
        .then(() => {
          root.unmount();
          document.body.removeChild(container);
        });
    }, 100);
  };

  /**************************************/
  //B Y Prototype logic
  const sendSuggestion = (e) => {
    console.log("1", editorInput);
    setLoadingSuggestions(true); // show spinner
    sendSuggestionText(editorInput);
  };

  const startPrinting = () => {
    setIsPrinting(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const closeChat = () => {
    setActiveModule(null);
    setMessages([]);
    setInput("");
    sessid = "";
    setTranscriptText("");
  };

  const sendSuggestionText = async (text) => {
    console.log("2", editorInput);
    try {
      const res = await fetch(`http://localhost:5001/call-template`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPreview: false,
          inputParams: {
            valueMap: {
              "Input:userQuery": {
                value: "" + text,
              },
            },
          },
          additionalConfig: {
            numGenerations: "1",
            temperature: "0.0",
            applicationName: "PromptTemplateGenerationsInvocable",
          },
        }),
      });
      const data = await res.json();
      const rawText = data.generations[0].text;
      console.log(data);
      console.log(rawText);
      processSuggestionResponse(rawText);
      return (
        data?.messages?.[0]?.message ||
        data?.messages?.[0]?.text ||
        "(no response)"
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingSuggestions(false);
      //setShowSuggestions(true); untoggle to view the next page
    }
  };

  const processSuggestionResponse = (data) => {
    const parsedData = JSON.parse(data);
    console.log(parsedData);

    const results = parsedData.results;
    const reason = parsedData.reason;

    const newMaterials = [];
    const newMaterialType = [];
    const newColors = [];
    const newHexCodes = [];

    results.forEach((item) => {
      newMaterials.push(item["Material Name"]);
      newMaterialType.push(item["Material Type"]);
      newColors.push(item["Color Name"]);
      newHexCodes.push(item["Color Hex code"]);
    });

    setMaterials(newMaterials);
    setColors(newColors);
    setMaterialType(newMaterialType);
    setHexCodes(newHexCodes);
    setSuggestionNote(reason);

    console.log("SuggestionNote", reason);
    console.log("newMaterials", newMaterials);
    console.log("newMaterialType", newMaterialType);
    console.log("newHexCodes", newHexCodes);
    console.log("newColors", newColors);

    setLoadingSuggestions(false); // stop loading spinner
    setShowSuggestions(true); // now show the suggestion screen
  };

  return (
    <div className="app-wrapper" style={{ backgroundImage: `url(${bgImage})` }}>
      <h1 className="title">WednesdAI 3D Labs</h1>
      <div className="module-layer">
        {/* WednesdAI */}
        <div
          className="module-card-container"
          style={{ top: "12%", left: "15%" }}
          onClick={() => handleTopicClick("WednesdAI")}
        >
          <div
            className={`module-card ${
              completedSteps.includes("WednesdAI") ? "completed" : ""
            }`}
          >
            <p>WednesdAI</p>
          </div>
        </div>

        {/* B Y Porto */}
        <div
          className="module-card-container"
          style={{ top: "71%", left: "17%" }}
          onClick={() => handleTopicClick("B Y Porto")}
        >
          <div
            className={`module-card ${
              completedSteps.includes("B Y Porto") ? "completed" : ""
            }`}
          >
            <p>B&nbsp;Y&nbsp;Porto</p>
          </div>
        </div>

        {/* Product Configuration */}
        <div
          className="module-card-container"
          style={{ top: "32%", left: "63%" }}
          onClick={() => handleTopicClick("Product Configuration")}
        >
          <div
            className={`module-card ${
              completedSteps.includes("Product Configuration")
                ? "completed"
                : ""
            }`}
          >
            {/*<div className="icon-circle">*/}
            <p>
              Product
              <br />
              Configuration
            </p>
          </div>
        </div>

        {/* cafe */}
        <div
          className="module-card-container"
          style={{ top: "75%", left: "75%" }}
          onClick={() => handleTopicClick("cafe")}
        >
          <div
            className={`module-card ${
              completedSteps.includes("cafe") ? "completed" : ""
            }`}
          >
            <p>cafe</p>
          </div>
        </div>
      </div>

      {isByProtoOpen && (
        <div className="chat-overlay">
          <div className="chat-box-window2">
            <div className="chat-header2">
              <h3>B Y Proto (Build Your Prototype)</h3>
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
              <h3>Design Editor</h3>
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
                {loadingSuggestions ? (
                  <div className="loading-spinner">
                    <div className="spinner" />
                    <p>Generating suggestions...</p>
                  </div>
                ) : !showSuggestions ? (
                  <>
                    <textarea
                      placeholder="Describe your design requirements here..."
                      value={editorInput}
                      onChange={(e) => setEditorInput(e.target.value)}
                    />
                    <div style={{ textAlign: "center", marginTop: "20px" }}>
                      <button
                        className="open-editor-btn"
                        onClick={sendSuggestion}
                      >
                        Show Suggestions
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="suggestion-content">
                    {/* Color Section */}
                    <div className="suggestion-section">
                      <h3>Suggested Colors</h3>
                      <div className="color-box-container">
                        {colors.map((color, index) => (
                          <div
                            key={index}
                            className={`material-row2 selectable-card ${
                              selectedColorIndex === index ? "selected" : ""
                            }`}
                            onClick={() => setSelectedColorIndex(index)}
                          >
                            <div
                              className="color-box"
                              style={{ backgroundColor: hexCodes[index] }}
                            />
                            <p className="color-label">{color}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Material Section */}
                    <div className="suggestion-section">
                      <h3>Suggested Materials</h3>
                      <div className="material-row">
                        {materials.map((material, index) => (
                          <div
                            key={index}
                            className={`material-card selectable-card ${
                              selectedMaterialIndex === index ? "selected" : ""
                            }`}
                            onClick={() => setSelectedMaterialIndex(index)}
                          >
                            <p>
                              <strong>{material}</strong>
                            </p>
                            <p className="material-type">
                              ({materialType[index]})
                            </p>{" "}
                            {/* optional */}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Highlight */}
                    <div className="suggestion-highlight">
                      <p>{suggestionNote}</p>
                    </div>

                    {/* Timer or Buttons */}
                    {isPrinting ? (
                      <div className="printing-status">
                        <h3>🖨️ Printing in progress</h3>
                        <p>
                          Estimated time remaining: {formatTime(printTimer)}
                        </p>
                        <div className="progress-bar-container">
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${(1 - printTimer / 600) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <div className="suggestion-actions">
                        <button
                          className="go-back-btn"
                          onClick={() => {
                            setShowSuggestions(false);
                            setEditorInput("");
                          }}
                        >
                          ← Change Prompt
                        </button>
                        <button className="print-btn" onClick={startPrinting}>
                          Print →
                        </button>
                      </div>
                    )}
                  </div>
                )}
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
              <button
                onClick={() => setActiveModule(null)}
                className="close-btn"
              >
                ×
              </button>
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
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  ) : msg.sender === "agent" &&
                    msg.multipleChoice &&
                    activeModule === "Product Configuration" ? (
                    <MultiChoiceCard
                      text={msg.text}
                      options={msg.options}
                      onSelect={(option) => {
                        const userMsg = { sender: "user", text: option.label };
                        const loadingMsg = {
                          sender: "agent",
                          text: "...",
                          isLoading: true,
                        };
                        setMessages((prev) => [...prev, userMsg, loadingMsg]);

                        sendMessageToSession(sessionId, option.label).then(
                          (resText) => {
                            setMessages((prev) => [
                              ...prev.slice(0, -1),
                              { sender: "agent", text: resText },
                            ]);
                          }
                        );
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
            </form>
          </div>
        </div>
      )}
      {activeModule === "cafe" && (
        <div className="chat-overlay">
          <div className="chat-box-window">
            <div className="chat-header2">
              <h2>☕ WednesdAI Cafe</h2>
              <button
                className="menu-trigger"
                onClick={() => setShowMenu((prev) => !prev)}
              >
                ☰ Menu
              </button>
              <button onClick={closeChat} className="close-btn">
                ×
              </button>
            </div>
            <div className={`cafe-body3 ${showMenu ? "menu-blur" : ""}`}>
              {showMenu && (
                <div className="menu-overlay">
                  <h3>Beverages:</h3>
                  <ul>
                    <li>Cold Coffee</li>
                    <li>Coffee</li>
                    <li>Tea</li>
                    <li>Ice Tea</li>
                  </ul>
                  <h3>Snacks:</h3>
                  <ul>
                    <li>Great Indian Samosa</li>
                    <li>Biscuits x2</li>
                  </ul>
                </div>
              )}
              <button
                className={`mic-button ${isRecording ? "recording" : ""}`}
                onClick={toggleVoiceRecording}
              >
                🎙️
              </button>
              <p className="mic-status">
                {isRecording
                  ? "🎙️ Listening... Tap again to finish."
                  : "Tap 🎙️ to Order"}
              </p>
              {transcriptText && (
                <div className="transcript-display">
                  <p>
                    <strong>You said:</strong> {transcriptText}
                  </p>
                </div>
              )}
              {cafeResponse && (
                <div className="response-display">
                  <p>
                    <strong>Cafe Agent: </strong> {cafeResponse}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
