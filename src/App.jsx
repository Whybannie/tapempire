import { useState, useEffect } from "react";
import "./index.css";

function App() {
  const tg = window.Telegram?.WebApp;

  const [loading, setLoading] = useState(true);
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
    }, 2000);
  }, []);

  useEffect(() => {
    localStorage.setItem("coins", coins);
  }, [coins]);

  const tapSound = new Audio(
    "https://www.soundjay.com/buttons/sounds/button-09.mp3"
  );

  const handleTap = () => {
    if (energy <= 0) return;

    setCoins((prev) => prev + 1);
    setEnergy((prev) => prev - 1);
    tapSound.play();
  };

  const restoreEnergy = () => {
    setEnergy(100);
  };

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
        <div>💰 {coins}</div>
      </div>

      <div className="center">
        <button className="tap-button" onClick={handleTap}>
          TAP
        </button>
        <p>⚡ Энергия: {energy}</p>
      </div>

      <div className="bottom-menu">
        <button className="menu-btn">🏠 Главная</button>
        <button className="menu-btn">🏆 Лидеры</button>
        <button className="menu-btn">👥 Друзья</button>
        <button className="menu-btn" onClick={restoreEnergy}>
          🔋 Восст.
        </button>
      </div>
    </div>
  );
}

export default App;
