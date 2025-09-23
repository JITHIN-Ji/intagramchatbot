const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 10000;

console.log('Starting server on port:', PORT);

// Your verify token (create a random string)
const VERIFY_TOKEN = 'your_secure_verify_token_12345';

// ADD YOUR NEW PAGE ACCESS TOKEN HERE (with Instagram permissions)
const PAGE_ACCESS_TOKEN = 'EAALkgHsGfroBPjXHx2T17nicpTwRPHRgHkmGiRjuvGTwQ6zibDhkNGgOsf7UbSKVaYzA46A8B4bnRmFMbov5iSez9RfMQMXFY4y0M5ZAdx5sdApJLtdXXS2vVgY8Q8lz43OrP0ZAV7gGjgj2FBcGTajezXZCgGXfnyUmGZBWHqLvjUO9KHE2ZAt5KpOhG5uzFZCNnhzBjfDZBCb55eO9pZBx0JjjfNZAQD4Cn6pkqvHo9ZC3yevQEZD'; // Replace with new token

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
      // Handle Facebook Messenger
      if (entry.messaging && entry.messaging.length > 0) {
        const webhookEvent = entry.messaging[0];
        console.log('Facebook Messenger event:', webhookEvent);
        
        if (webhookEvent.message) {
          handleFacebookMessage(webhookEvent);
        }
      }
      
      // Handle Instagram Direct Messages
      if (entry.changes && entry.changes.length > 0) {
        entry.changes.forEach((change) => {
          if (change.field === 'messages') {
            console.log('Instagram message event:', change.value);
            handleInstagramMessage(change.value);
          }
        });
      }
    });
    
    res.status(200).send('EVENT_RECEIVED');
  } else {
    console.log('Unknown webhook object:', body.object);
    res.sendStatus(404);
  }
});

// Function to send Facebook messages
async function sendFacebookMessage(recipientId, messageText) {
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
    console.log('Facebook message sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending Facebook message:', error);
    return null;
  }
}

// Function to send Instagram messages
async function sendInstagramMessage(recipientId, messageText) {
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
    console.log('Instagram message sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending Instagram message:', error);
    return null;
  }
}

// Function to handle Facebook Messenger messages
function handleFacebookMessage(event) {
  const senderId = event.sender.id;
  const messageText = event.message.text;
  
  console.log(`Facebook message from ${senderId}: ${messageText}`);
  
  if (messageText) {
    const responseText = `Facebook Bot: You said "${messageText}"`;
    sendFacebookMessage(senderId, responseText);
  }
}

// Function to handle Instagram Direct Messages
function handleInstagramMessage(messageData) {
  console.log('Processing Instagram message:', messageData);
  
  // Instagram message structure is different
  if (messageData.from && messageData.message) {
    const senderId = messageData.from.id;
    const messageText = messageData.message;
    
    console.log(`Instagram message from ${senderId}: ${messageText}`);
    
    if (messageText) {
      const responseText = `Instagram Bot: You said "${messageText}"`;
      sendInstagramMessage(senderId, responseText);
    }
  }
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
