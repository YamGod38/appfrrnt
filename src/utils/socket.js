import { io } from 'socket.io-client';

const socket = io((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '', { 
    autoConnect: false 
});

export const connectSocket = () => {
    const token = localStorage.getItem('token');
    if (token) {
        socket.auth = { token };
        socket.connect();
    }
};

export default socket;
