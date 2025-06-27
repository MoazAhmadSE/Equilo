// components/partials/SharePreview.js
import React from "react";

const SharePreview = ({ shares = [] }) => {
    return (
        <div className="shares-preview">
            <label>Calculated Shares</label>
            <ul>
                {shares.map((s) => (
                    <li key={s.id}>
                        {s.name}: {s.finalAmount?.toFixed(2)}{" "}
                        {s.note && <em>({s.note})</em>}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SharePreview;
