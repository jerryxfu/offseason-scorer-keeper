import {io, Socket} from "socket.io-client";


export interface ServerToClientEvents {
    "score:ack": (msg: string) => void;
    "match:start": () => void;
    "match:end": () => void;
    "match:reset": () => void;
    "score:add": (data: { alliance: "red" | "blue"; points: number }) => void;
    "score:remove": (data: { alliance: "red" | "blue"; points: number }) => void;
    "score:set": (data: { alliance: "red" | "blue"; points: number }) => void;
    "score:reset": (data: { alliance: "red" | "blue" }) => void;
}

export interface ClientToServerEvents {
    "score:ack": (msg: string) => void;
    "match:start": () => void;
    "match:end": () => void;
    "match:reset": () => void;
    "score:add": (data: { alliance: "red" | "blue"; points: number }) => void;
    "score:remove": (data: { alliance: "red" | "blue"; points: number }) => void;
    "score:set": (data: { alliance: "red" | "blue"; points: number }) => void;
    "score:reset": (data: { alliance: "red" | "blue" }) => void;
}

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io("http://192.168.83.66:3000");
