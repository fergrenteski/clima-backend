const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const { neon } = require("@neondatabase/serverless");

const pool = neon(process.env.DATABASE_URL);

// 🚀 POST /dados - recebe uma lista de dados do ESP32
app.post("/dados", async (req, res) => {
    try {
        const dados = req.body;

        if (!Array.isArray(dados)) {
            return res.status(400).json({ error: "Esperado um array de objetos." });
        }

        for (const item of dados) {
            const { temp, umidade, light, timestamp } = item;

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

// 📥 GET /dados - retorna todos os dados armazenados
app.get("/dados", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM medidas ORDER BY id DESC");
        res.json(Object.values(result));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar os dados." });
    }
});

// 🔊 Inicializa o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
