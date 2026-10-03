import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { PasswordRecovery } from "./components/auth/PasswordRecovery";

// Read once before StrictMode renders, then remove the credential from history.
const fragment = new URLSearchParams(window.location.hash.slice(1));
const resetToken = fragment.get("reset-password");
if (resetToken !== null)
  window.history.replaceState(
    null,
    "",
    window.location.pathname + window.location.search,
  );

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {resetToken !== null ? (
      <main
        style={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          padding: 20,
          background: "#FFF8F4",
          boxSizing: "border-box",
        }}
      >
        <PasswordRecovery
          token={resetToken}
          onBack={() => window.location.assign("/?signin=1")}
        />
      </main>
    ) : (
      <App />
    )}
  </React.StrictMode>,
);
