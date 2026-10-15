const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:4000/api";

export async function request(path, { token, body, ...options } = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...(body !== undefined && { body: JSON.stringify(body) })
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error("Could not reach the server. Please check your connection and try again.");
  }

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw Object.assign(new Error(result?.message || "The request failed. Please try again."), {
      status: response.status
    });
  }
  if (result === null) throw new Error("The server returned an invalid response. Please try again.");
  return result;
}

export const api = {
  login: (email, password) => request("/login", { method: "POST", body: { email, password } }),
  clients: (token, signal) => request("/clients", { token, signal }),
  projects: (token, clientId, signal) => request(
    clientId ? `/projects?${new URLSearchParams({ clientId })}` : "/projects",
    { token, signal }
  ),
  addClient: (token, name, email) => request("/clients", { token, method: "POST", body: { name, email } }),
  deleteClient: (token, id) => request(`/clients/${encodeURIComponent(id)}`, { token, method: "DELETE" })
};
