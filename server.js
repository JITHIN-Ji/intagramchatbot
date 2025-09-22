const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 10000;

console.log('Starting server on port:', PORT);

// Your verify token (create a random string)
const VERIFY_TOKEN = 'your_secure_verify_token_12345';

// ADD YOUR PAGE ACCESS TOKEN HERE
const PAGE_ACCESS_TOKEN = 'EAALkgHsGfroBPq0pMoi8gZBAX1BBtCkEY3eh8BVcEN67yy5aBwUiKUClbpscPMVYKLalZBOtNMXmutxzZCKEp9h8Xkb5clISSOCTyDpGuZC345cPxzCMJ7Ho76K2Sp8pP69Mu0r1twVhMG6ULfQ6lAV9UWSICntVZCSFlZBopsYdz8A7uQZCOr76WtZBNsaeZBDWDeAz53jj2sAZDZD'; // Replace with your actual token from Facebook

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

// Function to send messages back to users
async function sendMessage(recipientId, messageText) {
  const url = `https://graph.facebook.com/v18.0/me/messages`;
  
  const messageData = {
    recipient: { id: recipientId },
    message: { text: messageText }
  };
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PAGE_ACCESS_TOKEN}`
      },
      body: JSON.stringify(messageData)
    });
    
    const result = await response.json();
    console.log('Message sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
}

// Function to handle incoming messages
function handleMessage(event) {
  const senderId = event.sender.id;
  const messageText = event.message.text;
  
  console.log(`Message from ${senderId}: ${messageText}`);
  
  // Send an echo response back to the user
  if (messageText) {
    const responseText = `You said: "${messageText}"`;
    sendMessage(senderId, responseText);
  }
  
  // You can add more sophisticated logic here
  // For example, different responses based on keywords:
  /*
  if (messageText.toLowerCase().includes('hello')) {
    sendMessage(senderId, 'Hello! How can I help you today?');
  } else if (messageText.toLowerCase().includes('help')) {
    sendMessage(senderId, 'I can help you with various things. What do you need?');
  } else {
    sendMessage(senderId, `You said: "${messageText}"`);
  }
  */
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
