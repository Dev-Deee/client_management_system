import React from "react";    
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function App() {
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [email, setEmail] = useState(
    "admin@viek.test"
  );

  const [password, setPassword] = useState(
    "password123"
  );

  const [clients, setClients] = useState([]);

  const [projects, setProjects] = useState([]);

  const [selectedClient, setSelectedClient] =
    useState("");

  const [clientName, setClientName] =
    useState("");

  const [clientEmail, setClientEmail] =
    useState("");

  const [authMessage, setAuthMessage] = useState("");

  const [clientMessage, setClientMessage] = useState("");

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setClients([]);
    setProjects([]);
    setSelectedClient("");
    setClientMessage("");
  }

  async function authFetch(path, options = {}) {
    let response;

    try {
      response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`
        }
      });
    } catch (err) {
      setClientMessage(
        "Could not reach the server. Please check your connection and try again."
      );
      return null;
    }

    if (response.status === 401) {
      logout();
      setAuthMessage("Your session has expired. Please log in again.");
      return null;
    }

    return response;
  }

  async function login(event) {
    event.preventDefault();

    setAuthMessage("");

    let response;

    try {
      response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });
    } catch (err) {
      setAuthMessage(
        "Could not reach the server. Please check your connection and try again."
      );
      return;
    }

    const result = await response.json();

    if (!response.ok) {
      setAuthMessage(result.message);
      return;
    }

    localStorage.setItem("token", result.token);
    setToken(result.token);
  }

  async function loadClients() {
    const response = await authFetch("/clients");

    if (!response) {
      return;
    }

    const result = await response.json();

    setClients(result.data);
  }

  async function loadProjects() {
    const path = selectedClient
      ? `/projects?clientId=${selectedClient}`
      : "/projects";

    const response = await authFetch(path);

    if (!response) {
      return;
    }

    const result = await response.json();

    setProjects(result.projects);
  }

  async function addClient(event) {
    event.preventDefault();

    const response = await authFetch("/clients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: clientName,
        email: clientEmail
      })
    });

    if (!response) {
      return;
    }

    const result = await response.json();

    if (!response.ok) {
      setClientMessage(result.message);
      return;
    }

    setClientMessage("Client added successfully");

    setClientName("");
    setClientEmail("");

    loadClients();
  }

  async function deleteClient(id) {
    const response = await authFetch(`/clients/${id}`, {
      method: "DELETE"
    });

    if (!response) {
      return;
    }

    const result = await response.json();

    setClientMessage(result.message);

    if (response.ok) {
      if (id === selectedClient) {
        setSelectedClient("");
      }

      loadClients();
    }
  }

  useEffect(() => {
    if (token) {
      loadClients();
      loadProjects();
    }
  }, [token, selectedClient]);

  if (!token) {
    return (
      <div className="container">
        <div className="card">
          <h1>VIEK Client Management</h1>

          <h2>Login</h2>

          <form onSubmit={login}>
            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Email"
            />

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Password"
            />

            <button type="submit">
              Login
            </button>
          </form>

          {authMessage && (
            <p className="message">
              {authMessage}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header-row">
        <h1>VIEK Client Management</h1>

        <button type="button" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="card">
        <h2>Add Client</h2>

        <form onSubmit={addClient}>
          <input
            value={clientName}
            onChange={(e) =>
              setClientName(e.target.value)
            }
            placeholder="Client name"
          />

          <input
            type="email"
            value={clientEmail}
            onChange={(e) =>
              setClientEmail(e.target.value)
            }
            placeholder="Client email"
          /><button type="submit">
            Add Client
          </button>
        </form>

        {clientMessage && (
          <p className="message">
            {clientMessage}
          </p>
        )}
      </div>

      <div className="card">
        <h2>Clients</h2>

        {clients.length === 0 ? (
          <p>No clients found.</p>
        ) : (
          <ul>
            {clients.map((client) => (
              <li key={client.id}>
                <strong>{client.name}</strong>
                <span>{client.email}</span>

                <button
                  onClick={() =>
                    deleteClient(client.id)
                  }
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h2>Projects</h2>

        <select
          value={selectedClient}
          onChange={(e) =>
            setSelectedClient(e.target.value)
            }
        >
          <option value="">
            All Clients
          </option>

          {clients.map((client) => (
            <option
              key={client.id}
              value={client.id}
            >
              {client.name}
            </option>
          ))}
        </select>

        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <strong>{project.name}</strong>

              <span>
                Client ID: {project.clientId}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;