import "../../css/new.css"
import { useState, useEffect } from 'react';
import { StatsTable } from '@/Components/StatsTable';

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

  // Update history
  setHistory(prev => [...prev, {
    matchId: match.id,
    winner: winnerId,
    timestamp: new Date().toISOString()
  }]);

  const loserId = winnerId === match.player1?.id ? match.player2?.id : match.player1?.id;

  // Update series with the new game
  const series = [...match.series, winnerId];
  const wins1 = series.filter(id => id === match.player1?.id).length;
  const wins2 = series.filter(id => id === match.player2?.id).length;

  const requiredWins = 2; // Best-of-3 format
  let seriesWinner = null;

  // Check if series is completed
  if (wins1 >= requiredWins || wins2 >= requiredWins) {
    seriesWinner = wins1 > wins2 ? match.player1?.id : match.player2?.id;
    match.seriesWinner = seriesWinner;
  }

  // Update player statistics
  setStats(prev => {
    const newStats = { ...prev };

    if (!newStats[winnerId]) {
      newStats[winnerId] = { matchWins: 0, matchLosses: 0, seriesWins: 0, seriesLosses: 0, status: 'active' };
    }
    if (loserId && !newStats[loserId]) {
      newStats[loserId] = { matchWins: 0, matchLosses: 0, seriesWins: 0, seriesLosses: 0, status: 'active' };
    }

    // Update match win/loss stats
    newStats[winnerId].matchWins += 1;
    if (loserId) newStats[loserId].matchLosses += 1;

    // Update series win/loss stats if the series is complete
    if (seriesWinner) {
      newStats[seriesWinner].seriesWins += 1;
      newStats[seriesWinner].status = 'qualified';
      if (loserId) {
        newStats[loserId].seriesLosses += 1;
        newStats[loserId].status = 'eliminated';
      }
    }

    return newStats;
  });

  // Update match series and rounds
  match.series = series;
  setRounds(updatedRounds);
};



  return (
    <StatsTable participants={participants} stats={stats} rounds={rounds} setSelectedMatch={setSelectedMatch} handleMatchWin={handleMatchWin} />
  );
};

export default GamePage;
