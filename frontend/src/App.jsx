import React, { useState } from "react";
import axios from "axios";

function App() {
  const [logs, setLogs] = useState("");
  const [result, setResult] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // -------- Fetch logs from backend/logs --------
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/fetch-latest-logs");
      setLogs(res.data.logs);
      setResult("");
    } catch (err) {
      console.error(err);
      alert("Failed to fetch logs from backend");
    } finally {
      setLoading(false);
    }
  };

  // -------- Handle uploaded files --------
  const handleFiles = (e) => {
    setFiles(Array.from(e.target.files));
    setLogs(""); // Keep logs empty when uploading files
    setResult(""); 
  };

  // -------- Analyze logs (multi-agent capable) --------
  const analyzeLogs = async () => {
    if (!logs && files.length === 0) {
      alert("Provide logs or upload code files!");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (logs) formData.append("logs", logs);
      files.forEach((file, idx) => formData.append(`files`, file));

      // Multi-agent analysis handled on backend
      const res = await axios.post("http://localhost:5000/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(res.data.result);
    } catch (err) {
      console.error(err);
      alert("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ color: "#2c3e50" }}>TraceToFix</h2>

      <div style={{ marginBottom: "15px" }}>
        <button
          onClick={fetchLogs}
          style={{
            marginRight: "10px",
            padding: "8px 16px",
            borderRadius: "5px",
            cursor: "pointer",
            backgroundColor: "#3498db",
            color: "white",
            border: "none",
          }}
        >
          One-Click Fetch Logs
        </button>
        <button
          onClick={analyzeLogs}
          style={{
            padding: "8px 16px",
            borderRadius: "5px",
            cursor: "pointer",
            backgroundColor: "#2ecc71",
            color: "white",
            border: "none",
          }}
        >
          Analyze Logs
        </button>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>Upload Code Files:</label>
        <input type="file" multiple onChange={handleFiles} />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "bold" }}>Logs:</label>
        <textarea
          value={logs}
          onChange={(e) => setLogs(e.target.value)}
          rows={10}
          cols={80}
          style={{
            width: "200%",
            fontFamily: "monospace",
            fontSize: "14px",
            backgroundColor: "#fdf6e3",
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
             color: "#34495e",
          }}
        />
      </div>

      <div>
        <label style={{ fontWeight: "bold" }}>Result:</label>
        <textarea
          value={result}
          readOnly
          rows={12}
          cols={80}
          style={{
            width: "200%",
            fontFamily: "monospace",
            fontSize: "14px",
            backgroundColor: "#f0f8ff",
            padding: "10px",
            borderRadius: "5px",
            border: "none",
            color: "#34495e",
          }}
        />
      </div>

      {loading && (
        <p style={{ fontStyle: "italic", color: "#e67e22" }}>Loading...</p>
      )}
    </div>
  );
}

export default App;