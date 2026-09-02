const express = require("express");

const app = express();

const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Service Desk API is running"
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "OK"
    });
});

app.get("/api/message", (req, res) => {
    res.json({
        message: "Hello from the Node.js backend!"
    });
});

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});