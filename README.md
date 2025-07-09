# Local LLM API Server with Express.js

A simple Node.js API server for local LLMs via Ollama. Features include token-by-token streaming, interaction logging, and a full test suite with Jest.

## 🚀 Setup

1.  **Prerequisites**: Ensure [Node.js](https://nodejs.org/en/) and [Ollama](https://ollama.com/) are installed.

2.  **Clone & Install**:
    ```bash
    git clone git@github.com:linx777/minivault-api.git
    cd minivault-api
    npm install
    ```

3.  **Pull a Model**:
    ```bash
    ollama pull gemma:2b
    ```

## Usage

1.  **Start Server**:
    ```bash
    node server.js
    ```

2.  **Send Request**:
    ```bash
    curl -N -X POST http://localhost:3000/generate \
    -H "Content-Type: application/json" \
    -d '{"prompt": "hello, who are you?"}'
    ```

## 🧪 Testing

Run the automated test suite (which mocks the Ollama service) using:

```bash
npm test
```

# Project Structure

/
├── src/
│   └── main.js       # Core application logic and routes
├── test/
│   └── test.js         # Jest tests for the API
├── logs/
│   └── log.jsonl       # (Generated) Log file
├── .gitignore          # Files to ignore
├── package.json        # Project dependencies
└── server.js         # Starts the Express server


## Design 

#### Framework: Express.js, a minimalist and unopinionated Node.js framework
 - Unopinionated, giving us complete freedom to structure the application. For this simple project, we can make the structure as simple as we can

#### Model: Local Gemma:2b

 - Small, it's sufficient for testing and simple tasks, it may lack the reasoning capabilities of larger, cloud-based models. 
 - The choice of Ollama was based on its simplicity for setting up and managing local models.

Endpoint: Use SSE to stream the response. 
 - Since the data flow is one-way (from server to client), SSE is a simpler and more efficient protocol than a bi-directional alternative like WebSockets.

## Improvements 
1. Centralized and Stream-Aware Error Handling
2. More User-Friendly Error Messages & Logs
3. Separate Files for a Structured Project.(e.g. config.js, logger.js, ollamaService.js, generateController.js ...)
4. Add Rate Limiting to Prevent Abuse. (We can levearge express-rate-limit for simplicity)