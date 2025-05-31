import {useEffect, useState} from "react";
import {socket} from "./socket";
import "./App.scss";
import StatusBar from "./components/statusbar/StatusBar.tsx";

const AUTO_LEAVE_OPTIONS = ["Unknown", "Yes", "No"];
const ENDGAME_OPTIONS = ["Unknown", "DeepCage", "ShallowCage", "Parked", "None"];
const BRANCHES = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"] as const;
const FOULS = ["Minor", "Major", "Adjustment"] as const;
const LEVELS = ["l4", "l3", "l2"] as const;

export type Alliance = "red" | "blue";

function createInitialReefCheckboxes() {
    return Object.fromEntries(
        LEVELS.flatMap(level =>
            BRANCHES.map(branch => [[level, branch].join("-"), false])
        )
    ) as Record<string, boolean>;
}

function createInitialDropdowns(): { 1: string; 2: string; 3: string } {
    return {1: "Unknown", 2: "Unknown", 3: "Unknown"};
}

export default function App() {
    const [connected, setConnected] = useState(false);
    const [matchStatus, setMatchStatus] = useState("⏳ Awaiting...");

    // State for both alliances
    const [autoLeaveDropdowns, setAutoLeaveDropdowns] = useState({
        red: createInitialDropdowns(),
        blue: createInitialDropdowns()
    });
    const [endgameDropdowns, setEndgameDropdowns] = useState({
        red: createInitialDropdowns(),
        blue: createInitialDropdowns()
    });
    const [reefCheckboxes, setReefCheckboxes] = useState({
        red: createInitialReefCheckboxes(),
        blue: createInitialReefCheckboxes()
    });
    const [netCountAuto, setNetCountAuto] = useState({red: 0, blue: 0});
    const [processorCountAuto, setProcessorCountAuto] = useState({red: 0, blue: 0});
    const [throughCountAuto, setThroughCountAuto] = useState({red: 0, blue: 0});

    const [netCountTeleop, setNetCountTeleop] = useState({red: 0, blue: 0});
    const [processorCountTelop, setProcessorCountTelop] = useState({red: 0, blue: 0});
    const [throughCountTeleop, setThroughCountTeleop] = useState({red: 0, blue: 0});

    const [minorFoulCount, setMinorFoulCount] = useState({red: 0, blue: 0});
    const [majorFoulCount, setMajorFoulCount] = useState({red: 0, blue: 0});
    const [adjustmentFoulCount, setAdjustmentFoulCount] = useState({red: 0, blue: 0});

    function handleMatchStart() {
        socket.emit("match:start");
    }

    function handleMatchEnd() {
        socket.emit("match:end");
    }

    function handleMatchReset() {
        socket.emit("match:reset");
    }

    useEffect(() => {
        socket.on("connect", () => setConnected(true));
        socket.on("disconnect", () => setConnected(false));
        socket.on("match:start", () => setMatchStatus("🟢 In progress!"));
        socket.on("match:end", () => setMatchStatus("🔴 Ended"));
        socket.on("match:reset", () => {
            setMatchStatus("⏳ Awaiting...");
            setNetCountTeleop({red: 0, blue: 0});
            setProcessorCountAuto({red: 0, blue: 0});
            setProcessorCountTelop({red: 0, blue: 0});
            setThroughCountAuto({red: 0, blue: 0});
            setThroughCountTeleop({red: 0, blue: 0});
            setMinorFoulCount({red: 0, blue: 0});
            setMajorFoulCount({red: 0, blue: 0});
            setAdjustmentFoulCount({red: 0, blue: 0});
            setReefCheckboxes({red: createInitialReefCheckboxes(), blue: createInitialReefCheckboxes()});
            setAutoLeaveDropdowns({red: createInitialDropdowns(), blue: createInitialDropdowns()});
            setEndgameDropdowns({red: createInitialDropdowns(), blue: createInitialDropdowns()});

        });

        socket.on("score.auto.leave:set", (data) => {
            setAutoLeaveDropdowns(prev => ({
                ...prev,
                [data.alliance]: {
                    ...prev[data.alliance],
                    [data.robotId]: data.value === "yes" ? "Yes" : data.value === "no" ? "No" : "Unknown"
                }
            }));
        });

        socket.on("score.endgame:set", (data) => {
            setEndgameDropdowns(prev => ({
                ...prev,
                [data.alliance]: {
                    ...prev[data.alliance],
                    [data.robotId]:
                        data.state === "deepcage" ? "DeepCage" :
                            data.state === "shallowcage" ? "ShallowCage" :
                                data.state === "parked" ? "Parked" :
                                    data.state === "none" ? "None" : "Unknown"
                }
            }));
        });

        socket.on("score.algae.net:add", (data) => {
            if (data.auto) {
                setNetCountAuto(prev => ({...prev, [data.alliance]: prev[data.alliance] + data.count}));
            } else {
                setNetCountTeleop(prev => ({...prev, [data.alliance]: prev[data.alliance] + data.count}));
            }
        });
        socket.on("score.algae.net:remove", (data) => {
            if (data.auto) {
                setNetCountAuto(prev => ({...prev, [data.alliance]: Math.max(0, prev[data.alliance] - data.count)}));
            } else {
                setNetCountTeleop(prev => ({...prev, [data.alliance]: Math.max(0, prev[data.alliance] - data.count)}));
            }
        });
        socket.on("score.algae.processor:add", (data) => {
            if (data.auto) {
                setProcessorCountAuto(prev => ({...prev, [data.alliance]: prev[data.alliance] + data.count}));
            } else {
                setProcessorCountTelop(prev => ({...prev, [data.alliance]: prev[data.alliance] + data.count}));
            }
        });
        socket.on("score.algae.processor:remove", (data) => {
            if (data.auto) {
                setProcessorCountAuto(prev => ({...prev, [data.alliance]: Math.max(0, prev[data.alliance] - data.count)}));
            } else {
                setProcessorCountTelop(prev => ({...prev, [data.alliance]: Math.max(0, prev[data.alliance] - data.count)}));
            }
        });
        socket.on("score.coral.through:add", (data) => {
            if (data.auto) {
                setThroughCountAuto(prev => ({...prev, [data.alliance]: prev[data.alliance] + data.count}));
            } else {
                setThroughCountTeleop(prev => ({...prev, [data.alliance]: prev[data.alliance] + data.count}));
            }
        });
        socket.on("score.coral.through:remove", (data) => {
            if (data.auto) {
                setThroughCountAuto(prev => ({...prev, [data.alliance]: Math.max(0, prev[data.alliance] - data.count)}));
            } else {
                setThroughCountTeleop(prev => ({...prev, [data.alliance]: Math.max(0, prev[data.alliance] - data.count)}));
            }
        });

        socket.on("score.coral:add", (data) => {
            setReefCheckboxes(prev => ({
                ...prev,
                [data.alliance]: {
                    ...prev[data.alliance],
                    [`${data.level}-${data.branch}-${data.auto}`]: true
                }
            }));
        });
        socket.on("score.coral:remove", (data) => {
            setReefCheckboxes(prev => ({
                ...prev,
                [data.alliance]: {
                    ...prev[data.alliance],
                    [`${data.level}-${data.branch}-${data.auto}`]: false
                }
            }));
        });

        socket.on("score.foul:add", (data) => {
            if (data.type === "minor") {
                setMinorFoulCount(prev => ({...prev, [data.alliance]: prev[data.alliance] + data.count}));
            } else if (data.type === "major") {
                setMajorFoulCount(prev => ({...prev, [data.alliance]: prev[data.alliance] + data.count}));
            } else if (data.type === "adjustment") {
                setAdjustmentFoulCount(prev => ({...prev, [data.alliance]: prev[data.alliance] + data.count}));
            }
        });
        socket.on("score.foul:remove", (data) => {
            if (data.type === "minor") {
                setMinorFoulCount(prev => ({...prev, [data.alliance]: Math.max(0, prev[data.alliance] - data.count)}));
            } else if (data.type === "major") {
                setMajorFoulCount(prev => ({...prev, [data.alliance]: Math.max(0, prev[data.alliance] - data.count)}));
            } else if (data.type === "adjustment") {
                setAdjustmentFoulCount(prev => ({...prev, [data.alliance]: Math.max(0, prev[data.alliance] - data.count)}));
            }
        });

        return () => {
            socket.off();
        };
    }, []);

    function renderAllianceSection(alliance: Alliance) {
        return (
            <div key={alliance} className="alliance_container" style={{
                border: "2px solid " + (alliance === "red" ? "red" : "blue"),
            }}>
                <h2 style={{color: alliance === "red" ? "red" : "blue"}}>{alliance.toUpperCase()} ALLIANCE</h2>
                <div className="container_row" style={{height: "8rem"}}>
                    <div className="container_col">
                        <h3>🤖 AUTONOMOUS</h3>
                        <table>
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Leave?</th>
                            </tr>
                            </thead>
                            <tbody>
                            {([3, 2, 1] as const).map((robot) => (<tr key={robot}>
                                <th>{robot}</th>
                                <td>
                                    <span>{autoLeaveDropdowns[alliance][robot]}</span>
                                </td>
                            </tr>))}
                            </tbody>
                        </table>
                    </div>
                    <div className="hr_vert" />
                    <div className="container_col">
                        <h3>⌛ ENDGAME</h3>
                        <table>
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Position</th>
                            </tr>
                            </thead>
                            <tbody>
                            {([3, 2, 1] as const).map((robot) => (<tr key={robot}>
                                <th>{robot}</th>
                                <td>
                                    <span>{endgameDropdowns[alliance][robot]}</span>
                                </td>
                            </tr>))}
                            </tbody>
                        </table>
                    </div>
                    <div className="hr_vert" />
                    <div className="container_col">
                        <h3>🚩 FOULS</h3>
                        <table>
                            <thead>
                            <tr>
                                <th>Foul</th>
                                <th>Count</th>
                            </tr>
                            </thead>
                            <tbody>{FOULS.map((foul) => (
                                <tr key={foul}>
                                    <td>{foul}</td>
                                    <td>
                                        {foul === "Minor"
                                            ? minorFoulCount[alliance]
                                            : foul === "Major"
                                                ? majorFoulCount[alliance]
                                                : adjustmentFoulCount[alliance]}
                                    </td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                </div>
                <div className="container_row">
                    <div className="container_col">
                        <table>
                            <thead>
                            <tr style={{fontSize: "1.25rem"}}>
                                <th>L1</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr style={{fontSize: "1.5rem"}}>
                                <td>
                                    <p>🤖 {throughCountAuto[alliance]}</p>
                                    <p>🎮 {throughCountTeleop[alliance]}</p>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="container_col">
                        <table className="reef-table">
                            <thead>
                            <tr>
                                <th>Branch</th>
                                {BRANCHES.map((branch) => (
                                    <th key={branch}>{branch.toUpperCase()}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {LEVELS.map((level) => (
                                <tr key={level}>
                                    <td>{level.toUpperCase()}</td>
                                    {BRANCHES.map((branch) => (
                                        <td key={`${level}-${branch}`}>
                                            <div className="reef-grid-cell">
                                                {reefCheckboxes[alliance][`${level}-${branch}-true`] ? "🤖" : ""}
                                                {reefCheckboxes[alliance][`${level}-${branch}-false`] ? "🪸" : ""}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="container_col">
                        <table>
                            <thead>
                            <tr style={{fontSize: "1.25rem"}}>
                                <th>Net</th>
                                <th>Processor</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr style={{fontSize: "1.5rem"}}>
                                <td>
                                    <p>🤖 {netCountAuto[alliance]}</p>
                                    <p>🎮 {netCountTeleop[alliance]}</p>
                                </td>
                                <td>
                                    <p>🤖 {processorCountAuto[alliance]}</p>
                                    <p>🎮 {processorCountTelop[alliance]}</p>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <StatusBar status={connected ? "Connected 🟢" : "Disconnected 🔴"} matchStatus={matchStatus} />
            <div style={{display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem"}}>
                <button onClick={handleMatchStart}>Start Match</button>
                <button onClick={handleMatchEnd}>End Match</button>
                <button onClick={handleMatchReset}>Reset Match</button>
            </div>
            <div className="core_container">
                {["blue", "red"].map(a => renderAllianceSection(a as "red" | "blue"))}
            </div>
            <div className="copyright">
                <p>© Developed by Jerry Fu 2025-{new Date().getFullYear()}</p>
            </div>
        </div>
    );
}