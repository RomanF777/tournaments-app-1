import "../../css/new.css"
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import cn from 'classnames';

// Анимационные константы
const matchAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const initialStats = (participants) =>
  participants.reduce((acc, p) => ({
    ...acc,
    [p.id]: {
      seriesWins: 0,
      seriesLosses: 0,
      matchWins: 0,
      matchLosses: 0,
      status: 'active' // Все игроки начинают как активные
    }
  }), {});

const GamePage = ({ tournament }) => {
  const participants = tournament?.participants || [];
  const [rounds, setRounds] = useState([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [stats, setStats] = useState(() => initialStats(participants));
  const [history, setHistory] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Генерация начальной сетки
  useEffect(() => {
    if (participants.length > 0) {
      const initialMatches = generateMatches(participants, 0);
      setRounds([initialMatches]);
      setCurrentRound(0);
    }
  }, [participants]);

  // Логика формирования следующих раундов
  useEffect(() => {
    if (rounds.length === 0) return;

    const currentMatches = rounds[currentRound];
    const allCompleted = currentMatches.every(m => m.seriesWinner);

    if (allCompleted && currentRound === rounds.length - 1) {
      const winners = currentMatches
        .map(m => participants.find(p => p.id === m.seriesWinner))
        .filter(Boolean);

      if (winners.length >= 2) {
        const nextRoundMatches = generateMatches(winners, currentRound + 1);
        setRounds(prev => [...prev, nextRoundMatches]);
        setCurrentRound(prev => prev + 1);
      }
    }
  }, [rounds, currentRound, participants]);

  function generateMatches(participants, round) {
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const matches = [];

    for (let i = 0; i < shuffled.length; i += 2) {
      const match = {
        round,
        id: `${round}-${matches.length}`,
        player1: shuffled[i],
        player2: shuffled[i + 1] || null,
        series: [],
        seriesWinner: null
      };

      if (!match.player2) {
        match.seriesWinner = match.player1.id;
      }

      matches.push(match);
    }

    return matches;
  }

const handleMatchWin = (roundIndex, matchIndex, winnerId) => {
  const updatedRounds = [...rounds];
  const match = updatedRounds[roundIndex][matchIndex];

  // Обновляем историю
  setHistory(prev => [...prev, {
    matchId: match.id,
    winner: winnerId,
    timestamp: new Date().toISOString()
  }]);

  const loserId = winnerId === match.player1?.id
    ? match.player2?.id
    : match.player1?.id;

  // Проверка завершения серии
  const series = [...match.series, winnerId];
  const wins1 = series.filter(id => id === match.player1?.id).length;
  const wins2 = series.filter(id => match.player2 && id === match.player2.id).length;

  // Определяем необходимое количество побед для серии
  const requiredWins = (Math.max(wins1, wins2) >= 2 && Math.abs(wins1 - wins2) >= 2)
    ? 2
    : 3;

  // Если серия завершена
  if (wins1 >= requiredWins || wins2 >= requiredWins) {
    match.seriesWinner = winnerId;

    // Обновляем статусы ТОЛЬКО при завершении серии
    setStats(prev => ({
      ...prev,
      [winnerId]: {
        ...prev[winnerId],
        seriesWins: prev[winnerId].seriesWins + 1,
        matchWins: prev[winnerId].matchWins + wins1,
        status: 'qualified' // Устанавливаем статус сразу при победе в серии
      },
      ...(loserId && {
        [loserId]: {
          ...prev[loserId],
          seriesLosses: prev[loserId].seriesLosses + 1,
          matchLosses: prev[loserId].matchLosses + wins2,
          status: 'eliminated' // Помечаем проигравшего
        }
      })
    }));
  } else {
    // Если серия продолжается, обновляем только счет матчей
    setStats(prev => ({
      ...prev,
      [winnerId]: {
        ...prev[winnerId],
        matchWins: prev[winnerId].matchWins + 1
      },
      ...(loserId && {
        [loserId]: {
          ...prev[loserId],
          matchLosses: prev[loserId].matchLosses + 1
        }
      })
    }));
  }

  match.series = series;
  setRounds(updatedRounds);
};

  return (
    <AuthenticatedLayout>
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* Статистика участников */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8 bg-white rounded-lg shadow"
      >
        {/* ... (ваша существующая таблица статистики) ... */}
      </motion.div>

      {/* // Добавляем в компонент GamePage перед турнирной сеткой */}

        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 bg-white rounded-lg shadow overflow-hidden"
        >
        <table className="w-full">
            <thead className="bg-gray-50">
            <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Игрок</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Матчи</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Победы</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Победы %</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Серии W</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Разница W/L</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Статус</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
            {participants
                .sort((a, b) => {
                const statsA = stats[a.id];
                const statsB = stats[b.id];
                // Сортировка по количеству побед в сериях
                if (statsA.seriesWins !== statsB.seriesWins) {
                    return statsB.seriesWins - statsA.seriesWins;
                }
                // Затем по проценту побед
                const aPercent = statsA.seriesWins / (statsA.seriesWins + statsA.seriesLosses) || 0;
                const bPercent = statsB.seriesWins / (statsB.seriesWins + statsB.seriesLosses) || 0;
                return bPercent - aPercent;
                })
                .map((participant) => {
                const {
                    seriesWins,
                    seriesLosses,
                    matchWins,
                    matchLosses,
                    status
                } = stats[participant.id];

                const totalSeries = seriesWins + seriesLosses;
                const winPercentage = totalSeries > 0
                    ? ((seriesWins / totalSeries) * 100).toFixed(1)
                    : 0;
                const wlDiff = matchWins - matchLosses;

                return (
                    <motion.tr
                    key={participant.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                        'hover:bg-gray-50',
                        status === 'qualified' && 'bg-green-50',
                        status === 'eliminated' && 'bg-red-50'
                    )}
                    >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {participant.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-500">
                        {totalSeries}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-500">
                        <span className="font-semibold text-green-600">
                        {seriesWins}
                        </span>
                        <span className="mx-1">/</span>
                        <span className="text-red-600">{seriesLosses}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-500">
                        {totalSeries > 0 ? `${winPercentage}%` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-500">
                        {matchWins}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-500">
                        <span className={cn(
                        'font-semibold',
                        wlDiff > 0 ? 'text-green-600' : 'text-red-600'
                        )}>
                        {wlDiff >= 0 ? `+${wlDiff}` : wlDiff}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                        {status === 'qualified' && (
                        <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                            Прошел
                        </span>
                        )}
                        {status === 'eliminated' && (
                        <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
                            Выбыл
                        </span>
                        )}
                        {status === 'active' && (
                            <span className="px-2 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full">
                            Активный
                            </span>
                        )}
                    </td>

                    </motion.tr>
                );
                })}
            </tbody>
        </table>
        </motion.div>

      {/* Турнирная сетка */}
      <div className="tournament-grid">
        {rounds.map((roundMatches, roundIndex) => (
          <div key={roundIndex} className="round-column">
            <h3 className="text-xl font-bold mb-4">Раунд {roundIndex + 1}</h3>
            <AnimatePresence>
              {roundMatches.map((match, matchIndex) => (
                <motion.div
                  key={match.id}
                  variants={matchAnimation}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="match-card"
                  onClick={() => setSelectedMatch(match)}
                >
                  <div className="players">
                    <div className={`player ${match.seriesWinner === match.player1?.id ? 'winner' : ''}`}>
                      {match.player1?.name || 'Bye'}
                    </div>
                    <div className="vs">vs</div>
                    <div className={`player ${match.seriesWinner === match.player2?.id ? 'winner' : ''}`}>
                      {match.player2?.name || 'Bye'}
                    </div>
                  </div>

                  <div className="series-score">
                    {match.series.map((game, idx) => (
                      <div
                        key={idx}
                        className={`game-dot ${game === match.player1?.id ? 'blue' : 'red'}`}
                      />
                    ))}
                  </div>

                  {!match.seriesWinner && (
                    <div className="controls">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMatchWin(roundIndex, matchIndex, match.player1.id);
                        }}
                        className="win-button blue"
                      >
                        Win {match.player1?.name}
                      </button>
                      {match.player2 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMatchWin(roundIndex, matchIndex, match.player2.id);
                          }}
                          className="win-button red"
                        >
                          Win {match.player2?.name}
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Модалка истории матча */}
      <AnimatePresence>
        {selectedMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="match-history-modal"
            onClick={() => setSelectedMatch(null)}
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <h3>История матча</h3>
              <div className="timeline">
                {selectedMatch.series.map((game, idx) => (
                  <div key={idx} className="timeline-event">
                    <div className="event-time">Game {idx + 1}</div>
                    <div className="event-winner">
                      Winner: {participants.find(p => p.id === game)?.name}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </AuthenticatedLayout>
  );
};

export default GamePage;
