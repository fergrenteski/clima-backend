const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { neon } = require("@neondatabase/serverless");
const serverless = require("serverless-http");

const app = express();
app.use(cors());
app.use(express.json());

const pool = neon(process.env.DATABASE_URL);

app.post("/api/dados", async (req, res) => {
    try {
        const dados = req.body;
        if (!Array.isArray(dados)) {
            return res.status(400).json({ error: "Esperado um array de objetos." });
        }

        for (const { temp, umidade, light, timestamp } of dados) {
            await pool.query(
                "INSERT INTO medidas (temp, umidade, light, timestamp) VALUES ($1, $2, $3, $4)",
                [temp, umidade, light, timestamp]
            );
        }

        res.status(201).json({ message: "Dados inseridos com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao inserir os dados." });
    }
});

app.get("/api/dados", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM medidas ORDER BY id DESC");
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar os dados." });
    }
});

// Exporta como função serverless
module.exports = app;
module.exports.handler = serverless(app);
