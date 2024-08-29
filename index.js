




const express = require("express");
const cors = require("cors");
const userController = require("./route/user.route");
const messageController = require("./route/message.route");
const connection = require("./config/db")

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Home page")
})



app.use("/user", userController);
app.use("/message", messageController);


const clients = new Map();

// Webhook for live chat
app.post("/webhook/message", (req, res) => {
    const { userId, message } = req.body;
    const client = clients.get(userId);
    if (client) {
        client.res.write(`data: ${JSON.stringify(message)}\n\n`);
    }
    res.status(200).send("Message sent to webhook.");
});

// Keep-alive for SSE (Server-Sent Events)
app.get("/events/:userId", (req, res) => {
    const { userId } = req.params;
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    clients.set(userId, { req, res });

    req.on("close", () => {
        clients.delete(userId);
    });
});



app.listen(8080, async () => {
    try{
        await connection
        console.log("DB connected")
    }
    catch(err){
        console.log("error occur")
        console.log(err)
    }
    console.log("Listning on port 8080")
})