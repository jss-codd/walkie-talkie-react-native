import { SetStateAction } from "react";
import { socket } from "../../socket";
import { loadStorage } from "./storage";

const roomName = 'room';

const roomJoin = (roomId: number) => {
    socket.emit("roomJoin", roomId);
    // socket.emit('join', roomName);

    // socket.emit("join", roomName, (response) => {
    //     console.log(response.status); // ok
    // });
}

const roomLeave = (roomId: number) => {
    socket.emit('leave', roomId);
}

const sendLocation = async (location: any) => {
    const userDetails = await loadStorage("userDetails");
    const token = userDetails.jwt;

    socket.emit('sendLocation', { location, token });
}

export { roomJoin, sendLocation, roomLeave };