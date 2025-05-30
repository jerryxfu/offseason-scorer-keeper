import React, { useEffect, useState } from "react";
import { socket } from "./socket";
import { Alliance } from "./types.ts";

export default function App() {
    const [connected, setConnected] = useState(false);
    const [scores, setScores] = useState({ red: 0, blue: 0 });
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
            setScores({ red: 0, blue: 0 });
            setMatchState("waiting");
            // setLog((prev) => [...prev, "Match reset"]);
            setLog([]);
        });

        const score_events = [
            "score.coral:add",
            "score.coral:remove",
            "score.coral.through:add",
            "score.coral.through:remove",
            "score.algae.net:add",
            "score.algae.net:remove",
            "score.algae.processor:add",
            "score.algae.processor:remove",
            "score.auto.leave:set",
            "score.penalty:set",
            "score.foul:add",
            "score.foul:remove",
        ] as const;

        score_events.forEach((eventName) => {
            socket.on(eventName, (data: any) => {
                setLog((prev) => [...prev, `${eventName}: ${JSON.stringify(data)}`]);
            })
        })

        return () => {
            socket.off();
        };
    }, []);

    // Emitters for admin buttons
    const startMatch = () => socket.emit("match:start");
    const endMatch = () => socket.emit("match:end");
    const resetMatch = () => socket.emit("match:reset");

    return (
        <div style={{ padding: 20 }}>
            <div>System status: {connected ? "Connected 🟢" : "Disconnected 🔴"}</div>
            <h1>Scorekeeper Dashboard</h1>
            <h2>Match State: {matchState}</h2>
            <h3>Red: {scores.red} | Blue: {scores.blue}</h3>

            <div style={{ margin: "20px 0" }}>
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
