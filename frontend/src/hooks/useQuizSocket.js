import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';

let globalSocket = null;

export const useQuizSocket = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(globalSocket);

  useEffect(() => {
    // We only want to establish this persistent connection for students
    if (user && user.role === 'student') {
      if (!globalSocket) {
        globalSocket = io('http://localhost:5000');
        
        // As soon as we connect, subscribe to the student's courses
        globalSocket.on('connect', () => {
          globalSocket.emit('student-subscribe-courses', { studentId: user.id });
        });
      }
      setSocket(globalSocket);
    }

    return () => {
      // We don't necessarily disconnect here because we want it to persist across page navigations.
      // The socket will disconnect when the browser tab closes or if we explicitly disconnect on logout.
    };
  }, [user]);

  return socket;
};
