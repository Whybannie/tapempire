import { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [score, setScore] = useState(0);
  const [energy, setEnergy] = useState(100);
  const [maxEnergy, setMaxEnergy] = useState(100);
  const [power, setPower] = useState(1);
  const [page, setPage] = useState("home");
  const [floating, setFloating] = useState([]);
  const [username, setUsername] = useState("Player");
  const [level, setLevel] = useState(1);

  const tapSound = useRef(new Audio("/sounds/tap.mp3"));

  // 💾 Загрузка сохранения
  useEffect(() => {
    const saved = localStorage.getItem("tapEmpireData");
    if (saved) {
      const data = JSON.parse(saved);
      setScore(data.score || 0);
      setPower(data.power || 1);
      setMaxEnergy(data.maxEnergy || 100);
      setLevel(data.level || 1);
    }

    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const user = window.Telegram.WebApp.initDataUnsafe.user;
      setUsername(user.username || user.first_name);
    }
  }, []);

  // 💾 Сохранение
  useEffect(() => {
    localStorage.setItem(
      "tapEmpireData",
      JSON.stringify({ score, power, maxEnergy, level })
    );
  }, [score, power, maxEnergy, level]);

  // 🔋 Восстановление энергии
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy((prev) =>
        prev < maxEnergy ? prev + 1 : maxEnergy
      );
    }, 100);

    return () => clearInterval(interval);
  }, [maxEnergy]);

  // 🆙 Система уровней
  useEffect(() => {
    const newLevel = Math.floor(score / 1000) + 1;
    setLevel(newLevel);
  }, [score]);

  const handleTap = (e) => {
    if (energy <= 0) return;

    tapSound.current.currentTime = 0;
    tapSound.current.play();

    setScore((prev) => prev + power);
    setEnergy((prev) => prev - 1);

    const id = Date.now();
    setFloating((prev) => [
      ...prev,
      { id, x: e.clientX, y: e.clientY },
    ]);

    setTimeout(() => {
      setFloating((prev) =>
        prev.filter((item) => item.id !== id)
      );
    }, 800);
  };

  // 🛒 Магазин
  const buyPower = () => {
    const price = power * 100;
    if (score >= price) {
      setScore(score - price);
      setPower(power + 1);
    }
  };

  const buyEnergy = () => {
    const price = maxEnergy * 2;
    if (score >= price) {
      setScore(score - price);
      setMaxEnergy(maxEnergy + 50);
    }
  };

  const renderHome = () => (
    <>
      <div className="level">Уровень {level}</div>

      <div className="score">{score}</div>

      <div className="energy-bar">
        <div
          className="energy-fill"
          style={{ width: `${(energy / maxEnergy) * 100}%` }}
        ></div>
      </div>

      <div className="energy-text">
        ⚡ {energy} / {maxEnergy}
      </div>

      <button className="tap-button" onClick={handleTap}>
        TAP
      </button>
    </>
  );

  const renderLeaderboard = () => (
    <div className="page">
      <h2>🏆 Лидерборд</h2>
      <div className="leader-card">Скоро будет серверный</div>
    </div>
  );

  const renderShop = () => (
    <div className="page">
      <h2>🛒 Магазин</h2>

      <div className="shop-card">
        <div>Улучшить силу (+1)</div>
        <div>Цена: {power * 100}</div>
        <button className="buy-btn" onClick={buyPower}>
          Купить
        </button>
      </div>

      <div className="shop-card">
        <div>+50 Макс. энергии</div>
        <div>Цена: {maxEnergy * 2}</div>
        <button className="buy-btn" onClick={buyEnergy}>
          Купить
        </button>
      </div>
    </div>
  );

  return (
    <div className="app">
      <div className="top-bar">
        👤 @{username}
      </div>

      <div className="content">
        {page === "home" && renderHome()}
        {page === "leaderboard" && renderLeaderboard()}
        {page === "shop" && renderShop()}
      </div>

      <div className="bottom-nav">
        <button
          className={page === "home" ? "nav-btn active" : "nav-btn"}
          onClick={() => setPage("home")}
        >
          🏠
        </button>

        <button
          className={page === "leaderboard" ? "nav-btn active" : "nav-btn"}
          onClick={() => setPage("leaderboard")}
        >
          🏆
        </button>

        <button
          className={page === "shop" ? "nav-btn active" : "nav-btn"}
          onClick={() => setPage("shop")}
        >
          🛒
        </button>
      </div>

      {floating.map((item) => (
        <div
          key={item.id}
          className="floating"
          style={{ top: item.y, left: item.x }}
        >
          +{power}
        </div>
      ))}
    </div>
  );
}

export default App;
