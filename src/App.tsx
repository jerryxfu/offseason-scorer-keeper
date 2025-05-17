import React, {useEffect, useState} from "react";
import {socket} from "./socket";
import {Alliance} from "./types.ts";

export default function App() {
    const [connected, setConnected] = useState(false);
    const [scores, setScores] = useState({red: 0, blue: 0});
    const [matchState, setMatchState] = useState("waiting");
    const [log, setLog] = useState<string[]>([]);

    useEffect(() => {
        socket.on("connect", () => {
            console.log("Connected", socket.id);
            setConnected(true);
        });

        socket.on("disconnect", () => {
            console.log("Disconnected");
            setConnected(false);
        });

        socket.on("match:start", () => {
            setMatchState("running");
            setLog((prev) => [...prev, "Match started"]);
        });

        socket.on("match:end", () => {
            setMatchState("ended");
            setLog((prev) => [...prev, "Match ended"]);
        });

        socket.on("match:reset", () => {
            setScores({red: 0, blue: 0});
            setMatchState("waiting");
            // setLog((prev) => [...prev, "Match reset"]);
            setLog([]);
        });

        socket.on("score:ack", (msg) => {
            console.log("HOAIWJDOIAWJDOIJAOIJASDoij");
            setLog((prev) => [...prev, msg]);

            const match = msg.match(/(red|blue) ([+-]\d+)/);
            if (match) {
                const alliance = match[1] as Alliance;
                const delta = parseInt(match[2]!, 10);
                setScores((prev) => ({
                    ...prev,
                    [alliance]: prev[alliance] + delta,
                }));
            } else {
                console.error("Invalid score ack message:", msg);
            }
        });

        return () => {
            socket.off("match:start");
            socket.off("match:end");
            socket.off("match:reset");
            socket.off("score:ack");
        };
    }, []);

    // Emitters for admin buttons
    const startMatch = () => socket.emit("match:start");
    const endMatch = () => socket.emit("match:end");
    const resetMatch = () => socket.emit("match:reset");

    return (
        <div style={{padding: 20}}>
            <div>System status: {connected ? "Connected 🟢" : "Disconnected 🔴"}</div>
            <h1>Scorekeeper Dashboard</h1>
            <h2>Match State: {matchState}</h2>
            <h3>Red: {scores.red} | Blue: {scores.blue}</h3>

            <div style={{margin: "20px 0"}}>
                <button onClick={startMatch} disabled={matchState === "running"}>Start Match</button>
                <button onClick={endMatch} disabled={matchState !== "running"}>End Match</button>
                <button onClick={resetMatch}>Reset Match</button>
            </div>

            <h4>Event Log:</h4>
            <ul>
                {log.map((entry, i) => (
                    <li key={i}>{entry}</li>
                ))}
            </ul>
        </div>
    );
}
