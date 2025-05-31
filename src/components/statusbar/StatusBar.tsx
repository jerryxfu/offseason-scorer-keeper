import React from "react";
import "./StatusBar.scss";

export default function StatusBar({status, matchStatus}: { status: string, matchStatus: string }) {
    return (
        <nav className="statusbar" style={{backgroundColor: status.toLowerCase().startsWith("connected") ? "#4caf50" : "#f44336"}}>
            <img src="/rfq_logo_vertical.png" alt="website icon" style={{height: "100%", marginRight: "1rem"}} />
            <h1>SCOREKEEPER</h1>
            <ul className="statusbar_elements">
                <li className="statusbar_element">Client status: {status}</li>
                |
                <li className="statusbar_elements">Match status: {matchStatus}</li>
            </ul>
        </nav>
    );
};
