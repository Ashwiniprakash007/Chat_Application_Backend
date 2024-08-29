const express = require("express");
const messageModel = require("../modals/message.modal"); 
const OfflineMessage = require('../modals/offlineMessage.model'); 
const user = require('../modals/user.modal'); 
const messageController = express.Router();

const clients = {};

messageController.get("/get/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        const messages = await messageModel.find({
            $or: [
                { senderId: userId },
                { recipientId: userId }
            ]
        });
        res.send(messages);
    } catch (err) {
        console.error('Error fetching messages:', err); 
        res.status(500).send("Error fetching messages");
    }
});

// Send a message
messageController.post("/send", async (req, res) => {
    const { senderId, recipientId, content } = req.body;
    try {
        if (!senderId || !recipientId || !content) {
            return res.status(400).send("Invalid request data");
        }

        const sender = await user.findById(senderId);
        if (!sender) {
            return res.status(404).send("Sender not found");
        }

        const message = new messageModel({ senderId, recipientId, content, senderName: sender.name });
        await message.save();

        if (clients[recipientId]) {
            clients[recipientId].forEach(client =>
                client.res.write(`data: ${JSON.stringify(message)}\n\n`)
            );
        } else {
            const offlineMessage = new OfflineMessage({ senderId, recipientId, content });
            await offlineMessage.save();
        }

        res.send({ message: "Message sent successfully" });
    } catch (err) {
        console.error('Error sending message:', err); // Log the error
        res.status(500).send("Error sending message");
    }
});

// EventSource endpoint for receiving real-time messages
messageController.get("/events/:userId", (req, res) => {
    const { userId } = req.params;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    if (!clients[userId]) {
        clients[userId] = [];
    }
    clients[userId].push({ res });

    req.on('close', () => {
        clients[userId] = clients[userId].filter(client => client.res !== res);
    });
});

// Get offline messages for a user
messageController.get("/offline/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        const offlineMessages = await OfflineMessage.find({ recipientId: userId, seen: false });
        res.send(offlineMessages);
    } catch (err) {
        console.error('Error fetching offline messages:', err);
        res.status(500).send("Error fetching offline messages");
    }
});

// Mark offline messages as seen
messageController.post("/markSeen", async (req, res) => {
    const { userId } = req.body;
    try {
        if (!userId) {
            return res.status(400).send("Invalid request data");
        }
        
        await OfflineMessage.updateMany({ recipientId: userId, seen: false }, { $set: { seen: true } });
        res.send({ message: "Messages marked as seen" });
    } catch (err) {
        console.error('Error marking messages as seen:', err); 
        res.status(500).send("Error marking messages as seen");
    }
});

module.exports = messageController;
