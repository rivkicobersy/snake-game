import React, { useCallback, useEffect, useState } from "react";
import { Button, Cell, GameArea, GameContainer, Image, InfoText, Overlay, Score, Title } from "./styles";

const fruits = [
  { type: "apple", points: 1, imgSrc: "/apple.png" },
  { type: "pear", points: 1, imgSrc: "/pear.png" },
  { type: "pineapple", points: 1, imgSrc: "/pineapple.png" },
  { type: "grape", points: 2, imgSrc: "/grape.png" },
  { type: "cherry", points: 2, imgSrc: "/cherry.png" },
  { type: "banana", points: 2, imgSrc: "/banana.png" },
  { type: "peach", points: 3, imgSrc: "/peach.png" },
  { type: "strawberry", points: 3, imgSrc: "/strawberry.png" },
  { type: "orange", points: 3, imgSrc: "/orange.png" },
  { type: "fruit", points: 5, imgSrc: "/fruit.png" },
];

const calculateGridSize = () => {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const gridWidth = Math.floor((screenWidth * 0.8) / 20);
  const gridHeight = Math.floor((screenHeight * 0.8) / 20);
  return { gridWidth, gridHeight };
};

const generateFood = (snake, gridSize) => {
  const randomFruit = fruits[Math.floor(Math.random() * fruits.length)];
  const newFood = {
    x: Math.floor(Math.random() * gridSize.gridWidth),
    y: Math.floor(Math.random() * gridSize.gridHeight),
    fruit: randomFruit,
  };

  const isOnSnake = snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y);
  if (isOnSnake) {
    return generateFood(snake, gridSize);
  }

  return newFood;
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
  const [foods, setFoods] = useState(
    Array(5)
      .fill(null)
      .map(() => generateFood(snake, { gridWidth, gridHeight }))
  );
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(150);
  const [gridSize, setGridSize] = useState(calculateGridSize());

  useEffect(() => {
    const handleResize = () => {
      setGridSize(calculateGridSize());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const checkCollision = useCallback(
    (head) => {
      if (head.x < 0 || head.x >= gridSize.gridWidth || head.y < 0 || head.y >= gridSize.gridHeight) {
        return true;
      }

      for (let i = 0; i < snake.length - 1; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
          return true;
        }
      }

      return false;
    },
    [snake, gridSize]
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

    let eatenFood = null;

    const newFoods = foods.filter((food) => {
      if (head.x === food.x && head.y === food.y) {
        eatenFood = food;
        return false;
      }
      return true;
    });

    if (eatenFood) {
      setScore((prevScore) => prevScore + eatenFood.fruit.points);

      for (let i = 0; i < eatenFood.fruit.points; i++) {
        const newTail = { ...newSnake[newSnake.length - 1] };
        newSnake.push(newTail);
      }

      while (newFoods.length < 5) {
        newFoods.push(generateFood(newSnake, gridSize));
      }
    }

    if (!eatenFood) {
      newSnake.pop();
    }

    newSnake.unshift(head);
    setSnake(newSnake);
    setFoods(newFoods);
  }, [snake, direction, checkCollision, gridSize, gameOver, isPaused, foods]);

  const resetGame = () => {
    const newGridSize = calculateGridSize();
    setGridSize(newGridSize);
    setSnake([
      { x: Math.floor(newGridSize.gridWidth / 2), y: Math.floor(newGridSize.gridHeight / 2) },
      { x: Math.floor(newGridSize.gridWidth / 2), y: Math.floor(newGridSize.gridHeight / 2) + 1 },
    ]);
    setDirection("UP");
    setFoods(
      Array(5)
        .fill(null)
        .map(() => generateFood([], newGridSize))
    );
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
    setSpeed(150);
  };

  useEffect(() => {
    if (score > 0 && score % 5 === 0) {
      setSpeed((prevSpeed) => Math.max(prevSpeed - 10, 50));
    }
  }, [score]);

  useEffect(() => {
    const timer = setInterval(moveSnake, speed);
    return () => clearInterval(timer);
  }, [moveSnake, speed]);

  const handleKeyDown = useCallback(
    (event) => {
      event.preventDefault();

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
    [direction]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Save high score
  useEffect(() => {
    const highScore = getHighScore();
    if (score > highScore) {
      localStorage.setItem("highScore", score);
    }
  }, [score]);

  const renderGrid = () => {
    const grid = [];
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const isSnake = snake.some((segment) => segment.x === x && segment.y === y);
        const isHead = snake[0].x === x && snake[0].y === y;

        if (isSnake || isHead) {
          grid.push(<Cell key={`${x}-${y}`} x={x} y={y} isSnake={isSnake} isHead={isHead} cellSize={20} />);
        }

        foods.forEach((food) => {
          if (food.x === x && food.y === y) {
            grid.push(
              <Cell key={`${x}-${y}`} x={x} y={y} cellSize={20} isFood={true}>
                <Image src={food.fruit.imgSrc} style={{ width: "100%", height: "100%" }} />
              </Cell>
            );
          }
        });
      }
    }
    return grid;
  };

  return (
    <GameContainer>
      <Title>
        <InfoText>
          <Image src="/fruit.png" />
          <Score>{score}</Score>
          <Image src="/trophy.png" />
          <Score>{getHighScore()}</Score>
        </InfoText>
        Snake Game
      </Title>

      <GameArea width={gridSize.gridWidth * 20} height={gridSize.gridHeight * 20}>
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
