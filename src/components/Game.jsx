import { useEffect, useRef, useState } from "react";
import planeImg from "../assets/plane.png";

export default function Game() {
  const canvasRef = useRef(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth > 500 ? 400 : window.innerWidth - 20;
    canvas.height = 600;

    let planeY = canvas.height / 2;
    let velocity = 0;
    let gravity = 0.6;
    let lift = -10;

    let pipes = [];
    let clouds = [];
    let frame = 0;
    let animationId;

    const planeImage = new Image();
    planeImage.src = planeImg;

    const plane = {
      x: 80,
      width: 60,
      height: 45,
      rotation: 0
    };

    function spawnPipe() {
      const gap = 170;
      const topHeight = Math.random() * 250 + 50;

      pipes.push({
        x: canvas.width,
        top: topHeight,
        bottom: topHeight + gap,
        width: 70,
        passed: false
      });
    }

    function spawnCloud() {
      clouds.push({
        x: canvas.width,
        y: Math.random() * 300,
        size: Math.random() * 40 + 40
      });
    }

    function drawClouds() {
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      clouds.forEach(cloud => {
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function drawPlane() {
      ctx.save();
      ctx.translate(plane.x + plane.width / 2, planeY + plane.height / 2);

      plane.rotation = velocity * 0.05;
      ctx.rotate(plane.rotation);

      ctx.drawImage(
        planeImage,
        -plane.width / 2,
        -plane.height / 2,
        plane.width,
        plane.height
      );

      ctx.restore();
    }

    function drawPipes() {
      ctx.fillStyle = "#00ff88";

      pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
        ctx.fillRect(
          pipe.x,
          pipe.bottom,
          pipe.width,
          canvas.height - pipe.bottom
        );
      });
    }

    function update() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      velocity += gravity;
      planeY += velocity;

      if (frame % 100 === 0) spawnPipe();
      if (frame % 120 === 0) spawnCloud();

      pipes.forEach(pipe => {
        pipe.x -= 3;

        if (
          plane.x < pipe.x + pipe.width &&
          plane.x + plane.width > pipe.x &&
          (planeY < pipe.top || planeY + plane.height > pipe.bottom)
        ) {
          setGameOver(true);
          cancelAnimationFrame(animationId);
        }

        if (!pipe.passed && pipe.x + pipe.width < plane.x) {
          pipe.passed = true;
          setScore(prev => prev + 1);
        }
      });

      clouds.forEach(cloud => {
        cloud.x -= 1;
      });

      if (planeY > canvas.height || planeY < 0) {
        setGameOver(true);
        cancelAnimationFrame(animationId);
      }

      drawClouds();
      drawPlane();
      drawPipes();

      frame++;
      animationId = requestAnimationFrame(update);
    }

    update();

    const handleClick = () => {
      velocity = lift;
    };

    window.addEventListener("click", handleClick);
    window.addEventListener("touchstart", handleClick);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("touchstart", handleClick);
    };
  }, []);

  const restartGame = () => {
    window.location.reload();
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2 style={{ color: "white" }}>✈ Flappy Empire</h2>
      <h3 style={{ color: "white" }}>Score: {score}</h3>

      <canvas
        ref={canvasRef}
        style={{
          background: "linear-gradient(#87CEEB, #4facfe)",
          borderRadius: "16px",
          maxWidth: "100%"
        }}
      />

      {gameOver && (
        <div>
          <h2 style={{ color: "red" }}>GAME OVER</h2>
          <button
            onClick={restartGame}
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              border: "none",
              background: "#ffcc00",
              fontWeight: "bold"
            }}
          >
            Играть снова
          </button>
        </div>
      )}
    </div>
  );
}
