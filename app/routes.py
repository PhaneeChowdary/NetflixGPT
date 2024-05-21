from flask import Blueprint, request, jsonify
import openai
import logging
import requests
import os
import json

main = Blueprint('main', __name__)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure your OpenAI, OMDB, and TMDb API keys
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
OMDB_API_KEY = os.getenv('OMDB_API_KEY')
TMDB_API_KEY = os.getenv('TMDB_API_KEY')

openai.api_key = OPENAI_API_KEY

@main.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message')
    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that provides structured and formatted movie recommendations if asked for or else the exact movie details."},
                {"role": "user", "content": f"Provide a structured list of the movies. Include the title, year, and a brief description for each movie. Format the response strictly as a JSON array with objects containing 'title', 'year', and 'description' keys, without any additional text."}
            ]
        )
        gpt_response = response.choices[0].message['content'].strip()
        logger.info(f"Raw GPT-4 response: {gpt_response}")
    
        # Ensure the response is valid JSON
        try:
            gpt_response_json = json.loads(gpt_response)
        except json.JSONDecodeError as e:
            logger.error(f"JSON decoding error: {str(e)}")
            return jsonify({"error": "Received invalid JSON from GPT-4 Turbo."}), 500

    except Exception as e:
        logger.error(f"Error in OpenAI API call: {str(e)}")
        return jsonify({"error": str(e)}), 500

    logger.info(f"GPT-4-turbo response: {gpt_response}")
    return jsonify(gpt_response_json)


@main.route('/movies', methods=['GET'])
def movies():
    query = request.args.get('query')
    if not query:
        return jsonify({"error": "No query provided"}), 400

    try:
        response = requests.get(f'http://www.omdbapi.com/?apikey={OMDB_API_KEY}&s={query}')
        response.raise_for_status()
        movies = response.json().get('Search', [])
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"movies": movies})

@main.route('/movie', methods=['GET'])
def movie_details():
    imdb_id = request.args.get('imdb_id')
    if not imdb_id:
        return jsonify({"error": "No IMDB ID provided"}), 400

    try:
        omdb_response = requests.get(f'http://www.omdbapi.com/?apikey={OMDB_API_KEY}&i={imdb_id}')
        omdb_response.raise_for_status()
        movie_details = omdb_response.json()

        # Fetch TMDb ID using the OMDB title and release year
        tmdb_search_response = requests.get(f'https://api.themoviedb.org/3/search/movie?api_key={TMDB_API_KEY}&query={movie_details["Title"]}&year={movie_details["Year"]}')
        tmdb_search_response.raise_for_status()
        tmdb_results = tmdb_search_response.json().get('results', [])
        tmdb_id = tmdb_results[0]['id'] if tmdb_results else None

        movie_details['tmdb_id'] = tmdb_id
        movie_details['Poster'] = movie_details.get('Poster', 'N/A')
        movie_details['imdbRating'] = movie_details.get('imdbRating', 'N/A')
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"movie": movie_details})

@main.route('/recommendations', methods=['GET'])
def recommendations():
    tmdb_id = request.args.get('tmdb_id')
    if not tmdb_id:
        return jsonify({"error": "No TMDb ID provided"}), 400

    try:
        response = requests.get(f'https://api.themoviedb.org/3/movie/{tmdb_id}/recommendations?api_key={TMDB_API_KEY}')
        response.raise_for_status()
        recommendations = response.json().get('results', [])
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"recommendations": recommendations})
