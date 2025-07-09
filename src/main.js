const express = require('express');
const fs = require('fs');
const path = require('path');
const Ollama = require('ollama').Ollama;

// --- Configuration ---
const config = {
  ollamaHost: 'http://localhost:11434',
  model: 'gemma:2b', // use gemma:2b for simple testing
  logFilePath: path.join(__dirname, '..', 'logs', 'log.jsonl'),
};

// --- Setup ---
const app = express();
const ollama = new Ollama({ host: config.ollamaHost });
fs.mkdirSync(path.dirname(config.logFilePath), { recursive: true });

// Centralized logger utility
const logInteraction = (data) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    ...data,
  };
  fs.appendFileSync(config.logFilePath, JSON.stringify(logEntry) + '\n');
};


// --- POST /generate Endpoint ---

// Add express.json() middleware
app.use(express.json());

app.post('/generate', async (req, res, next) => {
  const { prompt } = req.body;
  let fullResponse = "";

  // Validate the prompt
  if (!prompt) {
    const errorResponse = { error: "Prompt is required." };
    logInteraction({ input: { prompt: "" }, output: errorResponse });
    return res.status(400).json(errorResponse);
  }

  // Set headers for Server-Sent Events (SSE)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // Send headers immediately

  try {
    // interact with local model and generate the response
    const stream = await ollama.generate({
      model: config.model,
      prompt: prompt,
      stream: true,
    });

    for await (const chunk of stream) {
      const token = chunk.response;
      fullResponse += token;
      res.write(`response:{ data: ${JSON.stringify({ token })}}\n\n`);
    }

    logInteraction({ input: req.body, output: { response: fullResponse } });

  } catch (error) {
    console.error('An error occurred:', error);
    const errorResponse = { error : "An internal server error occurred." };
    res.write(`response: ${JSON.stringify(errorResponse)}\n\n`);
    
    logInteraction({
      input: req.body,
      output: errorResponse,
      error: { message: error.message, stack: error.stack }
    });
  } finally {
    res.end();
  }
});

module.exports = app;