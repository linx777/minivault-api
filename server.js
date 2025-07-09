// Import the app configuration from main.js
const app = require('./src/main.js');

// Define the port to run the server on
const port = 3000;

// Start the server and listen for incoming requests
app.listen(port, () => {
  console.log(`Server is running and listening on http://localhost:${port}`);
  console.log(`You can send POST requests to http://localhost:${port}/generate`);
});