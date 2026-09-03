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

app.get("/api/tickets", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT *
            FROM tickets
            ORDER BY created_at DESC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching tickets:", error);

        res.status(500).json({
            error: "Failed to fetch tickets"
        });
    }
});    

app.post("/api/tickets", async (req, res) => {
    try {
        const { title, description, priority } = req.body;

        if (!title) {
            return res.status(400).json({
                error: "Title is required"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO tickets (title, description, priority)
            VALUES ($1, $2, $3)
            RETURNING *
            `,
            [
                title,
                description || null,
                priority || "medium"
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error creating ticket:", error);

        res.status(500).json({
            error: "Failed to create ticket"
        });
    }
});

app.get("/api/tickets/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `
            SELECT *
            FROM tickets
            WHERE id = $1
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Ticket not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching ticket:", error);

        res.status(500).json({
            error: "Failed to fetch ticket"
        });
    }
});

app.patch("/api/tickets/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, priority } = req.body;

        const result = await pool.query(
            `
            UPDATE tickets
            SET
                title = COALESCE($1, title),
                description = COALESCE($2, description),
                status = COALESCE($3, status),
                priority = COALESCE($4, priority),
                updated_at = NOW()
            WHERE id = $5
            RETURNING *
            `,
            [title, description, status, priority, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Ticket not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error updating ticket:", error);

        res.status(500).json({
            error: "Failed to update ticket"
        });
    }
});

app.delete("/api/tickets/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `
            DELETE FROM tickets
            WHERE id = $1
            RETURNING *
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Ticket not found"
            });
        }

        res.json({
            message: "Ticket deleted successfully",
            ticket: result.rows[0]
        });
    } catch (error) {
        console.error("Error deleting ticket:", error);

        res.status(500).json({
            error: "Failed to delete ticket"
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