import React, { useState } from "react";

export default function ClientForm({ onAdd, message }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  async function submit(event) {
    event.preventDefault();
    if (await onAdd(name, email)) {
      setName("");
      setEmail("");
    }
  }

  return (
    <div className="card">
      <h2>Add Client</h2>
      <form onSubmit={submit}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Client name" />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Client email" />
        <button type="submit">Add Client</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
}
