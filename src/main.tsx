import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";

import { initMonitoring } from "./monitoring";
import { router } from "./router";
import "./styles.css";

// Мониторинг — как можно раньше, до первого рендера.
initMonitoring();

const container = document.getElementById("root");
if (!container) {
  throw new Error("Не найден корневой элемент #root");
}

createRoot(container).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
