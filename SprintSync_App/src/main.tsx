import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Import error handler early to suppress Chrome extension errors
import "./utils/errorHandler";

createRoot(document.getElementById("root")!).render(<App />);
  