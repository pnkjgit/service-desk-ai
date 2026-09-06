require("dotenv").config();

const express = require("express");
const { Pool } = require("pg");
require("dotenv").config();
const OpenAI = require("openai");

const app = express();
const PORT = 3000;
app.use(express.json());

function cosineSimilarity(vectorA, vectorB) {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vectorA.length; i++) {
        dotProduct += vectorA[i] * vectorB[i];
        magnitudeA += vectorA[i] * vectorA[i];
        magnitudeB += vectorB[i] * vectorB[i];
    }

    return dotProduct / (
        Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB)
    );
}

// PostgreSQL connection
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
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

app.post("/api/tickets", async (req, res) => {
    try {
        const { title, description, priority } = req.body;

        if (!title) {
            return res.status(400).json({
                error: "Title is required"
            });
        }

        // 1. Create the ticket
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

        const ticket = result.rows[0];

        // 2. Create text for the embedding
        const text = `${ticket.title}\n${ticket.description || ""}`;

        // 3. Generate embedding
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text
        });

        const embedding = response.data[0].embedding;

        // 4. Store embedding on the ticket
        await pool.query(
            `
            UPDATE tickets
            SET embedding = $1
            WHERE id = $2
            `,
            [JSON.stringify(embedding), ticket.id]
        );

        // 5. Return the ticket
        res.status(201).json({
            ...ticket,
            embedding: embedding
        });

    } catch (error) {
        console.error("Error creating ticket:", error);

        res.status(500).json({
            error: "Failed to create ticket"
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


app.post("/api/embeddings/:ticketId", async (req, res) => {
    try {
        const { ticketId } = req.params;

        // 1. Get the ticket
        const ticketResult = await pool.query(
            `
            SELECT id, title, description
            FROM tickets
            WHERE id = $1
            `,
            [ticketId]
        );

        if (ticketResult.rows.length === 0) {
            return res.status(404).json({
                error: "Ticket not found"
            });
        }

        const ticket = ticketResult.rows[0];

        // 2. Combine ticket text
        const text = `${ticket.title}\n${ticket.description || ""}`;

        // 3. Generate embedding
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text
        });

        const embedding = response.data[0].embedding;

        // 4. Save embedding
        await pool.query(
            `
            UPDATE tickets
            SET embedding = $1
            WHERE id = $2
            `,
            [JSON.stringify(embedding), ticketId]
        );

        res.json({
            ticketId,
            text,
            message: "Embedding generated and stored successfully"
        });

    } catch (error) {
        console.error("Embedding error:", error);

        res.status(500).json({
            error: "Failed to generate and store embedding"
        });
    }
});

app.post("/api/similarity", async (req, res) => {
    try {
        const { textA, textB } = req.body;

        if (!textA || !textB) {
            return res.status(400).json({
                error: "textA and textB are required"
            });
        }

        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: [textA, textB]
        });

        const vectorA = response.data[0].embedding;
        const vectorB = response.data[1].embedding;

        const similarity = cosineSimilarity(vectorA, vectorB);

        res.json({
            textA,
            textB,
            similarity
        });
    } catch (error) {
        console.error("Similarity error:", error);

        res.status(500).json({
            error: "Failed to calculate similarity"
        });
    }
});

app.post("/api/tickets/search", async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({
                error: "Search text is required"
            });
        }

        // 1. Convert search text into an embedding
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text
        });

        const queryEmbedding = response.data[0].embedding;

        // 2. Search tickets using pgvector
        const result = await pool.query(
            `
            SELECT
                id,
                title,
                description,
                status,
                priority,
                1 - (embedding <=> $1::vector) AS similarity
            FROM tickets
            WHERE embedding IS NOT NULL
            ORDER BY embedding <=> $1::vector
            LIMIT 5
            `,
            [JSON.stringify(queryEmbedding)]
        );

        res.json({
            query: text,
            results: result.rows
        });

    } catch (error) {
        console.error("Ticket search error:", error);

        res.status(500).json({
            error: "Failed to search tickets"
        });
    }
});

app.post("/api/ai", async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({
                error: "Text is required"
            });
        }

        const response = await openai.responses.create({
            model: "gpt-4.1-mini",
            input: text
        });

        res.json({
            answer: response.output_text
        });

    } catch (error) {
        console.error("LLM error:", error);

        res.status(500).json({
            error: "Failed to generate AI response"
        });
    }
});

