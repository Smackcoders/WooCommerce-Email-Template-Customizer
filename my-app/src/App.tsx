import React from "react";
import "./App.css";
import store from "./Store/store";
import { Provider } from "react-redux";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Layout from "./Layout";
import ErrorBoundary from "./Components/ErrorBoundary";

import theme from "./Constants/Theme";
import { ThemeProvider } from "@mui/material/styles";

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <DndProvider backend={HTML5Backend}>
        <Provider store={store}>
          <ErrorBoundary>
            <Layout />
          </ErrorBoundary>
        </Provider>
      </DndProvider>
    </ThemeProvider>
  );
};

export default App;
