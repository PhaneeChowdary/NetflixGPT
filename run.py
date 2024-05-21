from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)

# curl http://127.0.0.1:5000/movies?query=Inception
# curl http://127.0.0.1:5000/movie?imdb_id=tt1375666