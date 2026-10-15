import React from "react";

export default function ClientList({ clients, onDelete }) {
  return (
    <div className="card">
      <h2>Clients</h2>
      {clients.length === 0 ? <p>No clients found.</p> : (
        <ul>
          {clients.map((client) => (
            <li key={client.id}>
              <strong>{client.name}</strong>
              <span>{client.email}</span>
              <button onClick={() => onDelete(client.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
