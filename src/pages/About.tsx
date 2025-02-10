import React from "react";

export default function About() {
    return (
        <div className="page-container">
            <h1>About Page</h1>
            <p>This is the about page description</p>
            <p>Built with React {React.version}</p>
        </div>
    );
}