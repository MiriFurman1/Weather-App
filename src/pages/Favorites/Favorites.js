import React, { useEffect, useState } from 'react'
import axios from 'axios';
import Card from '@mui/material/Card';
import Header from '../../components/Header/Header.js';
import useFavoritesStore from '../../app/favoritesStore.js';
import './favorites.css'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Favorites() {
    const favorites = useFavoritesStore(state => state.favorites);
    const [favoriteWeathers, setFavoriteWeathers] = useState([]);
    const setSelectedCity = useFavoritesStore((state) => state.setSelectedCity);
    const navigate = useNavigate();
    const [apiLimitReached, setApiLimitReached] = useState(false);

    const handleCardClick = (cityKey, cityName) => {
        setSelectedCity({ cityKey: cityKey, cityName: cityName });
        navigate('/')
    };


    useEffect(() => {
        const getWeatherForFavorites = async () => {
            try {
                const promises = favorites.map(async (favorite) => {
                    const currentWeatherResponse = await axios.get(
                        `http://dataservice.accuweather.com/currentconditions/v1/${favorite.key}?apikey=${process.env.REACT_APP_API_KEY}`
                    );
                    return currentWeatherResponse.data;
                });

                const favoriteWeatherData = await Promise.all(promises);
                setFavoriteWeathers(favoriteWeatherData);
                console.log(favoriteWeatherData);
                localStorage.setItem('favoriteWeathers', JSON.stringify(favoriteWeatherData));
            } catch (error) {
                toast(error.message);
        }
        };

        getWeatherForFavorites();
    }, [favorites]);

    return (
        <div>
            <Header />
            <div className="container">
                <h1>Favorites</h1>
                {favorites.length === 0 && <h2>No favorites found yet</h2>}
                {apiLimitReached && <p>API request limit reached for today.</p>}
            </div>



                <div className='favorites-cards'>

                    {favorites && favorites.map((favorite, index) => (
                        <Card className="card favoriteCard" key={index}
                            onClick={() => handleCardClick(favorite.key, favorite.name)}>
                            <h3>{favorite.name}</h3>
                            {favoriteWeathers[index] && (
                                <>
                                    <p>{favoriteWeathers[index][0].Temperature.Metric.Value}{favoriteWeathers[index][0].Temperature.Metric.Unit}</p>
                                    <p>{favoriteWeathers[index][0].WeatherText}</p>
                                    <img src={`/weather icons/${favoriteWeathers[index][0].WeatherIcon}-s.png`} alt='day-icon'></img>
                                </>
                            )}
                        </Card>
                    ))}
                </div>


            </div>
    )
}

export default Favorites