import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// Import error handler early to suppress Chrome extension errors
import "./utils/errorHandler";
import { consoleInterceptor } from "./services/api/ConsoleInterceptor";

// Initialize console redirection
consoleInterceptor.init();

createRoot(document.getElementById("root")!).render(<App />);
