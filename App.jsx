import { useEffect, useState } from 'react';
import * as webllm from "@mlc-ai/web-llm";
import './app.scss';

function App() {
  const [engine, setEngine] = useState(null);
  const [messages, setMessages] = useState([]); // Start with empty messages
  const [input, setInput] = useState("");
  const [loadingText, setLoadingText] = useState("");

  useEffect(() => {
    const modelId = "Llama-3.2-3B-Instruct-q4f16_1-MLC";

    if (!navigator.gpu) {
      alert("WebGPU not supported. Please use Chrome or Edge with WebGPU enabled.");
      return;
    }

    async function initEngine() {
      try {
        const eng = await webllm.CreateMLCEngine(modelId, {
          initProgressCallback: (progress) => {
            console.log("initProgress", progress);
            setLoadingText(progress.text);
          }
        });
        setEngine(eng);
        setLoadingText("");
      } catch (err) {
        console.error("Engine init failed:", err);
        alert("Model load failed—maybe your device has limited GPU memory. Try closing other GPU apps or use another model.");
      }
    }

    initEngine();

    return () => {
      if (engine) {
        try {
          engine.dispose();
        } catch {}
      }
    };
  }, []);

  async function sendMessage() {
    if (!engine || input.trim() === "") return;

    const updated = [...messages, { role: "user", content: input }];
    setMessages(updated);
    setInput("");
    try {
      const reply = await engine.chat.completions.create({ messages: updated });
      const text = reply.choices[0].message.content;
      setMessages([...updated, { role: "assistant", content: text }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages([...updated, { role: "assistant", content: "[Error generating reply]" }]);
    }
  }

  return (
    <main>
      <section className="conversation-area">
        {loadingText && <div className="loading">{loadingText}</div>}
        <div className="messages">
          {messages.map((m, i) => (
            <div className={`message ${m.role}`} key={i}>{m.content}</div>
          ))}
        </div>
        <div className="input-area">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            type="text"
            placeholder="Message LLM"
            disabled={!engine}
          />
          <button onClick={sendMessage} disabled={!engine}>Send</button>
        </div>
      </section>
      
    </main>
  );
}

export default App;
