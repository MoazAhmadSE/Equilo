// components/partials/SettlementPreview.js
import React from "react";

const SettlementPreview = ({ settlement = [], members = [] }) => {
    const getName = (id) => members.find((m) => m.id === id)?.name || id;

    return (
        <div className="settlement-preview">
            <label>Settlement Plan</label>
            <ul>
                {settlement.map((s, i) => (
                    <li key={i}>
                        <strong>{getName(s.from)}</strong> pays{" "}
                        <strong>{getName(s.to)}</strong>: {s.amount?.toFixed(2)}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SettlementPreview;
