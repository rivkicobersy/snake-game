import React, { useCallback, useEffect, useRef, useState } from "react";
import { MdRestartAlt, MdVolumeOff, MdVolumeUp } from "react-icons/md";
import Modal from "../Modal";
import { calculateGridSize, generateFood } from "./functions";
import {
  Button,
  Cell,
  GameArea,
  GameContainer,
  IconImage,
  Image,
  InfoText,
  Overlay,
  Score,
  Title,
  TitleWrapper,
} from "./styles";

const Game = () => {
  const { gridWidth, gridHeight } = calculateGridSize();
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  // const backgroundAudioRef = useRef(new Audio("/sounds/background.mp3"));
  const gameOverAudioRef = useRef(new Audio("/sounds/gameover.mp3"));
  const eatAudioRef = useRef(new Audio("/sounds/eat.mp3"));
  // backgroundAudioRef.current.loop = true;

  useEffect(() => {
    // backgroundAudioRef.current.muted = isMuted;
    gameOverAudioRef.current.muted = isMuted;
    eatAudioRef.current.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    if (!gameOver && score === 0) {
      // backgroundAudioRef.current.play().catch(() => {});
    }

    return () => {
      // backgroundAudioRef.current.pause();
      // backgroundAudioRef.current.currentTime = 0;
    };
  }, [gameOver, score]);

  const handleToggleMute = () => {
    setIsMuted((prev) => {
      const newMuted = !prev;
      // backgroundAudioRef.current.muted = newMuted;
      gameOverAudioRef.current.muted = newMuted;
      eatAudioRef.current.muted = newMuted;
      return newMuted;
    });
  };

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
  const [speed, setSpeed] = useState(150);
  const [gridSize, setGridSize] = useState(calculateGridSize());
  const [lastDirectionChange, setLastDirectionChange] = useState(Date.now());
  const [showModal, setShowModal] = useState(false);
  const [touchStart, setTouchStart] = useState(null);

  const handleRestartClick = () => {
    setIsPaused(true);
    setShowModal(true);
  };

  const handleConfirmRestart = () => {
    resetGame();
    setShowModal(false);
    setIsPaused(false);
  };

  const handleCancelRestart = () => {
    setShowModal(false);
    setIsPaused(false);
  };

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
      // backgroundAudioRef.current.pause();
      // backgroundAudioRef.current.currentTime = 0;
      gameOverAudioRef.current.play();
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
      eatAudioRef.current.currentTime = 0;
      eatAudioRef.current.play();

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
      {
        x: Math.floor(newGridSize.gridWidth / 2),
        y: Math.floor(newGridSize.gridHeight / 2),
      },
      {
        x: Math.floor(newGridSize.gridWidth / 2),
        y: Math.floor(newGridSize.gridHeight / 2) + 1,
      },
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

    gameOverAudioRef.current.pause();
    gameOverAudioRef.current.currentTime = 0;

    // backgroundAudioRef.current.currentTime = 0;
    // backgroundAudioRef.current.play();
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

      const currentTime = Date.now();
      const timeSinceLastChange = currentTime - lastDirectionChange;

      if (timeSinceLastChange < 150) return;

      switch (event.key) {
        case "ArrowUp":
        case "w":
          if (direction !== "DOWN") {
            setDirection("UP");
            setLastDirectionChange(currentTime);
          }
          break;
        case "ArrowDown":
        case "s":
          if (direction !== "UP") {
            setDirection("DOWN");
            setLastDirectionChange(currentTime);
          }
          break;
        case "ArrowLeft":
        case "a":
          if (direction !== "RIGHT") {
            setDirection("LEFT");
            setLastDirectionChange(currentTime);
          }
          break;
        case "ArrowRight":
        case "d":
          if (direction !== "LEFT") {
            setDirection("RIGHT");
            setLastDirectionChange(currentTime);
          }
          break;
        case " ":
          setIsPaused((prev) => !prev);
          break;
        case "r":
          handleRestartClick();
          break;
        case "Enter":
          if (gameOver) {
            resetGame();
          }
          break;
        default:
          break;
      }
    },
    [direction, gameOver, lastDirectionChange]
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

  useEffect(() => {
    const handleTouchStart = (e) => {
      const touchStartX = e.touches[0].clientX;
      const touchStartY = e.touches[0].clientY;
      setTouchStart({ x: touchStartX, y: touchStartY });
    };

    const handleTouchEnd = (e) => {
      if (!touchStart || gameOver) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const deltaX = touchEndX - touchStart.x;
      const deltaY = touchEndY - touchStart.y;

      const swipeThreshold = 30;
      const isSwipe = Math.abs(deltaX) > swipeThreshold || Math.abs(deltaY) > swipeThreshold;

      if (isSwipe) {
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
      } else {
        setIsPaused((prevIsPaused) => !prevIsPaused);
      }

      setTouchStart(null);
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [touchStart, direction, gameOver]);

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
            <IconImage src="/fruit.png" />
            <Score>{score}</Score>
            <IconImage src="/trophy.png" />
            <Score>{localStorage.getItem("highScore")}</Score>
          </InfoText>
        </Title>
        <div style={{ display: "flex", gap: "10px" }}>
          <Title>
            <MdRestartAlt onClick={handleRestartClick} cursor="pointer" size={24} />
          </Title>
          <Title>
            {isMuted ? (
              <MdVolumeOff onClick={handleToggleMute} cursor="pointer" size={24} />
            ) : (
              <MdVolumeUp onClick={handleToggleMute} cursor="pointer" size={24} />
            )}
          </Title>
        </div>
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
      {showModal && (
        <Modal
          message="Are you sure you want to restart the game?"
          onConfirm={handleConfirmRestart}
          onCancel={handleCancelRestart}
        />
      )}
    </GameContainer>
  );
};

export default Game;
