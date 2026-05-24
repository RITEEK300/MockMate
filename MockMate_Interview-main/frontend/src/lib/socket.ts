import { Client } from '@stomp/stompjs';

import { API_BASE_URL } from './api';

function toWebSocketUrl() {
  const apiUrl = new URL(API_BASE_URL);
  apiUrl.protocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
  apiUrl.pathname = '/ws';
  apiUrl.search = '';
  return apiUrl.toString();
}

export function createSocketClient(token: string) {
  return new Client({
    brokerURL: toWebSocketUrl(),
    reconnectDelay: 3000,
    connectHeaders: {
      Authorization: `Bearer ${token}`
    },
    debug: () => {}
  });
}
