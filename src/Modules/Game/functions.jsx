import { fruits } from "./static";

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

export { calculateGridSize, generateFood };
