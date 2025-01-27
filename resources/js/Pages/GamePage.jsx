// Импорт необходимых библиотек и компонентов
import React, { useState, useEffect } from 'react'; // Библиотека React, хуки useState и useEffect
import axios from 'axios'; // Библиотека для HTTP-запросов
import { Bracket, Seed, SeedItem, SeedTeam } from 'react-brackets'; // Компоненты для отображения турнирной сетки
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'; // Шаблон для авторизованных пользователей
import '../../css/new.css'; // Стили для страницы

// Основной компонент страницы игры
const GamePage = ({ tournament }) => {
  // Состояние для данных турнирной сетки
  const [bracketData, setBracketData] = useState(tournament.bracketData || []);
  const isAdmin = tournament.user_id === tournament.admin_id; // Проверка, является ли пользователь администратором

  // Эффект для генерации данных турнирной сетки, если она отсутствует
  useEffect(() => {
    if (!bracketData.length) generateInitialBracketData();
  }, [tournament, bracketData]);

  // Функция для генерации начальных данных турнирной сетки
  const generateInitialBracketData = () => {
    const participants = tournament.participants || []; // Участники турнира
    const teams = participants.map((participant, index) => ({
      id: index + 1,
      name: participant.name,
    }));

    // Вычисляем общее количество слотов для первой стадии (степень двойки)
    const totalSlots = Math.pow(2, Math.ceil(Math.log2(teams.length)));
    const paddedTeams = [...teams, ...Array(totalSlots - teams.length).fill(null)]; // Дополняем участниками "Bye"

    const rounds = Math.log2(totalSlots); // Количество стадий турнира
    const seeds = Array.from({ length: rounds }, (_, roundIndex) => ({
      round: roundIndex + 1,
      matches: [],
    }));

    // Заполняем первую стадию матчами
    for (let i = 0; i < paddedTeams.length; i += 2) {
      const match = {
        id: i / 2 + 1,
        participant1: paddedTeams[i],
        participant2: paddedTeams[i + 1],
        winner: null,
      };

      if (!match.participant2) {
        match.winner = match.participant1?.id; // Победа по умолчанию для "Bye"
        match.participant2 = { id: 0, name: 'Bye' }; // Назначаем виртуального участника
      }

      seeds[0].matches.push(match);
    }

    // Генерация последующих стадий
    for (let roundIndex = 1; roundIndex < rounds; roundIndex++) {
      const previousRound = seeds[roundIndex - 1];
      const currentRound = seeds[roundIndex];

      for (let i = 0; i < previousRound.matches.length; i += 2) {
        const match = {
          id: i / 2 + 1,
          participant1: null,
          participant2: null,
          winner: null,
        };

        const match1 = previousRound.matches[i];
        const match2 = previousRound.matches[i + 1];

        // Назначаем участников из победителей предыдущей стадии
        match.participant1 = match1?.winner ? match1.participant1 : { id: 0, name: '-' };
        match.participant2 = match2?.winner ? match2.participant1 : { id: 0, name: '-' };

        currentRound.matches.push(match);
      }
    }

    setBracketData(seeds); // Устанавливаем данные турнирной сетки
  };

  // Функция для обновления турнирной сетки на сервере
  const handleUpdateBracket = async (updatedData) => {
    try {
      const { status } = await axios.post(`/game/${tournament.id}/update-bracket`, { bracketData: updatedData });
      if (status === 200) {
        setBracketData(updatedData);
        alert('Bracket updated successfully!');
      } else {
        console.error('Unexpected server response:', status);
        alert('Failed to update the bracket. Please try again.');
      }
    } catch (error) {
      console.error('Error updating bracket:', error);
      alert('Failed to update the bracket. Please check the console for more details.');
    }
  };

  // Функция для выбора победителя в конкретном матче
  const handleSelectWinner = async (roundIndex, matchIndex, winnerId) => {
    const updatedBracket = structuredClone(bracketData); // Клонируем текущую сетку
    const match = updatedBracket[roundIndex]?.matches[matchIndex];
    if (!match || match.winner) return;

    match.winner = winnerId;

    try {
      // Обновляем победителя на сервере
      const { status } = await axios.post(`/game/${tournament.id}/update-winner`, {
        matchId: match.id,
        winnerId,
      });

      if (status === 200) {
        setBracketData(updatedBracket);
        alert('Winner updated successfully!');
      } else {
        console.error('Unexpected server response:', status);
        alert('Failed to update winner. Please try again.');
      }
    } catch (error) {
      console.error('Error updating winner:', error);
      alert('Failed to update winner. Please check the console for more details.');
    }

    // Обновляем следующую стадию (если нужно)
    if (roundIndex + 1 < updatedBracket.length) {
      const nextRound = updatedBracket[roundIndex + 1];
      const nextMatchIndex = Math.floor(matchIndex / 2);

      if (!nextRound.matches[nextMatchIndex]) {
        nextRound.matches[nextMatchIndex] = { participant1: null, participant2: null, winner: null };
      }

      const nextMatch = nextRound.matches[nextMatchIndex];
      if (matchIndex % 2 === 0) {
        nextMatch.participant1 = match.participant1?.id === winnerId ? match.participant1 : match.participant2;
      } else {
        nextMatch.participant2 = match.participant1?.id === winnerId ? match.participant1 : match.participant2;
      }

      if (!nextMatch.participant2) nextMatch.winner = nextMatch.participant1?.id;
    }

    handleUpdateBracket(updatedBracket); // Сохраняем обновленную сетку
  };

  // Компонент карточки матча
  const MatchCard = ({ roundIndex, match, matchIndex }) => (
    <div className="border border-gray-300 rounded-lg p-4 mb-4 bg-white shadow">
      <p className="text-lg font-medium">
        {match.participant1?.name || <span className="text-gray-500">Bye</span>} vs{' '}
        {match.participant2?.name || <span className="text-gray-500">Bye</span>}
      </p>
      {match.winner && (
        <p className="text-green-600 font-semibold mt-2">
          Winner: {match.winner === match.participant1?.id ? match.participant1?.name : match.participant2?.name}
        </p>
      )}
      {isAdmin && !match.winner && match.participant1 && match.participant2 && (
        <AdminControls
          roundIndex={roundIndex}
          matchIndex={matchIndex}
          participant1={match.participant1}
          participant2={match.participant2}
        />
      )}
    </div>
  );

  // Компонент кнопок администратора
  const AdminControls = ({ roundIndex, matchIndex, participant1, participant2 }) => (
    <div className="flex gap-4 mt-4">
      <button
        onClick={() => handleSelectWinner(roundIndex, matchIndex, participant1?.id)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        {participant1?.name}
      </button>
      <button
        onClick={() => handleSelectWinner(roundIndex, matchIndex, participant2?.id)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        {participant2?.name}
      </button>
    </div>
  );

  // Возвращаем структуру страницы
  return (
    <AuthenticatedLayout>
      <div className="game-page p-8 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-center">{tournament.name} - Bracket</h1>
        {bracketData.length > 0 ? (
          <Bracket
            rounds={bracketData.map((round, roundIndex) => ({
              title: `Round ${round.round}`,
              seeds: round.matches.map((match) => ({
                id: match.id,
                teams: [
                  { name: match.participant1?.name || '-' },
                  { name: match.participant2?.name || '-' },
                ],
              })),
            }))}
            renderSeedComponent={({ seed }) => (
              <Seed>
                <SeedItem>
                  <SeedTeam className="text-center text-white-800">{seed.teams[0]?.name || '-'}</SeedTeam>
                  <SeedTeam className="text-center text-white-800">{seed.teams[1]?.name || '-'}</SeedTeam>
                </SeedItem>
              </Seed>
            )}
          />
        ) : (
          <p className="text-center text-gray-600">No bracket data available.</p>
        )}

        {isAdmin && bracketData.length > 0 && (
          <div className="admin-bracket mt-8">
            {bracketData.map((round, roundIndex) => (
              <div key={roundIndex} className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Round {round.round}</h2>
                {round.matches.map((match, matchIndex) => (
                  <MatchCard
                    key={matchIndex}
                    roundIndex={roundIndex}
                    match={match}
                    matchIndex={matchIndex}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

// Экспортируем компонент
export default GamePage;
