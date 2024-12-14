import React, { useState } from 'react';

export const CreateGame = () => {
  // Состояния для формы
  const [gameName, setGameName] = useState('');
  const [gameType, setGameType] = useState('novus'); // начальный тип игры
  const [gameDescription, setGameDescription] = useState('');
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  // Обработчик отправки формы
  const handleSubmit = (e) => {
    e.preventDefault();

    // Здесь можно отправить данные на сервер, если нужно
    setIsFormSubmitted(true);
  };

  return (
    <div>
      <h1>Создание игры</h1>
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

          <div>
            <label>
              Описание игры:
              <textarea
                value={gameDescription}
                onChange={(e) => setGameDescription(e.target.value)}
                placeholder="Введите описание игры"
                required
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
          <p><strong>Описание:</strong> {gameDescription}</p>
        </div>
      )}
    </div>
  );
};
