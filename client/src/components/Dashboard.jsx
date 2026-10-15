import React from "react";
import { useClientManagement } from "../hooks/useClientManagement";
import ClientForm from "./ClientForm";
import ClientList from "./ClientList";
import ProjectList from "./ProjectList";

export default function Dashboard({ token, onLogout }) {
  const { clients, projects, selectedClient, setSelectedClient, message, addClient, deleteClient } =
    useClientManagement(token, onLogout);

  return (
    <>
      <header className="header-row">
        <h1>VIEK Client Management</h1>
        <button type="button" onClick={() => onLogout()}>Logout</button>
      </header>
      <ClientForm onAdd={addClient} message={message} />
      <ClientList clients={clients} onDelete={deleteClient} />
      <ProjectList projects={projects} clients={clients} selectedClient={selectedClient} onSelect={setSelectedClient} />
    </>
  );
}
