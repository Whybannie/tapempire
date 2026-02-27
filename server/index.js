const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const TOKEN = "8612623390:AAF4rDiyI4AAlKM8tfTfzps1w5g4YVpPpDg";

const bot = new TelegramBot(TOKEN, { polling: true });

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./database.db");

// ================= DATABASE =================

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id TEXT UNIQUE,
      username TEXT,
      coins INTEGER DEFAULT 0,
      referrals INTEGER DEFAULT 0,
      referred_by TEXT
    )
  `);
});

console.log("🤖 Бот запущен...");

// ================= REFERRAL SYSTEM =================

// /start с рефералом
bot.onText(/\/start (.+)/, (msg, match) => {
  const chatId = msg.chat.id.toString();
  const username = msg.from.username || "Игрок";
  const refId = match[1];

  db.get(
    "SELECT * FROM users WHERE telegram_id = ?",
    [chatId],
    (err, row) => {
      if (!row) {
        db.run(
          "INSERT INTO users (telegram_id, username, referred_by) VALUES (?, ?, ?)",
          [chatId, username, refId],
          () => {
            // Защита от самореферала
            if (refId && refId !== chatId) {
              db.run(
                "UPDATE users SET coins = coins + 100, referrals = referrals + 1 WHERE telegram_id = ?",
                [refId]
              );
            }
          }
        );
      }
    }
  );

  bot.sendMessage(chatId, "🚀 Добро пожаловать в TapEmpire!");
});

// обычный /start
bot.onText(/\/start$/, (msg) => {
  bot.sendMessage(msg.chat.id, "🚀 Добро пожаловать в TapEmpire!");
});

// ================= API =================

// Регистрация из Mini App
app.post("/register", (req, res) => {
  const { telegram_id, username } = req.body;

  if (!telegram_id) {
    return res.status(400).json({ error: "No telegram_id" });
  }

  db.get(
    "SELECT * FROM users WHERE telegram_id = ?",
    [telegram_id],
    (err, row) => {
      if (row) {
        return res.json(row);
      }

      db.run(
        "INSERT INTO users (telegram_id, username) VALUES (?, ?)",
        [telegram_id, username || "Игрок"],
        function () {
          res.json({
            telegram_id,
            username,
            coins: 0,
            referrals: 0
          });
        }
      );
    }
  );
});

// Обновление монет
app.post("/update-coins", (req, res) => {
  const { telegram_id, coins } = req.body;

  if (!telegram_id) {
    return res.status(400).json({ error: "No telegram_id" });
  }

  db.run(
    "UPDATE users SET coins = ? WHERE telegram_id = ?",
    [coins, telegram_id],
    (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Database error" });
      }

      res.json({ success: true });
    }
  );
});

// Лидерборд
app.get("/leaderboard", (req, res) => {
  db.all(
    "SELECT username, coins FROM users ORDER BY coins DESC LIMIT 20",
    [],
    (err, rows) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Database error" });
      }

      const formatted = rows.map((user, index) => ({
        rank: index + 1,
        username: user.username || "Игрок",
        coins: user.coins
      }));

      res.json(formatted);
    }
  );
});

// ================= START SERVER =================

app.listen(3001, () => {
  console.log("🌐 API запущено на http://localhost:3001");
});
