import {io, Socket} from "socket.io-client";

export interface ServerToClientEvents {
    "score:ack": (msg: string) => void;
    "match:start": () => void;
    "match:end": () => void;
    "match:reset": () => void;
    "score.coral:add": (data: {
        alliance: "red" | "blue";
        level: "l4" | "l3" | "l2";
        branch: "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l";
    }) => void;
    "score.coral:remove": (data: {
        alliance: "red" | "blue";
        level: "l4" | "l3" | "l2";
        branch: "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l";
    }) => void;
    "score.coral.through:add": (data: {
        alliance: "red" | "blue";
        count: number;
    }) => void;
    "score.coral.through:remove": (data: {
        alliance: "red" | "blue";
        count: number;
    }) => void;

    "score.algae.net:add": (data: {
        alliance: "red" | "blue";
        count: number;
    }) => void;
    "score.algae.net:remove": (data: {
        alliance: "red" | "blue";
        count: number;
    }) => void;
    "score.algae.processor:add": (data: {
        alliance: "red" | "blue";
        count: number;
    }) => void;
    "score.algae.processor:remove": (data: {
        alliance: "red" | "blue";
        count: number;
    }) => void;

    "score.auto.leave:set": (data: {
        alliance: "red" | "blue";
        robotId: 1 | 2 | 3;
        value: "yes" | "no";
    }) => void;

    "score.endgame:set": (data: {
        alliance: "red" | "blue";
        robotId: 1 | 2 | 3;
        state: "none" | "parked" | "deepcage" | "shallowcage";
    }) => void;

    "score.penalty:set": (data: {
        alliance: "red" | "blue";
        type: "g206" | "g410" | "g418" | "g419" | "g428";
        value: boolean;
    }) => void;

    "score.foul:add": (data: {
        alliance: "red" | "blue";
        type: "minor" | "major" | "adjustment";
        count: number;
    }) => void;
    "score.foul:remove": (data: {
        alliance: "red" | "blue";
        type: "minor" | "major" | "adjustment";
        count: number;
    }) => void;
}

export interface ClientToServerEvents {
    "score:ack": (msg: string) => void;
    "match:start": () => void;
    "match:end": () => void;
    "match:reset": () => void;
}

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io("http://192.168.83.127:3000");
// export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io("http://10.0.100.69:3000");
// export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io("http://127.16.196.69:3000");
