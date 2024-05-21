import React, { useState } from "react";
import axios from "axios";
import "./MovieDetails.css";

function MovieDetails({ movie }) {
    const [details, setDetails] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [showDetails, setShowDetails] = useState(false);

    const fetchDetails = async () => {
        try {
            const res = await axios.get(
                `http://127.0.0.1:5000/movie?imdb_id=${movie.imdbID}`
            );
            setDetails(res.data.movie);
            fetchRecommendations(res.data.movie.tmdb_id); // Assuming you map OMDB ID to TMDb ID
        } catch (error) {
            console.error("Error fetching movie details:", error);
        }
    };

    const fetchRecommendations = async (tmdbId) => {
        try {
            const res = await axios.get(
                `http://127.0.0.1:5000/recommendations?tmdb_id=${tmdbId}`
            );
            setRecommendations(res.data.recommendations);
        } catch (error) {
            console.error("Error fetching recommendations:", error);
        }
    };

    const toggleDetails = () => {
        if (!showDetails) {
            fetchDetails();
        }
        setShowDetails(!showDetails);
    };

    return (
        <div className="movie-card">
            <img
                src={movie.Poster}
                alt={`${movie.Title} Poster`}
                className="movie-poster"
            />
            <h3>{movie.Title}</h3>
            <button onClick={toggleDetails}>
                {showDetails ? "Hide Details" : "View Details"}
            </button>
            {showDetails && details && (
                <div>
                    <p>
                        <strong>Plot:</strong> {details.Plot}
                    </p>
                    <p>
                        <strong>Director:</strong> {details.Director}
                    </p>
                    <p>
                        <strong>Actors:</strong> {details.Actors}
                    </p>
                    <p>
                        <strong>IMDB Rating:</strong> {details.imdbRating}
                    </p>
                    <div className="recommendations">
                        <h4>Recommendations</h4>
                        <ul>
                            {recommendations.map((rec) => (
                                <li key={rec.id}>{rec.title}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MovieDetails;
