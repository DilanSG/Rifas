import { useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const BASE_URL = API_URL.replace(/\/api\/?$/, '');
const INTERVAL = 10 * 60 * 1000;

export function RenderKeepAlive() {
  useEffect(() => {
    const ping = () => {
      fetch(`${BASE_URL}/api/health`).catch(() => {});
    };

    ping();
    const id = setInterval(ping, INTERVAL);
    return () => clearInterval(id);
  }, []);

  return null;
}
