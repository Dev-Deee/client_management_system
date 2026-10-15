import React from 'react';

export default function ProjectList({
  projects,
  clients,
  selectedClient,
  onSelect,
}) {
  return (
    <div className="card">
      <h2>Projects</h2>
      <select value={selectedClient} onChange={(e) => onSelect(e.target.value)}>
        <option value="">All Clients</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </select>
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <strong>{project.name}</strong>
            <span>
              {clients.find((c) => c.id === project.clientId)?.name ||
                `Client ID: ${project.clientId}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
