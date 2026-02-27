import { useState, useEffect } from "react";
import "./index.css";

function App() {
  const tg = window.Telegram?.WebApp;

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("home");
  const [coins, setCoins] = useState(0);
  const [energy, setEnergy] = useState(100);
  const [username, setUsername] = useState("Игрок");

  useEffect(() => {
    if (tg) {
      tg.expand();
      const user = tg.initDataUnsafe?.user;
      if (user?.username) {
        setUsername(user.username);
      }
    }

    const savedCoins = localStorage.getItem("coins");
    if (savedCoins) setCoins(Number(savedCoins));

    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  useEffect(() => {
    localStorage.setItem("coins", coins);
  }, [coins]);

  const handleTap = () => {
    if (energy <= 0) return;
    setCoins((prev) => prev + 1);
    setEnergy((prev) => prev - 1);
  };

  const restoreEnergy = () => {
    setEnergy(100);
  };

  const referralLink = `https://t.me/YOUR_BOT_USERNAME?start=${username}`;

  if (loading) {
    return (
      <div className="loading-screen">
        <h1 className="logo">TapEmpire</h1>
        <p>Загрузка империи...</p>
      </div>
    );
  }

  return (
    <div className="app">

      <div className="header">
        <div>@{username}</div>
        <div>{coins} COIN</div>
      </div>

      {page === "home" && (
        <div className="center">
          <button className="tap-button" onClick={handleTap}>
            TAP
          </button>
          <p>Энергия: {energy}</p>
        </div>
      )}

      {page === "referral" && (
        <div className="page">
          <h2>Реферальная система</h2>
          <p>Приглашай друзей и получай 100 COIN</p>
          <input
            className="ref-input"
            value={referralLink}
            readOnly
          />
          <button
            className="primary-btn"
            onClick={() => navigator.clipboard.writeText(referralLink)}
          >
            Скопировать ссылку
          </button>
        </div>
      )}

      {page === "leaderboard" && (
        <div className="page">
          <h2>Лидерборд</h2>
          <p>Скоро подключим сервер</p>
        </div>
      )}

      <div className="bottom-menu">
        <button
          className={page === "home" ? "nav active" : "nav"}
          onClick={() => setPage("home")}
        >
          Главная
        </button>

        <button
          className={page === "leaderboard" ? "nav active" : "nav"}
          onClick={() => setPage("leaderboard")}
        >
          Лидеры
        </button>

        <button
          className={page === "referral" ? "nav active" : "nav"}
          onClick={() => setPage("referral")}
        >
          Друзья
        </button>

        <button
          className="nav"
          onClick={restoreEnergy}
        >
          Энергия
        </button>
      </div>
    </div>
  );
}

export default App;
