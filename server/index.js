const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let players = [];

// Регистрация игрока
app.post("/register", (req, res) => {
  const { userId, username } = req.body;

  let player = players.find(p => p.userId === userId);

  if (!player) {
    player = {
      userId,
      username,
      coins: 0
    };
    players.push(player);
  }

  res.json(player);
});

// Обновление монет
app.post("/update", (req, res) => {
  const { userId, coins } = req.body;

  const player = players.find(p => p.userId === userId);
  if (player) {
    player.coins = coins;
  }

  res.json({ success: true });
});

// Лидерборд
app.get("/leaderboard", (req, res) => {
  const sorted = [...players]
    .sort((a, b) => b.coins - a.coins)
    .slice(0, 10);

  res.json(sorted);
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
