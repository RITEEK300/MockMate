import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Client, IMessage, StompSubscription } from '@stomp/stompjs';

import { matchApi, roomApi } from '../lib/api';
import { createSocketClient } from '../lib/socket';
import { useAuth } from '../hooks/useAuth';
import type { ChatMessage, MatchRequest, RoomState, SignalMessage } from '../types';

type QueueStatus = 'idle' | 'queued' | 'matched' | 'error';
type SocketStatus = 'disconnected' | 'connecting' | 'connected';

interface MatchContextValue {
  queueStatus: QueueStatus;
  socketStatus: SocketStatus;
  activeRoom: RoomState | null;
  chatMessages: ChatMessage[];
  signalMessages: SignalMessage[];
  roomNotice: string | null;
  error: string | null;
  enqueue: (payload: MatchRequest) => Promise<void>;
  cancel: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  loadRoom: (roomId?: string) => Promise<void>;
  clearSignals: () => void;
  sendSignal: (roomId: string, type: SignalMessage['type'], payload: Record<string, unknown>) => void;
  sendChat: (roomId: string, message: string) => void;
  clearRoomNotice: () => void;
  resetSession: () => void;
}

export const MatchContext = createContext<MatchContextValue | undefined>(undefined);

export function MatchProvider({ children }: { children: React.ReactNode }) {
  const { auth } = useAuth();
  const [queueStatus, setQueueStatus] = useState<QueueStatus>('idle');
  const [socketStatus, setSocketStatus] = useState<SocketStatus>('disconnected');
  const [activeRoom, setActiveRoom] = useState<RoomState | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [signalMessages, setSignalMessages] = useState<SignalMessage[]>([]);
  const [roomNotice, setRoomNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<Client | null>(null);
  const roomSubscriptionRef = useRef<StompSubscription | null>(null);

  const clearSignals = useCallback(() => setSignalMessages([]), []);

  const clearRoomNotice = useCallback(() => setRoomNotice(null), []);

  const resetSession = useCallback(() => {
    setActiveRoom(null);
    setChatMessages([]);
    setSignalMessages([]);
    setRoomNotice(null);
    setQueueStatus('idle');
  }, []);

  const enqueue = useCallback(async (payload: MatchRequest) => {
    if (!auth?.token) {
      throw new Error('Missing auth token');
    }
    setError(null);
    await matchApi.enqueue(payload, auth.token);
    setQueueStatus('queued');
    setRoomNotice(null);
  }, [auth?.token]);

  const cancel = useCallback(async () => {
    if (!auth?.token) {
      return;
    }
    await matchApi.cancel(auth.token);
    setQueueStatus('idle');
    setActiveRoom(null);
    setRoomNotice(null);
  }, [auth?.token]);

  const refreshStatus = useCallback(async () => {
    if (!auth?.token) {
      return;
    }
    const status = await matchApi.status(auth.token);
    if (status.status === 'MATCHED' && status.roomId) {
      const room = await roomApi.byId(status.roomId, auth.token);
      setActiveRoom(room);
      setQueueStatus('matched');
      return;
    }
    setQueueStatus(status.status === 'QUEUED' ? 'queued' : 'idle');
  }, [auth?.token]);

  const loadRoom = useCallback(async (roomId?: string) => {
    if (!auth?.token) {
      return;
    }
    const room = roomId ? await roomApi.byId(roomId, auth.token) : await roomApi.active(auth.token);
    setActiveRoom(room);
    setQueueStatus('matched');
  }, [auth?.token]);

  const sendSignal = useCallback((roomId: string, type: SignalMessage['type'], payload: Record<string, unknown>) => {
    const client = clientRef.current;
    if (!client || !client.connected) {
      setError('Socket not connected');
      return;
    }
    client.publish({
      destination: `/app/rooms/${roomId}/signal`,
      body: JSON.stringify({ roomId, type, payload })
    });
  }, []);

  const sendChat = useCallback((roomId: string, message: string) => {
    const client = clientRef.current;
    if (!client || !client.connected) {
      setError('Socket not connected');
      return;
    }
    client.publish({
      destination: `/app/rooms/${roomId}/chat`,
      body: JSON.stringify({ message })
    });
  }, []);

  useEffect(() => {
    if (!auth?.token) {
      clientRef.current?.deactivate();
      clientRef.current = null;
      roomSubscriptionRef.current?.unsubscribe();
      roomSubscriptionRef.current = null;
      setSocketStatus('disconnected');
      setQueueStatus('idle');
      setActiveRoom(null);
      setChatMessages([]);
      setSignalMessages([]);
      return;
    }

    const client = createSocketClient(auth.token);
    clientRef.current = client;
    setSocketStatus('connecting');

    client.onConnect = () => {
      setSocketStatus('connected');
      setError(null);

      client.subscribe('/user/queue/match', (message: IMessage) => {
        const payload = JSON.parse(message.body) as RoomState;
        setActiveRoom(payload);
        setQueueStatus('matched');
        setRoomNotice(null);
      });

      client.subscribe('/user/queue/signals', (message: IMessage) => {
        const payload = JSON.parse(message.body) as Omit<SignalMessage, 'clientSignalId'>;
        setSignalMessages((current) => [
          ...current,
          {
            ...payload,
            clientSignalId: crypto.randomUUID()
          }
        ]);
      });

      client.subscribe('/user/queue/room', (message: IMessage) => {
        setRoomNotice(message.body || 'Peer disconnected. Requeueing you now.');
        setQueueStatus('queued');
      });
    };

    client.onStompError = (frame) => {
      setError(frame.headers.message || 'Socket handshake failed');
      setSocketStatus('disconnected');
    };

    client.onWebSocketClose = () => {
      setSocketStatus('disconnected');
      setError((current) => current ?? 'Network dropped. Retrying...');
    };

    client.activate();

    return () => {
      roomSubscriptionRef.current?.unsubscribe();
      roomSubscriptionRef.current = null;
      client.deactivate();
    };
  }, [auth?.token]);

  useEffect(() => {
    const client = clientRef.current;
    roomSubscriptionRef.current?.unsubscribe();
    roomSubscriptionRef.current = null;
    setChatMessages([]);

    if (!client || !client.connected || !activeRoom?.roomId) {
      return;
    }

    roomSubscriptionRef.current = client.subscribe(`/topic/rooms/${activeRoom.roomId}/chat`, (message: IMessage) => {
      setChatMessages((current) => [...current, JSON.parse(message.body) as ChatMessage]);
    });

    return () => {
      roomSubscriptionRef.current?.unsubscribe();
      roomSubscriptionRef.current = null;
    };
  }, [activeRoom?.roomId, socketStatus]);

  const value = useMemo<MatchContextValue>(() => ({
    queueStatus,
    socketStatus,
    activeRoom,
    chatMessages,
    signalMessages,
    roomNotice,
    error,
    enqueue,
    cancel,
    refreshStatus,
    loadRoom,
    clearSignals,
    sendSignal,
    sendChat,
    clearRoomNotice,
    resetSession
  }), [
    activeRoom,
    cancel,
    chatMessages,
    clearRoomNotice,
    clearSignals,
    enqueue,
    error,
    loadRoom,
    queueStatus,
    refreshStatus,
    resetSession,
    roomNotice,
    sendChat,
    sendSignal,
    signalMessages,
    socketStatus
  ]);

  return <MatchContext.Provider value={value}>{children}</MatchContext.Provider>;
}
