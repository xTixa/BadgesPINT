import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import database from "./config/database.js";
import routes from "./routes/index.js";
import * as models from "./models/index.js";

//import { LearningPath } from "./models/index.js";

dotenv.config();

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    process.env.FRONTEND_URL,
    process.env.PUBLIC_APP_URL,
  ]
    .filter(Boolean)
    .join(",")
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      return callback(null, true);
    }
    return callback(new Error(`Origem CORS nao permitida: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Redirecionar HTTP → HTTPS em produção (Render define x-forwarded-proto)
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

app.use(express.json({ limit: "5mb" }));

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "BadgesPINT API" });
});

// Rotas
app.use("/", routes);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

// Validar ligação, sincronizar models e iniciar servidor uma única vez
database
  .authenticate()
  .then(() => {
    console.log("Ligação à BD OK");
    return Promise.all([
      database.query('ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS avatar_url TEXT'),
      database.query('ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS rgpd_publication_accepted BOOLEAN DEFAULT FALSE'),
      database.query('ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS public_profile_enabled BOOLEAN DEFAULT FALSE'),
      database.query('ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS linkedin_sharing_enabled BOOLEAN DEFAULT TRUE'),
      database.query('ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS goal_text TEXT'),
      database.query('ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS goal_deadline DATE'),
      database.query('ALTER TABLE consultor_badges ADD COLUMN IF NOT EXISTS certificate_code VARCHAR(64) UNIQUE'),
      database.query('ALTER TABLE badges ADD COLUMN IF NOT EXISTS subtitle TEXT'),
      database.query('ALTER TABLE badges ADD COLUMN IF NOT EXISTS slug VARCHAR(180) UNIQUE'),
      database.query('ALTER TABLE badges ADD COLUMN IF NOT EXISTS learning_outcomes JSONB'),
      database.query('ALTER TABLE badges ADD COLUMN IF NOT EXISTS target_audience JSONB'),
      database.query('ALTER TABLE badges ADD COLUMN IF NOT EXISTS prerequisites JSONB'),
      database.query('ALTER TABLE badges ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 0'),
      database.query('ALTER TABLE badges ADD COLUMN IF NOT EXISTS difficulty VARCHAR(40)'),
      database.query("ALTER TABLE badges ADD COLUMN IF NOT EXISTS language VARCHAR(40) DEFAULT 'pt-PT'"),
      database.query('ALTER TABLE badges ADD COLUMN IF NOT EXISTS instructor_name VARCHAR(150)'),
      database.query('ALTER TABLE badges ADD COLUMN IF NOT EXISTS promo_video_url TEXT'),
      database.query('ALTER TABLE badges ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE'),
      database.query('ALTER TABLE badges ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT TRUE'),
    ]);
  })
  .then(() => {
    return database.sync();
  })
  .then(() => {
    console.log("Models sincronizados com PostgreSQL");
    app.listen(PORT, () => {
      console.log(`Server a correr em http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("Erro ao iniciar servidor:", err));
