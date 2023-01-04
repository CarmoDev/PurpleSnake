import React, { useEffect, useRef, useState } from "react";
import "./App.css";

import useInterval from "./hooks/useInterval";

import Fruit from "./assets/appleLogo.png";
import Title from "./assets/title.svg";

const fruitAteAudio = require("./assets/fruitAte.mp3");
const gameOverAudio = require("./assets/morreu.mp3");

const fruitEated = new Audio(fruitAteAudio);
const endAudio = new Audio(gameOverAudio);

const canvasX = 1000;
const canvasY = 1000;
const initialSnake = [
  [4, 10],
  [4, 10],
];
const initialApple = [14, 10];
const scale = 50;
const timeDelay = 100;

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [snake, setSnake] = useState(initialSnake);
  const [apple, setApple] = useState(initialApple);
  const [direction, setDirection] = useState([0, -1]);
  const [delay, setDelay] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  useInterval(() => runGame(), delay);

  useEffect(() => {
    let fruit = document.getElementById("fruit") as HTMLCanvasElement;

    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        context.setTransform(scale, 0, 0, scale, 0, 0);
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        context.fillStyle = "#862ADB";
        snake.forEach(([x, y]) => context.fillRect(x, y, 1, 1));
        context.drawImage(fruit, apple[0], apple[1], 1, 1);
      }
    }
  }, [snake, apple, gameOver]);

  function handleSetScore() {
    if (score > Number(localStorage.getItem("snakeScore"))) {
      localStorage.setItem("snakeScore", JSON.stringify(score));
    }
  }

  function handleStartGame() {
    setSnake(initialSnake);
    setApple(initialApple);
    setDirection([1, 0]);
    setDelay(timeDelay);
    setScore(0);
    setGameOver(false);
  }

  function checkCollision(head: number[]) {
    for (let i = 0; i < head.length; i++) {
      if (head[i] < 0 || head[i] * scale >= canvasX) {
        endAudio.play();
        return true;
      }
    }

    for (const s of snake) {
      if (head[0] === s[0] && head[1] === s[1]) {
        endAudio.play();
        return true;
      }
    }

    return false;
  }

  function appleAte(newSnake: number[][]) {
    let coord = apple.map(() => Math.floor((Math.random() * canvasX) / scale));

    if (newSnake[0][0] === apple[0] && newSnake[0][1] === apple[1]) {
      let newApple = coord;
      fruitEated.play();
      setScore(score + 1);
      setApple(newApple);

      return true;
    }
    return false;
  }

  function runGame() {
    const newSnake = [...snake];
    const newSnakeHead = [
      newSnake[0][0] + direction[0],
      newSnake[0][1] + direction[1],
    ];
    newSnake.unshift(newSnakeHead);

    if (checkCollision(newSnakeHead)) {
      setDelay(null);
      setGameOver(true);
      handleSetScore();
    }
    if (!appleAte(newSnake)) {
      newSnake.pop();
    }

    setSnake(newSnake);
  }

  function handleChangeDirection(event: React.KeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      case "ArrowLeft":
        setDirection([-1, 0]);
        break;
      case "ArrowUp":
        setDirection([0, -1]);
        break;
      case "ArrowRight":
        setDirection([1, 0]);
        break;
      case "ArrowDown":
        setDirection([0, 1]);
        break;
    }
  }

  return (
    <div
      onKeyDown={(event) => handleChangeDirection(event)}
      className="Container"
    >
      <div></div>

      <div className="game">
        <img id="fruit" src={Fruit} alt="fruit" width="30" />

        <canvas
          className="playArea"
          ref={canvasRef}
          width={`${canvasX}px`}
          height={`${canvasY}px`}
        />

        {gameOver && (
          <div className="gameOver">
            <div>Game Over!</div>
            <h2>Score: {score}</h2>
          </div>
        )}
      </div>

      <div className="gameInformation">
        <img id="snake" src={Title} alt="Purple Snake" max-width="100%" />

        <div>
          <h2>Score: {score}</h2>
          <h2>High Score: {localStorage.getItem("snakeScore")}</h2>
        </div>

        <button onClick={handleStartGame} className="playButton">
          Start
        </button>
      </div>
    </div>
  );
}

export default App;
