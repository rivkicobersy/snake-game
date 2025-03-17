import React, { useCallback, useEffect, useState } from "react";
import { Button, Cell, GameArea, GameContainer, Image, InfoText, Overlay, Title } from "./styles";

const calculateGridSize = () => {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const gridWidth = Math.floor((screenWidth * 0.8) / 20);
  const gridHeight = Math.floor((screenHeight * 0.8) / 20);
  return { gridWidth, gridHeight };
};

const Game = () => {
  const { gridWidth, gridHeight } = calculateGridSize();

  const getHighScore = () => {
    const highScore = localStorage.getItem("highScore");
    return highScore ? parseInt(highScore) : 0;
  };

  const [snake, setSnake] = useState([
    { x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) },
    { x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) + 1 },
  ]);
  const [direction, setDirection] = useState("UP");
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [fruitCount, setFruitCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(150);
  const [highScore, setHighScore] = useState(getHighScore());

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case "ArrowUp":
        case "ArrowDown":
        case "ArrowLeft":
        case "ArrowRight":
          event.preventDefault();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * gridWidth),
      y: Math.floor(Math.random() * gridHeight),
    };

    const isOnSnake = snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y);
    if (isOnSnake) {
      return generateFood();
    }

    return newFood;
  }, [snake, gridWidth, gridHeight]);

  const handleKeyDown = useCallback(
    (event) => {
      switch (event.key) {
        case "ArrowUp":
          if (direction !== "DOWN") setDirection("UP");
          break;
        case "ArrowDown":
          if (direction !== "UP") setDirection("DOWN");
          break;
        case "ArrowLeft":
          if (direction !== "RIGHT") setDirection("LEFT");
          break;
        case "ArrowRight":
          if (direction !== "LEFT") setDirection("RIGHT");
          break;
        case " ":
          setIsPaused((prev) => !prev);
          break;
        case "r":
          resetGame();
          break;
        default:
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [direction]
  );

  const checkCollision = useCallback(
    (head) => {
      if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
        return true;
      }

      for (let i = 0; i < snake.length - 1; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
          return true;
        }
      }

      return false;
    },
    [snake, gridWidth, gridHeight]
  );

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    const newSnake = [...snake];
    const head = { ...newSnake[0] };

    switch (direction) {
      case "UP":
        head.y -= 1;
        break;
      case "DOWN":
        head.y += 1;
        break;
      case "LEFT":
        head.x -= 1;
        break;
      case "RIGHT":
        head.x += 1;
        break;
      default:
        break;
    }

    if (checkCollision(head)) {
      setGameOver(true);
      return;
    }

    if (head.x === food.x && head.y === food.y) {
      setScore((prevScore) => prevScore + 1);
      setFruitCount((prevFruitCount) => prevFruitCount + 1);
      setFood(generateFood());

      if (score > 0 && score % 5 === 0) {
        setSpeed((prevSpeed) => Math.max(prevSpeed - 10, 50));
      }
    } else {
      newSnake.pop();
    }

    newSnake.unshift(head);
    setSnake(newSnake);
  }, [snake, direction, food, gameOver, isPaused, checkCollision, generateFood, score]);

  const resetGame = () => {
    const { gridWidth, gridHeight } = calculateGridSize();
    setSnake([
      { x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) },
      { x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) + 1 },
    ]);
    setDirection("UP");
    setFood(generateFood());
    setGameOver(false);
    setScore(0);
    setFruitCount(0);
    setIsPaused(false);
    setSpeed(150);
  };

  useEffect(() => {
    const timer = setInterval(moveSnake, speed);
    return () => clearInterval(timer);
  }, [moveSnake, speed]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setFood(generateFood());
  }, [generateFood]);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("highScore", score);
    }
  }, [score, highScore]);

  const renderGrid = () => {
    const grid = [];
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const isSnake = snake.some((segment) => segment.x === x && segment.y === y);
        const isHead = snake[0].x === x && snake[0].y === y;
        const isFood = food.x === x && food.y === y;

        if (isSnake || isHead) {
          grid.push(<Cell key={`${x}-${y}`} x={x} y={y} isSnake={isSnake} isHead={isHead} cellSize={20} />);
        }

        if (isFood) {
          grid.push(
            <Cell key={`${x}-${y}`} x={x} y={y} cellSize={20} isFood={true}>
              <Image src="/apple.png" style={{ width: "100%", height: "100%" }} />
            </Cell>
          );
        }
      }
    }
    return grid;
  };

  return (
    <GameContainer>
      <Title>
        <InfoText>
          <Image src="/apple.png" />
          {fruitCount}
        </InfoText>
        <InfoText>
          <Image src="/trophy.png" />
          {highScore}
        </InfoText>
        Snake Game
      </Title>

      <GameArea width={gridWidth * 20} height={gridHeight * 20}>
        {renderGrid()}
        {gameOver && (
          <Overlay>
            <h2>Game Over!</h2>
            <p>Final Score: {score}</p>
            <Button onClick={resetGame}>Play Again</Button>
          </Overlay>
        )}
        {isPaused && !gameOver && (
          <Overlay>
            <h2>Paused</h2>
            <Button onClick={() => setIsPaused(false)}>Resume</Button>
          </Overlay>
        )}
      </GameArea>
    </GameContainer>
  );
};

export default Game;