app.post("/api/tickets/ask", async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({
                error: "Question is required"
            });
        }

        // 1. Convert the user's question into an embedding
        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text
        });

        const queryEmbedding = embeddingResponse.data[0].embedding;

        // 2. Retrieve the most relevant tickets
        const ticketResult = await pool.query(
            `
            SELECT
                id,
                title,
                description,
                status,
                priority,
                1 - (embedding <=> $1::vector) AS similarity
            FROM tickets
            WHERE embedding IS NOT NULL
            ORDER BY embedding <=> $1::vector
            LIMIT 3
            `,
            [JSON.stringify(queryEmbedding)]
        );

        // 3. Convert retrieved tickets into context
        const context = ticketResult.rows
            .map(ticket => `
Ticket: ${ticket.title}
Description: ${ticket.description || "No description"}
Status: ${ticket.status}
Priority: ${ticket.priority}
Similarity: ${ticket.similarity}
            `)
            .join("\n");

        // 4. Give the retrieved information to the LLM
        const prompt = `
You are a helpful Service Desk AI assistant.

Answer the user's question using the ticket information below.

If the ticket information does not contain enough information,
say that you don't have enough information.

User question:
${text}

Relevant tickets:
${context}
`;

        const response = await openai.responses.create({
            model: "gpt-4.1-mini",
            input: prompt
        });

        // 5. Return the generated answer
        res.json({
            question: text,
            answer: response.output_text,
            sources: ticketResult.rows
        });

    } catch (error) {
        console.error("RAG error:", error);

        res.status(500).json({
            error: "Failed to generate answer"
        });
    }
});

app.post("/api/knowledge-chunks/:id/embed", async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Get the chunk
        const result = await pool.query(
            `
            SELECT id, content, source
            FROM knowledge_chunks
            WHERE id = $1
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Knowledge chunk not found"
            });
        }

        const chunk = result.rows[0];

        // 2. Generate embedding
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: chunk.content
        });

        const embedding = response.data[0].embedding;

        // 3. Store embedding
        await pool.query(
            `
            UPDATE knowledge_chunks
            SET embedding = $1
            WHERE id = $2
            `,
            [JSON.stringify(embedding), id]
        );

        res.json({
            id: chunk.id,
            source: chunk.source,
            message: "Knowledge chunk embedded successfully"
        });

    } catch (error) {
        console.error("Knowledge embedding error:", error);

        res.status(500).json({
            error: "Failed to generate knowledge chunk embedding"
        });
    }
});


app.post("/api/knowledge/search", async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({
                error: "Search text is required"
            });
        }

        // 1. Convert the question into an embedding
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text
        });

        const queryEmbedding = response.data[0].embedding;

        // 2. Find the most similar knowledge chunks
        const result = await pool.query(
            `
            SELECT
                id,
                content,
                source,
                1 - (embedding <=> $1::vector) AS similarity
            FROM knowledge_chunks
            WHERE embedding IS NOT NULL
            ORDER BY embedding <=> $1::vector
            LIMIT 5
            `,
            [JSON.stringify(queryEmbedding)]
        );

        res.json({
            query: text,
            results: result.rows
        });

    } catch (error) {
        console.error("Knowledge search error:", error);

        res.status(500).json({
            error: "Failed to search knowledge base"
        });
    }
});

app.post("/api/knowledge/ask", async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({
                error: "Question is required"
            });
        }

        // 1. Create embedding for the user's question
        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text
        });

        const queryEmbedding = embeddingResponse.data[0].embedding;

        // 2. Retrieve relevant knowledge
const result = await pool.query(
    `
    SELECT
        id,
        content,
        source,
        1 - (embedding <=> $1::vector) AS similarity
    FROM knowledge_chunks
    WHERE embedding IS NOT NULL
      AND 1 - (embedding <=> $1::vector) >= 0.60
    ORDER BY embedding <=> $1::vector
    LIMIT 3
    `,
    [JSON.stringify(queryEmbedding)]
);

        // 3. Build context for the LLM
        const context = result.rows
            .map(chunk => `
Source: ${chunk.source}
Content: ${chunk.content}
`)
            .join("\n");

        // 4. Ask the LLM using retrieved context
        const prompt = `
You are a Service Desk AI assistant.

Answer the user's question using ONLY the knowledge provided below.

If the knowledge does not contain enough information,
say that you do not have enough information.

Knowledge:
${context}

User question:
${text}
`;

        const response = await openai.responses.create({
            model: "gpt-4.1-mini",
            input: prompt
        });

        // 5. Return answer + sources
        res.json({
            question: text,
            answer: response.output_text,
            sources: result.rows
        });

    } catch (error) {
        console.error("Knowledge RAG error:", error);

        res.status(500).json({
            error: "Failed to generate answer"
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