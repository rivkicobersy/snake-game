import styled from "styled-components";

const Title = styled.h1`
  font-family: "Roboto", sans-serif;
  color: #333;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  white-space: nowrap;
  padding-left: 1rem;
  padding-right: 1rem;
  background: rgba(223, 242, 220, 0.8);
  border-radius: 50px;
  padding: 0.5rem;
`;

const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: ${(props) => props.width}px;
`;

const Image = styled.img`
  height: 30px;
  width: 30px;
`;

const InfoPanel = styled.div`
  text-align: center;
  font-family: "Roboto", sans-serif;
  flex-shrink: 0;
`;

const InfoText = styled.p`
  font-size: 1.2rem;
  color: #666;
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const GameContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-top: 3%;
  gap: 20px;
`;

const GameArea = styled.div`
  position: relative;
  background-color: rgba(223, 242, 220, 0.8);
  overflow: hidden;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  flex-grow: 1;
  border-radius: 12px;
`;

const Cell = styled.div.attrs((props) => ({
  style: {
    left: `${props.x * props.cellSize}px`,
    top: `${props.y * props.cellSize}px`,
    width: `${props.cellSize}px`,
    height: `${props.cellSize}px`,
  },
}))`
  position: absolute;
  box-sizing: border-box;
  background-color: ${(props) => {
    if (props.isHead) return "#388E3C";
    if (props.isSnake) return "#4CAF50";
    return "transparent";
  }};
  border-radius: ${(props) => {
    if (props.isHead) return "6px";
    if (props.isSnake) return "4px";
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
  border-radius: 8px;
`;

const Button = styled.button`
  padding: 12px 24px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  margin-top: 15px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #388e3c;
  }

  @media (max-width: 768px) {
    font-size: 16px;
    padding: 10px 20px;
  }
`;

const Score = styled.p`
  padding-right: 1rem;
  padding-left: 0.2rem;
`;

export { Button, Cell, GameArea, GameContainer, Image, InfoPanel, InfoText, Overlay, Score, Title, TitleWrapper };
