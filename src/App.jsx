// App.jsx
import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
];
const INITIAL_DIRECTION = "UP";
const INITIAL_SPEED = 150;

// Styled Components
const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 10px;
`;

const InfoPanel = styled.div`
  margin-bottom: 20px;
  text-align: center;
`;

const InfoText = styled.p`
  margin: 5px 0;
  color: #666;
`;

const GameArea = styled.div`
  position: relative;
  border: 2px solid #333;
  background-color: #f8f8f8;
  overflow: hidden;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
`;

const Cell = styled.div`
  position: absolute;
  box-sizing: border-box;
  left: ${(props) => props.x * CELL_SIZE}px;
  top: ${(props) => props.y * CELL_SIZE}px;
  width: ${CELL_SIZE}px;
  height: ${CELL_SIZE}px;
  background-color: ${(props) => {
    if (props.isHead) return "#388E3C";
    if (props.isSnake) return "#4CAF50";
    if (props.isFood) return "#F44336";
    return "transparent";
  }};
  border-radius: ${(props) => {
    if (props.isHead) return "4px";
    if (props.isSnake) return "3px";
    if (props.isFood) return "50%";
    return "0";
  }};
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  z-index: 10;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;

  &:hover {
    background-color: #388e3c;
  }
`;

// Main App Component
function App() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  // Generate random food position
  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };

    // Make sure food doesn't spawn on snake
    const isOnSnake = snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y);

    if (isOnSnake) {
      return generateFood();
    }
    return newFood;
  }, [snake]);

  // Handle keyboard input
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
    [direction]
  );

  // Check if snake collides with itself or walls
  const checkCollision = useCallback(
    (head) => {
      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        return true;
      }

      // Check self collision (skip the last segment which is the tail)
      for (let i = 0; i < snake.length - 1; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
          return true;
        }
      }

      return false;
    },
    [snake]
  );

  // Move the snake
  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    const newSnake = [...snake];
    const head = { ...newSnake[0] };

    // Calculate new head position
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

    // Check for collision
    if (checkCollision(head)) {
      setGameOver(true);
      return;
    }

    // Check if snake eats food
    if (head.x === food.x && head.y === food.y) {
      setScore((prevScore) => prevScore + 1);
      setFood(generateFood());

      // Increase speed every 5 points
      if (score > 0 && score % 5 === 0) {
        setSpeed((prevSpeed) => Math.max(prevSpeed - 10, 50));
      }
    } else {
      // Remove tail if not eating
      newSnake.pop();
    }

    // Add new head
    newSnake.unshift(head);
    setSnake(newSnake);
  }, [snake, direction, food, gameOver, isPaused, checkCollision, generateFood, score]);

  // Reset game
  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood());
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
    setSpeed(INITIAL_SPEED);
  };

  // Game loop
  useEffect(() => {
    const timer = setInterval(moveSnake, speed);
    return () => clearInterval(timer);
  }, [moveSnake, speed]);

  // Set up keyboard listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Initial food position
  useEffect(() => {
    setFood(generateFood());
  }, []);

  // Render game cells
  const renderGrid = () => {
    const grid = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const isSnake = snake.some((segment) => segment.x === x && segment.y === y);
        const isHead = snake[0].x === x && snake[0].y === y;
        const isFood = food.x === x && food.y === y;

        if (isSnake || isHead || isFood) {
          grid.push(<Cell key={`${x}-${y}`} x={x} y={y} isSnake={isSnake} isHead={isHead} isFood={isFood} />);
        }
      }
    }
    return grid;
  };

  return (
    <GameContainer>
      <Title>Snake Game</Title>
      <InfoPanel>
        <InfoText>Score: {score}</InfoText>
        <InfoText>Use arrow keys to move</InfoText>
        <InfoText>Press 'Space' to pause</InfoText>
        <InfoText>Press 'R' to restart</InfoText>
      </InfoPanel>
      <GameArea width={GRID_SIZE * CELL_SIZE} height={GRID_SIZE * CELL_SIZE}>
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
}

export default App;
