import { TournamentGrid } from "./TournamentGrid";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import cn from 'classnames';


export const StatsTable = ({ participants, stats, rounds, selectedMatch, setSelectedMatch, handleMatchWin }) => {
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

                const wlDiff = Number(matchWins) - Number(matchLosses);

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
      <TournamentGrid rounds={rounds} setSelectedMatch={setSelectedMatch} handleMatchWin={handleMatchWin} />

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
  )
}