import React from "react";
import Chat from "./components/Chat";
import MovieList from "./components/MovieList";
import "./App.css";

function App() {
    return (
        <div className="App">
            <h1>Netflix-GPT</h1>
            <Chat />
            <MovieList />
        </div>
    );
}

export default App;
