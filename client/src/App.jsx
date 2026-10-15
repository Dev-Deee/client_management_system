import React, { useCallback, useState } from "react";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [authMessage, setAuthMessage] = useState("");

  function login(token) {
    localStorage.setItem("token", token);
    setAuthMessage("");
    setToken(token);
  }

  const logout = useCallback((message = "") => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthMessage(message);
  }, []);

  return (
    <div className="container">
      {token ? (
        <Dashboard token={token} onLogout={logout} />
      ) : (
        <LoginForm onLogin={login} message={authMessage} setMessage={setAuthMessage} />
      )}
    </div>
  );
}
