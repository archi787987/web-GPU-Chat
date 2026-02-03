import { useEffect, useRef, useState } from "react";
import * as webllm from "@mlc-ai/web-llm";
import "./App.css";

function App() {
  const engineRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingText, setLoadingText] = useState("Loading model...");

  useEffect(() => {
    // Lightweight model (works on weak GPUs)
    const modelId = "TinyLlama-1.1B-Chat-v1.0";

    if (!navigator.gpu) {
      alert(
        "WebGPU not supported. Please use Chrome or Edge with WebGPU enabled.",
      );
      return;
    }

    async function initEngine() {
      try {
        const engine = await webllm.CreateMLCEngine(modelId, {
          initProgressCallback: (progress) => {
            console.log("Loading:", progress.text);
            setLoadingText(progress.text);
          },
        });

        engineRef.current = engine;
        setLoadingText("");
      } catch (err) {
        console.error("Engine init failed:", err);
        alert(
          "Model load failed. Your GPU may not have enough memory. Try a smaller model or use CPU-based AI.",
        );
      }
    }

    initEngine();

    return () => {
      if (engineRef.current) {
        try {
          engineRef.current.dispose();
        } catch {}
      }
    };
  }, []);

  async function sendMessage() {
    if (!engineRef.current || input.trim() === "") return;

    const updated = [...messages, { role: "user", content: input }];
    setMessages(updated);
    setInput("");

    try {
      const reply = await engineRef.current.chat.completions.create({
        messages: updated,
      });

      const text = reply.choices[0].message.content;
      setMessages([...updated, { role: "assistant", content: text }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages([
        ...updated,
        { role: "assistant", content: "[Error generating reply]" },
      ]);
    }
  }

  return (
    <main>
      <section className="conversation-area">
        {loadingText && <div className="loading">{loadingText}</div>}

        <div className="messages">
          {messages.map((m, i) => (
            <div className={`message ${m.role}`} key={i}>
              {m.content}
            </div>
          ))}
        </div>

        <div className="input-area">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            type="text"
            placeholder="Message LLM"
            disabled={!engineRef.current}
          />
          <button onClick={sendMessage} disabled={!engineRef.current}>
            Send
          </button>
        </div>
      </section>
    </main>
  );
}

export default App;
