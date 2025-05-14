import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    overflow-x: hidden;
  }

  body {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
    background-image: url("/skin.png");
    background-blend-mode: overlay;

  }

  #root {
    height: 100%;
    width: 100%;
  }

`;

export { GlobalStyle };
