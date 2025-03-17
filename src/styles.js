import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  body {
    display: block;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-thumb {
    background: rgb(134, 134, 134); 
    border-radius: 10px;
  }

  ::-webkit-scrollbar-track {
    background: #121212; 
  }

  * {
    scrollbar-width: thin;
    scrollbar-color:rgb(134, 134, 134) #121212;
  }
`;

export { GlobalStyle };
