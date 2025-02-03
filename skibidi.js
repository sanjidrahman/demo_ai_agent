require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

// Replace these with your WhatsApp Business API credentials
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_API_VERSION = 'v21.0'; // Update to latest version
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

app.use(express.json());

// Webhook verification
app.get('/webhook', (req, res) => {
    const verify_token = process.env.VERIFY_TOKEN;

    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    if (mode && token) {
        if (mode === "subscribe" && token === verify_token) {
            console.log("Webhook verified!");
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

// Handle incoming messages
app.post('/webhook', async (req, res) => {
    try {
        const body = req.body;

        if (body.object) {
            if (body.entry && 
                body.entry[0].changes && 
                body.entry[0].changes[0].value.messages && 
                body.entry[0].changes[0].value.messages[0]
            ) {
                const phone_number_id = body.entry[0].changes[0].value.metadata.phone_number_id;
                const from = body.entry[0].changes[0].value.messages[0].from;
                const msg_body = body.entry[0].changes[0].value.messages[0].text.body;

                console.log('Message received:', msg_body);

                // Send response
                await sendMessage(phone_number_id, from, "Got your message: " + msg_body);
            }
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.sendStatus(500);
    }
});

// Function to send messages
async function sendMessage(phone_number_id, to, message) {
    try {
        const response = await axios({
            method: 'POST',
            url: `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phone_number_id}/messages`,
            headers: {
                'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json',
            },
            data: {
                messaging_product: "whatsapp",
                to: to,
                text: { body: message },
            },
        });
        console.log('Message sent successfully:', response.data);
    } catch (error) {
        console.error('Error sending message:', error.response?.data || error);
    }
}

app.get('/', (req, res) => {
    res.send('Hi server of Demo_ai_agent');
    console.log('Hit get url');
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});