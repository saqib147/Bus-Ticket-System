import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function useSocket(scheduleId) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!scheduleId) return undefined;

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-schedule', scheduleId);
    });

    return () => {
      socket.emit('leave-schedule', scheduleId);
      socket.disconnect();
    };
  }, [scheduleId]);

  return socketRef;
}

export default useSocket;
