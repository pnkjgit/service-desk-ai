require("dotenv").config();

const express = require("express");
const { Pool } = require("pg");

const app = express();
const PORT = 3000;
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Basic API
app.get("/", (req, res) => {
    res.json({
        message: "Service Desk API is running"
    });
});

// API health
app.get("/api/health", (req, res) => {
    res.json({
        status: "OK"
    });
});

// Database health
app.get("/api/db-health", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            status: "Database connected",
            time: result.rows[0].now
        });
    } catch (error) {
        console.error("Database error:", error);

        res.status(500).json({
            status: "Database connection failed"
        });
    }
});

// Test message
app.get("/api/message", (req, res) => {
    res.json({
        message: "Hello from the Node.js backend!"
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});