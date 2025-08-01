const express = require('express');
const app = express();

// Middleware to serve static files from 'public' and 'views' directories
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));

// Create an HTTP server and bind it to the Express app
const http = require('http');
const server = http.createServer(app);
server.listen(5000);

const uuid = require('uuid');

// Initialize Socket.IO with the HTTP server for real-time communication
const { Server } = require('socket.io');
const io = new Server(server);

const dialogflow = require('@google-cloud/dialogflow');
const sessionClient = new dialogflow.SessionsClient();

// Handle WebSocket connections for real-time chat
io.on('connection', (socket) => {

  // Generate a unique session ID in case we need to handle multiple users or wanted to remember sessions
  const sessionId = uuid.v4(); 

  // Listen for chat messages from the client
  socket.on('chat message', async (msg) => {

    const sessionPath = sessionClient.projectAgentSessionPath('yaptalk-vycq', sessionId);

    // Build Dialogflow request with the user session, user message and language preference
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: msg,
          languageCode: 'en-US',  // You could later add language detection here
        },
      },
    };

    try {
      // Send user message to Dialogflow and wait for a response
      const responses = await sessionClient.detectIntent(request);
      const result = responses[0].queryResult;
      const aiText = result.fulfillmentText || "Sorry, I didn't understand that.";

      socket.emit('AI response', aiText);
    } 
    catch (error) {
      // Handle and log errors in AI processing
      console.error('ERROR:', error);
      socket.emit('AI response', 'An error occurred while processing your request.');
    }

  });
});



app.get('/', (req, res) => {
  res.sendFile('index.html');
//   res.sendFile(__dirname + '/views/index.html');
});