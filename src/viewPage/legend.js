import React from 'react'

export default function Legend({ numRespondents }) {

    return (
        <div>
            <h3>Legend</h3>
            <div className = "gradient-container">
                <span className = "gradient-text">0</span>
                <div className="gradient"></div>
                <span className = "gradient-text">{numRespondents}</span>
            </div>
        </div>
    )
}