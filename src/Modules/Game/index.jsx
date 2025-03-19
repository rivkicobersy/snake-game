import React, { useCallback, useEffect, useState } from "react";
import { calculateGridSize, generateFood } from "./functions";
import { Button, Cell, GameArea, GameContainer, Image, InfoText, Overlay, Score, Title, TitleWrapper } from "./styles";

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

  const [touchStart, setTouchStart] = useState(null);
  const swipeThreshold = 30;

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

      const newTail = { ...newSnake[newSnake.length - 1] };
      newSnake.push(newTail);

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
        case "w":
          if (direction !== "DOWN") setDirection("UP");
          break;
        case "ArrowDown":
        case "s":
          if (direction !== "UP") setDirection("DOWN");
          break;
        case "ArrowLeft":
        case "a":
          if (direction !== "RIGHT") setDirection("LEFT");
          break;
        case "ArrowRight":
        case "d":
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

  useEffect(() => {
    const highScore = getHighScore();
    if (score > highScore) {
      localStorage.setItem("highScore", score);
    }
  }, [score]);

  const handleTouchStart = (e) => {
    const touchStartX = e.touches[0].clientX;
    const touchStartY = e.touches[0].clientY;
    setTouchStart({ x: touchStartX, y: touchStartY });
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStart.x;
    const deltaY = touchEndY - touchStart.y;

    if (Math.abs(deltaX) > swipeThreshold || Math.abs(deltaY) > swipeThreshold) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0 && direction !== "LEFT") {
          setDirection("RIGHT");
        } else if (deltaX < 0 && direction !== "RIGHT") {
          setDirection("LEFT");
        }
      } else {
        if (deltaY > 0 && direction !== "UP") {
          setDirection("DOWN");
        } else if (deltaY < 0 && direction !== "DOWN") {
          setDirection("UP");
        }
      }
    }

    setTouchStart(null);
  };

  useEffect(() => {
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [touchStart, direction]);

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
      <TitleWrapper width={gridSize.gridWidth * 20}>
        <Title>
          <InfoText>
            <Image src="/fruit.png" />
            <Score>{score}</Score>
            <Image src="/trophy.png" />
            <Score>{localStorage.getItem("highScore")}</Score>
          </InfoText>
        </Title>
        <Title>Snake Game</Title>
      </TitleWrapper>

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
