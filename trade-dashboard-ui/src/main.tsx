import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { installClarity } from "./analytics/clarity";
import "./i18n";
import "./index.css";
import App from "./App";

installClarity();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
