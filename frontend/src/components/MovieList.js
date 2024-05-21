import React, { useState } from "react";
import axios from "axios";
import MovieDetails from "./MovieDetails";
import "./MovieList.css";

function MovieList() {
    const [query, setQuery] = useState("");
    const [movies, setMovies] = useState([]);
    const [error, setError] = useState(null);

    const searchMovies = async () => {
        try {
            const res = await axios.get(
                `http://127.0.0.1:5000/movies?query=${query}`
            );
            setMovies(res.data.movies);
            setError(null);
        } catch (error) {
            setError("Error fetching movies");
            console.error("Error fetching movies:", error);
        }
    };

    return (
        <div className="movie-list">
            <h2>Search Movies</h2>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a movie..."
            />
            <button onClick={searchMovies}>Search</button>
            {error && <p>{error}</p>}
            <div className="movie-grid">
                {movies.length > 0 ? (
                    movies.map((movie) => (
                        <MovieDetails key={movie.imdbID} movie={movie} />
                    ))
                ) : (
                    <p>No movies found</p>
                )}
            </div>
        </div>
    );
}

export default MovieList;
