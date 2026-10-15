import React, { useState } from "react";
import { api } from "../api";

export default function LoginForm({ onLogin, message, setMessage }) {
  const [email, setEmail] = useState("admin@viek.test");
  const [password, setPassword] = useState("password123");

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    try {
      const result = await api.login(email, password);
      onLogin(result.token);
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="card">
      <h1>VIEK Client Management</h1>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <button type="submit">Login</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
}
