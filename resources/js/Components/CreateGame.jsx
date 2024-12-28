import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { Inertia } from '@inertiajs/inertia'

// Set default Axios configuration
axios.defaults.baseURL = '/'; // Replace with your API base URL
// axios.defaults.withCredentials = true; // Enable cookies if needed

export const CreateGame = () => {

  const [gameName, setGameName] = useState('');
  const [gameType, setGameType] = useState('novus');
  const [novusType, setNovusType] = useState('hybrid-tournament');
  const [gameDescription, setGameDescription] = useState('');
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { tournament, isAdmin } = usePage().props;

  const handleSubmit = async (e) => {
    e.preventDefault();

  try {


    // Include user.name in the formData
    const formData = {
      name: gameName,
      type: gameType,
      description: gameDescription || null,
      novus_type: gameType === 'novus' ? novusType : null,
      // user: user.name,
    };

    // Send the updated formData with Axios
    const response = await axios.post('/tournament', formData);

    console.log('Game created:', response.data);
    // console.log('Created by:', user.name);

    setIsFormSubmitted(true);
    Inertia.visit('/tournaments')
  } catch (error) {
      if (error.response && error.response.data.errors) {
        setErrorMessage('Validation failed: ' + Object.values(error.response.data.errors).join(', '));
      } else {
        setErrorMessage('An error occurred while creating the game.');
      }
  }
  };

  return (
    <div>
      <h1>Создание игры</h1>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      {!isFormSubmitted ? (
        <form onSubmit={handleSubmit}>

          <div>
            <label>
              Название игры:
              <input
                type="text"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder="Введите название игры"
                required
              />
            </label>
          </div>

          <div>
            <label>
              Выберите тип игры:
              <select
                value={gameType}
                onChange={(e) => setGameType(e.target.value)}
                required
              >
                <option value="novus">Новус</option>
                <option value="chess">Шахматы</option>
                <option value="cards">Карты</option>
              </select>
            </label>
          </div>

          {gameType === 'novus' && (
            <div>
              <label>
                Select type of the game:
                <select
                  value={novusType}
                  onChange={(e) => setNovusType(e.target.value)}
                  required
                >
                  <option value="hybrid-tournament">Hybrid Tournament</option>
                  <option value="with-bye-round">Tournament with "Bye round"</option>
                </select>
              </label>
            </div>
          )}

          <div>
            <label>
              Описание игры:
              <textarea
                value={gameDescription}
                onChange={(e) => setGameDescription(e.target.value)}
                placeholder="Введите описание игры"

              />
            </label>
          </div>

          <button type="submit">Создать игру</button>
        </form>
      ) : (
        <div>
          <h2>Игра успешно создана!</h2>
          <p><strong>Название игры:</strong> {gameName}</p>
          <p><strong>Тип игры:</strong> {gameType}</p>
          {gameType === 'novus' && <p><strong>Type of novus:</strong> {novusType}</p>}
          <p><strong>Описание:</strong> {gameDescription}</p>
        </div>
      )}
    </div>
  );
};