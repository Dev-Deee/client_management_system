import {useCallback, useEffect, useState} from 'react';
import {api} from '../api';

export function useClientManagement(token, onLogout) {
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [message, setMessage] = useState('');
  const [revision, setRevision] = useState(0);

  const handleError = useCallback(
    (error) => {
      if (error.name === 'AbortError') return;
      if (error.status === 401) {
        onLogout('Your session has expired. Please log in again.');
      } else {
        setMessage(error.message);
      }
    },
    [onLogout],
  );

  useEffect(() => {
    const controller = new AbortController();
    api
      .clients(token, controller.signal)
      .then((result) => setClients(result.data))
      .catch(handleError);
    return () => controller.abort();
  }, [token, revision, handleError]);

  useEffect(() => {
    const controller = new AbortController();
    api
      .projects(token, selectedClient, controller.signal)
      .then((result) => setProjects(result.projects))
      .catch(handleError);
    return () => controller.abort();
  }, [token, selectedClient, revision, handleError]);

  async function addClient(name, email) {
    try {
      await api.addClient(token, name, email);
      setMessage('Client added successfully');
      setRevision((value) => value + 1);
      return true;
    } catch (error) {
      handleError(error);
      return false;
    }
  }

  async function deleteClient(id) {
    try {
      const result = await api.deleteClient(token, id);
      setMessage(result.message);
      setSelectedClient((current) => (current === id ? '' : current));
      setRevision((value) => value + 1);
    } catch (error) {
      handleError(error);
    }
  }

  return {
    clients,
    projects,
    selectedClient,
    setSelectedClient,
    message,
    addClient,
    deleteClient,
  };
}
