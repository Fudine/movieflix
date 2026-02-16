import {useEffect, useState} from 'react';
import Search from './components/search';
import Spinner from './components/loading';
import MovieCard from './MovieCard';
import { useDebounce } from 'react-use';


const API_BASE_URL = "https://api.themoviedb.org/3"; 
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
    }
}

const App = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [moviesList, setMoviesList] = useState([]);
    const[isLoading, setIsLoading] = useState(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    // Debounce the search term to avoid excessive API calls
    // This will update the debouncedSearchTerm 500ms after the user stops typing
    useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

    const fetchMovies = async (query = '') => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const endpoint = query
            ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
            : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

            const response = await fetch(endpoint, API_OPTIONS);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if(data.response === "False") {
                setErrorMessage(data.error || "No movies found.");
                setMoviesList([]);
                return;
            }
            setMoviesList(data.results || []);

        } catch (error) {
            console.error("Error fetching movies:", error);
            setErrorMessage("Failed to fetch movies. Please try again later.");
        } finally {
            setIsLoading(false);
        }

    };

    useEffect(() => {
        fetchMovies(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    return (
        <main>
            <div className='pattern'/>

            <div className='wrapper'>
                <header>
                    <img src="./hero.png" alt="Hero-Banner" />
                    <h1>Find <span className='text-gradient'>Movies</span> you'll enjoy</h1>
                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </header>

                <section className='all-movies'>
                    <h2 className='mt-[40px]'>All Movies</h2>

                    {isLoading ? (
                        <Spinner />
                    ): errorMessage ? (
                        <p className='text-red-500'>{errorMessage}</p>
                    ) : (
                        <ul>
                            {moviesList.map((movie) => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </ul>
                    )}
                </section>

            </div>
        </main>
    )
}


export default App;
