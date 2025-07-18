import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import bgImage from "./AdobeStock_1041407944.jpeg";
import html2pdf from "html2pdf.js";
import PDFTemplate from "./components/PDFTemplate";
import { createRoot } from "react-dom/client";
import MultiChoiceCard from "./components/MultiChoiceCard";
import tickIcon from "./tick.png";
import hypercare from "./lightning.png";
import requested from "./Requesteds.png";
//import QuoteTemplate from './components/QuoteTemplate';

//const topics = ["WednesdAI", "B Y Porto", "Product Configuration", "cafe"];
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

  //BYPROTO
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [colors, setColors] = useState([]);
  const [hexCodes, setHexCodes] = useState([]);
  const [suggestionNote, setSuggestionNote] = useState("");
  const [materialType, setMaterialType] = useState([]);
  const [selectedColorIndex, setSelectedColorIndex] = useState(null);
  const [selectedMaterialIndex, setSelectedMaterialIndex] = useState(null);

  //Buttons
const [currentConfigStep, setCurrentConfigStep] = useState(-1);
const [configAnswers, setConfigAnswers] = useState({});
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedModuleBY, setSelectedModuleBY] = useState(null);
  const [selectedModuleCon, setSelectedModuleCon] = useState(null);
  const [selectedModuleCafe, setSelectedModuleCafe] = useState(null);
  const productDetailsRef = useRef({});

  //Slack
  const [supportActive, setSupportActive] = useState(true);
  const [floorName, setFloorName] = useState('');

  var floor = '';

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

  const handleSupportClick = () => {
      setSupportActive(!supportActive);
      console.log(supportActive);
      const arr = [selectedModule, selectedModuleBY, selectedModuleCon, selectedModuleCafe];
      console.log("selectedModule",selectedModule);
      console.log("selectedModuleBY",selectedModuleBY);
      console.log("selectedModuleCon",selectedModuleCon);
      console.log("selectedModuleCafe",selectedModuleCafe);
      var selectedFloor='';
      const firstNullIndex = arr.findIndex(val => val === null || val === '');
      if(firstNullIndex!= null || firstNullIndex != -1)
      {
        const arrWName = ["WednesdAI Assistant", "B Y Proto", "Configure Product", "Cafe"];
        selectedFloor = arrWName[firstNullIndex-1];
      }
      if(firstNullIndex=== -1 )
      {
        selectedFloor = "Cafe";
      }
      console.log("sending floor:", selectedFloor);

      sendSlackText(selectedFloor);
  }

  const handleTopicClick = async (topic) => {
    floor = topic;
    console.log('topic value',topic);
    console.log('floorname', floor);
    if(topic === "WednesdAI")
    {
     setSelectedModule((topic) =>
    topic === "WednesdAI" ? null : "WednesdAI"
    )
  }

    if (topic === "B Y Porto") {
       setSelectedModuleBY((topic) =>
      topic === "B Y Porto" ? null : "B Y Porto")
      setIsByProtoOpen(true);
      setActiveModule(null);
      return;
    }

    if (topic === "Product Configuration") {
      setSelectedModuleCon((topic) =>
      topic === "Product Configuration" ? null : "Product Configuration"
      )
    }
    
    if (topic === "cafe") {
      setSelectedModuleCafe((topic) =>
      topic === "cafe" ? null : "cafe"
      )
      setActiveModule(topic);
      setMessages([
        {
          sender: "agent",
          text: `👋 Welcome to the ${topic} module! How can I assist you?`,
        },
      ]);
    }else if(topic !== "Product Configuration"){
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
      setCurrentConfigStep(-1);
      setConfigAnswers({});
      setMessages([
        {
          sender: "agent",
          text: `👋 Welcome to the ${topic} module! How can I assist you?`,
        },
      ]);
      setIsByProtoOpen(false);
      setActiveModule(topic);
      setCompletedSteps((prev) => [...new Set([...prev, topic])]);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            sender: "agent",
            text: "Let's get started! Please choose the product you want to design?<br/>- Hearing Aid<br/> - Phone Case<br/> - EyeGlass Frame<br/> - Toy Model",
          },
        ]);
      }, 500);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    /*Product Configuration*/
    // Product Configuration Flow: Capture product name or quantity
    if (activeModule === "Product Configuration") {
      if (currentConfigStep === -1) {
        setConfigAnswers({ product: input.trim() });
        setMessages((prev) => [
          ...prev,
          { sender: "user", text: input.trim() },
          {
            sender: "agent",
            text: "Choose a material for the product:",
            multipleChoice: true,
            options: [
              { label: "Acrylic Resin", image: "" },
              { label: "Silicone", image: "" },
              { label: "Thermoplastic Polyurethane", icon: "" },
            ],
          },
        ]);
        setInput("");
        setCurrentConfigStep(0);
        return;
      }

      if (currentConfigStep === 6) {
        // Quantity is the final input (text)
        const finalAnswers = {
          ...configAnswers,
          quantity: input.trim(),
        };

        productDetailsRef.current = finalAnswers;
        const summary = Object.entries(finalAnswers)
          .map(([key, val]) => `${key}: ${val}`)
          .join(", ");

        setMessages((prev) => [
          ...prev,
          { sender: "user", text: input.trim() },
          { sender: "agent", text: "...", isLoading: true },
        ]);
        setInput("");
        console.log('Prouct '+JSON.stringify(finalAnswers))
        
        setMessages((prev) => [
          ...prev.slice(0, -1),
          {
            sender: "agent",
            text: "Would you like me to generate a quote for this configuration?",
            multipleChoice: true,
            options: [
              { label: "Yes, generate quote" },
              { label: "No, thanks" }
            ]
          }
        ]);
        setInput("");
        setCurrentConfigStep(6);
        return;
      }
}


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
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
  /** Create the quote PDF and return a blob URL **/
