const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Your verify token (create a random string)
const VERIFY_TOKEN = 'your_secure_verify_token_12345';

app.use(bodyParser.json());

// Webhook verification endpoint
app.get('/webhook', (req, res) => {
  console.log('Webhook verification request received');
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  console.log('Mode:', mode);
  console.log('Token:', token);
  console.log('Challenge:', challenge);
  
  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      console.log('WEBHOOK_VERIFICATION_FAILED');
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(403);
  }
});

// Webhook endpoint for receiving messages
app.post('/webhook', (req, res) => {
  console.log('Webhook POST request received');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  const body = req.body;
  
  if (body.object === 'page') {
    body.entry.forEach((entry) => {
      const webhookEvent = entry.messaging[0];
      console.log('Webhook event:', webhookEvent);
      
      if (webhookEvent.message) {
        handleMessage(webhookEvent);
      }
    });
    
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Function to handle incoming messages
function handleMessage(event) {
  const senderId = event.sender.id;
  const messageText = event.message.text;
  
  console.log(`Message from ${senderId}: ${messageText}`);
  
  // Here you would typically send a response back
  // For now, just log the message
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/webhook`);
});