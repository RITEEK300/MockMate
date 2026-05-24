import { useEffect, useRef, useState } from 'react';

import type { SignalMessage } from '../types';

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' }
];

interface UseWebRtcOptions {
  roomId: string;
  initiator: boolean;
  signalMessages: SignalMessage[];
  sendSignal: (roomId: string, type: SignalMessage['type'], payload: Record<string, unknown>) => void;
  clearSignals: () => void;
}

export function useWebRTC({ roomId, initiator, signalMessages, sendSignal, clearSignals }: UseWebRtcOptions) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
  const [error, setError] = useState<string | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const remoteStreamRef = useRef(new MediaStream());
  const startedOfferRef = useRef(false);
  const processedSignalsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!roomId) {
      return;
    }

    let mounted = true;

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        setLocalStream(stream);
      })
      .catch(() => {
        setError('Camera or mic permission denied.');
      });

    return () => {
      mounted = false;
    };
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !localStream) {
      return;
    }

    const peer = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    peerRef.current = peer;
    remoteStreamRef.current = new MediaStream();
    setRemoteStream(remoteStreamRef.current);

    localStream.getTracks().forEach((track) => peer.addTrack(track, localStream));

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal(roomId, 'ice', event.candidate.toJSON() as Record<string, unknown>);
      }
    };

    peer.ontrack = (event) => {
      event.streams[0]?.getTracks().forEach((track) => remoteStreamRef.current.addTrack(track));
      setRemoteStream(new MediaStream(remoteStreamRef.current.getTracks()));
    };

    peer.onconnectionstatechange = () => {
      setConnectionState(peer.connectionState);
      if (peer.connectionState === 'failed') {
        setError('Network unstable. Retry the connection.');
      }
    };

    return () => {
      peer.close();
      localStream.getTracks().forEach((track) => track.stop());
      remoteStreamRef.current.getTracks().forEach((track) => track.stop());
      peerRef.current = null;
      startedOfferRef.current = false;
      processedSignalsRef.current.clear();
      clearSignals();
    };
  }, [clearSignals, localStream, roomId, sendSignal]);

  useEffect(() => {
    if (!initiator || !localStream || startedOfferRef.current || !peerRef.current) {
      return;
    }

    startedOfferRef.current = true;
    void (async () => {
      try {
        const offer = await peerRef.current!.createOffer();
        await peerRef.current!.setLocalDescription(offer);
        sendSignal(roomId, 'offer', offer as unknown as Record<string, unknown>);
      } catch {
        setError('Offer create karne me issue aaya. Retry karo.');
      }
    })();
  }, [initiator, localStream, roomId, sendSignal]);

  useEffect(() => {
    const peer = peerRef.current;
    if (!peer) {
      return;
    }

    const pending = signalMessages.filter(
      (signal) => signal.roomId === roomId && !processedSignalsRef.current.has(signal.clientSignalId)
    );

    if (pending.length === 0) {
      return;
    }

    pending.forEach((signal) => {
      processedSignalsRef.current.add(signal.clientSignalId);

      void (async () => {
        try {
          if (signal.type === 'offer') {
            await peer.setRemoteDescription(signal.payload as unknown as RTCSessionDescriptionInit);
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            sendSignal(roomId, 'answer', answer as unknown as Record<string, unknown>);
            return;
          }

          if (signal.type === 'answer') {
            await peer.setRemoteDescription(signal.payload as unknown as RTCSessionDescriptionInit);
            return;
          }

          if (signal.type === 'ice') {
            await peer.addIceCandidate(signal.payload as RTCIceCandidateInit);
          }
        } catch {
          setError('Peer sync me issue aa gaya. Retry se connection recover ho sakta hai.');
        }
      })();
    });
  }, [roomId, sendSignal, signalMessages]);

  const toggleCamera = () => {
    localStream?.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setCameraEnabled(track.enabled);
    });
  };

  const toggleMic = () => {
    localStream?.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setMicEnabled(track.enabled);
    });
  };

  const retryConnection = async () => {
    const peer = peerRef.current;
    if (!peer) {
      return;
    }
    setError(null);
    const offer = await peer.createOffer({ iceRestart: true });
    await peer.setLocalDescription(offer);
    sendSignal(roomId, 'offer', offer as unknown as Record<string, unknown>);
  };

  return {
    localStream,
    remoteStream,
    cameraEnabled,
    micEnabled,
    connectionState,
    error,
    toggleCamera,
    toggleMic,
    retryConnection
  };
}
