require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json({ limit: "15mb" }));

// --- Paths and multer ---
const LOG_FOLDER = path.join(__dirname, "logs");

// Ensure logs folder exists
if (!fs.existsSync(LOG_FOLDER)) fs.mkdirSync(LOG_FOLDER);

const upload = multer({ storage: multer.memoryStorage() });

// --- Health check ---
app.get("/", (req, res) => {
  res.send("TraceToFix backend (Gemini 2.5‑Flash) running");
});

// --- Fetch latest logs ---
app.get("/fetch-latest-logs", (req, res) => {
  try {
    const allFiles = fs
      .readdirSync(LOG_FOLDER)
      .filter((f) => f.endsWith(".txt"));

    if (allFiles.length === 0) {
      return res.status(404).json({ message: "No .txt log files found" });
    }

    const latest = allFiles
      .map((f) => ({ name: f, time: fs.statSync(path.join(LOG_FOLDER, f)).mtimeMs }))
      .sort((a, b) => b.time - a.time)[0].name;

    const content = fs.readFileSync(path.join(LOG_FOLDER, latest), "utf8");
    res.json({ filename: latest, logs: content });
  } catch (err) {
    console.error("Fetch logs error:", err);
    res.status(500).json({ message: "Error reading logs" });
  }
});

// --- Fetch specific log file ---
app.get("/fetch-log", (req, res) => {
  const file = req.query.file;
  if (!file) return res.status(400).json({ message: "File required" });

  const filePath = path.join(LOG_FOLDER, file);
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: "File not found" });

  const content = fs.readFileSync(filePath, "utf8");
  res.json({ logs: content, filename: file });
});

// --- AI analysis ---
app.post("/analyze", upload.array("files"), async (req, res) => {
  try {
    let combinedText = req.body.logs || "";

    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        const text = file.buffer.toString("utf8");
        combinedText += "\n\n" + text;
      });
    }

    if (!combinedText.trim()) {
      return res.status(400).json({ result: "No logs or code provided for analysis" });
    }

    // Build prompt
    const prompt = `
You are TraceToFix AI. Analyze the logs and code and provide:
1) Root Causes
2) Fixes
3) Suggestions
4) Improvements
5) Highlight key error lines

Content:
${combinedText}
    `;

    // Gemini API call
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    const response = await axios.post(`${url}?key=${process.env.GEMINI_API_KEY}`, payload, {
      headers: { "Content-Type": "application/json" },
    });

    // Safely extract AI text
    let aiText = "";
    const candidates = response.data?.candidates;
    if (Array.isArray(candidates) && candidates.length > 0) {
      const first = candidates[0];
      const content = first.content;
      if (content && Array.isArray(content.parts)) {
        aiText = content.parts.map((p) => p.text || "").join("");
      } else if (typeof content === "string") {
        aiText = content;
      } else {
        aiText = JSON.stringify(content);
      }
    }

    if (!aiText) aiText = "AI returned no text.";
    res.json({ result: aiText });
  } catch (err) {
    console.error("AI error:", err.response?.data || err.message);
    res.status(500).json({ result: "AI analysis failed (see backend log for details)" });
  }
});

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`TraceToFix backend running on port ${PORT}`);
});
