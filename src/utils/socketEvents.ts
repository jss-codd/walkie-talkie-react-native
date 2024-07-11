import { SetStateAction } from "react";
import { socket } from "../../socket";
import { loadStorage } from "./storage";

const roomJoin = (roomId: number) => {
    socket.emit("roomJoin", roomId);
}

const sendLocation = async (location: any) => {
    const userDetails = await loadStorage("userDetails");
    const token = userDetails.jwt;

    socket.emit('sendLocation', { location, token });
}

export { roomJoin, sendLocation };