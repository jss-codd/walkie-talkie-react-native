// import { io } from 'socket.io-client';
import io from 'socket.io-client';
import { BACKEND_URL } from './src/utils/constants';

const socket = io(BACKEND_URL);

export { socket };