const createQuotePdfUrl = async () =>{
  //new Promise((resolve, reject) => {
    // --- static demo data; adapt if you want real values ---

    console.log('SESSIONS '+sessionId)
    
    console.log('Product Details '+JSON.stringify(productDetailsRef.current))
    const productDetails = productDetailsRef.current;
    let resText = await sendMessageToSession(sessionId, 'Get the Material Details of '+productDetails.material);
    let price = 160//Number(resText);
    const qty = Number(productDetails.quantity)
    console.log('Material Info '+price+'  '+typeof price+'   '+typeof qty)
    const pdfData = {
      customerName: "John Doe",
      customerAddress: "4987 Willow Creek Dr, Stonebridge, TX 76244",
      quoteNo: "0000226",
      quoteDate: "11‑04‑2023",
      dueDate: "25‑04‑2023",
      productName: productDetails.product,
      productQty : qty,
      items: [
        { sNo:1, description: productDetails.material, unitPrice: price},
        { sNo:2, description: "Machining", unitPrice: 150 },
        { sNo:2, description: "Labor", unitPrice: 75 }
      ],

      subtotal: (price + 250 +120)*qty,
      tax: (price + 250 +120)*qty*0.18,
      total: ((price + 250 +120)*qty) + ((price + 250 +120)*qty*0.18),
    };

    console.log('PDF DATA '+JSON.stringify(pdfData))
    // --------------------------------------------------------
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    root.render(<PDFTemplate data={pdfData} />);

    await delay(100); // allow render to complete

    const pdf = await html2pdf()
      .set({
        margin: 0.5,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      })
      .from(container)
      .toPdf()
      .get("pdf");

    root.unmount();
    document.body.removeChild(container);

    const blob = pdf.output("blob");
    const blobUrl = URL.createObjectURL(blob);
    return blobUrl;

  }//);


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

  /**************************************/
  //Slack Logic
  const sendSlackText = async (text) => {
    console.log("2", text);
    try {
      const res = await fetch(`http://localhost:5001/call-flow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputs:[
            {
              "floorName" : ''+text
            }
          ]
        }),
      });
      const data = await res.json();
      console.log(data);
      return (
        data?.messages?.[0]?.message ||
        data?.messages?.[0]?.text ||
        "(no response)"
      );
    } catch (error) {
      console.log(error);
    } finally {
      
    }
  };

  const calculateFloor = () =>{
    var arr = [selectedModule,selectedModuleBY,selectedModuleCon,selectedModuleCafe];
    const firstNullIndex = arr.findIndex(val => val === null || val !== ''); 
    console.log(firstNullIndex); 
    var arrWName = ["WednesdAI Assistant", "B Y Proto", "Configure Product", "Cafe"];
    console.log(arrWName[firstNullIndex]);
    
    setFloorName(arrWName[firstNullIndex-1])
    console.log(floorName);
    
  }

  return (
    <div className="app-wrapper" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="module-layer">
        {/* WednesdAI */}
        <div
          className="module-card-container"
          style={{ top: "26%", left: "38%" }}
          onClick={() => handleTopicClick("WednesdAI")}
        >
          <div
            className={`module-card ${
              selectedModule === "WednesdAI" ? "checked" : ""
            }`}
          >
            {selectedModule === "WednesdAI" ? (
              <img src={tickIcon} alt="Selected" className="tick-icon" />
            ) : (
              <p>WednesdAI</p>
            )}
          </div>
        </div>

        {/* B Y Porto */}
        <div
          className="module-card-container"
          style={{ top: "23%", left: "60%" }}
          onClick={() => handleTopicClick("B Y Porto")}
        >
         <div
            className={`module-card ${
              selectedModuleBY === "B Y Porto" ? "checked" : ""
            }`}
          >
            {selectedModuleBY === "B Y Porto" ? (
              <img src={tickIcon} alt="Selected" className="tick-icon" />
            ) : (
              <p>B Y Proto</p>
            )}
          </div>
        </div>

        {/* Product Configuration */}
        <div
          className="module-card-container"
          style={{ top: "65%", left: "33%" }}
          onClick={() => handleTopicClick("Product Configuration")}
        ><div
            className={`module-card ${
              selectedModuleCon === "Product Configuration" ? "checked" : ""
            }`}
          >
            {selectedModuleCon === "Product Configuration" ? (
              <img src={tickIcon} alt="Selected" className="tick-icon" />
            ) : (
              <p>
            Configure
            <br />
            Products
          </p>
            )}
          </div>
          
        </div>

        {/* cafe */}
        <div
          className="module-card-container"
          style={{ top: "66%", left: "63%" }}
          onClick={() => handleTopicClick("cafe")}
        >
          <div
            className={`module-card ${
              selectedModuleCafe === "cafe" ? "checked" : ""
            }`}
          >
            {selectedModuleCafe === "cafe" ? (
              <img src={tickIcon} alt="Selected" className="tick-icon" />
            ) : (
              <p>Cafe</p>
            )}
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
                        if (activeModule === "Product Configuration") {
                          const stepMap = [
                            { key: "material" },
                            { key: "printResolution", question: "Choose Print Resolution:", options: [{ label: "100 µm" }, { label: "200 µm" }, { label: "300 µm" }] },
                            { key: "layerHeight", question: "Select Layer Height:", options: [{ label: "0.05 mm" }, { label: "0.1 mm" }, { label: "0.2 mm" }] },
                            { key: "wallThickness", question: "Select Wall Thickness:", options: [{ label: "2.5 mm" }, { label: "3-4 mm" }, { label: "5 mm" }] },
                            { key: "infillDensity", question: "Choose Infill Density:", options: [{ label: "60%" }, { label: "80%" }, { label: "100%" }] },
                            { key: "printSpeed", question: "Choose Print Speed:", options: [{ label: "40 mm/s" }, { label: "60 mm/s" }, { label: "80 mm/s" }] },
                          ];

                          console.log('STEPP '+currentConfigStep)
                         if (currentConfigStep >= 0 && currentConfigStep < stepMap.length) {
                                const currentKey = stepMap[currentConfigStep].key;
                                setConfigAnswers((prev) => ({ ...prev, [currentKey]: option.label }));
                                setMessages((prev) => [...prev, { sender: "user", text: option.label }]);

                                const nextStep = currentConfigStep + 1;
                                console.log('Next STep '+currentConfigStep)
                               
                                if (nextStep < stepMap.length) {
                                  const nextQ = stepMap[nextStep];
                                  setMessages((prev) => [...prev, { sender: "agent", text: "...", isLoading: true }]);
                                  setTimeout(() => {
                                  setMessages((prev) => [
                                    ...prev.slice(0, -1),
                                    {
                                      sender: "agent",
                                      text: nextQ.question,
                                      multipleChoice: true,
                                      options: nextQ.options,
                                    },
                                  ]);
                                  setCurrentConfigStep(nextStep);
                                },1200);
                                } else {
                                  // Final step: ask for quantity via text
                                  setMessages((prev) => [...prev, { sender: "agent", text: "...", isLoading: true }]);
                                  setTimeout(() => {
                                    setMessages((prev) => [
                                    ...prev.slice(0, -1),
                                    { sender: "agent", text: "Enter the quantity you want to order:" },
                                  ]);
                                  setCurrentConfigStep(6);
                                  },1200);
                                   // Now ready for quote step next
                                }
                                return;
                              }
                              else if (currentConfigStep === stepMap.length) {
                            // This is the quote generation decision step
                            setMessages((prev) => [...prev, { sender: "user", text: option.label }]);

                            if (option.label.toLowerCase().startsWith("yes")) {
                              // Simulate loading
                              setMessages((prev) => [...prev, { sender: "agent", text: "...", isLoading: true }]);

                              // Create the PDF and generate a Blob URL
                              createQuotePdfUrl().then((url) => {
                               setTimeout(()=>{
                                  setMessages((prev) => [
                                  ...prev.slice(0, -1),
                                  {
                                    sender: "agent",
                                    text: `Here is your quote: <a href="${url}" download="Quote.pdf" target="_blank">📄 Download PDF</a>`,
                                  },
                                ]);
                                },1200)
                                
                              }).catch(() => {
                                //setMessages((prev) => [...prev, { sender: "agent", text: "...", isLoading: true }]);
                                setMessages((prev) => [
                                  ...prev.slice(0, -1),
                                  { sender: "agent", text: "❌ Failed to generate quote." },
                                ]);
                              });
                            } else {
                              setMessages((prev) => [
                                ...prev,
                                { sender: "agent", text: "Thank you for configuring your product!" },
                              ]);
                            }

                            // Reset the state
                            setCurrentConfigStep(-1);
                            setConfigAnswers({});
                            return;
                          }
                            }

                            // fallback for other modules
                            const userMsg = { sender: "user", text: option.label };
                            const loadingMsg = { sender: "agent", text: "...", isLoading: true };
                            setMessages((prev) => [...prev, userMsg, loadingMsg]);

                            sendMessageToSession(sessionId, option.label).then((resText) => {
                              setMessages((prev) => [
                                ...prev.slice(0, -1),
                                { sender: "agent", text: resText },
                              ]);
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
            <div className="support-btn" onClick={handleSupportClick}>
        <img
          src={supportActive ? hypercare : tickIcon}
          alt="Support"
        />
      </div>
    </div>
  );
}

export default App;
