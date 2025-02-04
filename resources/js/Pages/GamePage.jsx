import "../../css/new.css";
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
      status: 'active'
    }
  }), {});

const generateRoundRobin = (participants) => {
  const matches = [];
  const participantsCopy = [...participants];

  if (participantsCopy.length % 2 !== 0) {
    participantsCopy.push(null);
  }

  const roundsCount = participantsCopy.length - 1;
  const half = participantsCopy.length / 2;

  for (let round = 0; round < roundsCount; round++) {
    const roundMatches = [];

    for (let i = 0; i < half; i++) {
      const p1 = participantsCopy[i];
      const p2 = participantsCopy[participantsCopy.length - 1 - i];

      if (p1 && p2) {
        roundMatches.push({
          round,
          id: `${round}-${i}`,
          player1: p1,
          player2: p2,
          series: [],
          seriesWinner: null
        });
      }
    }

    matches.push(roundMatches);
    participantsCopy.splice(1, 0, participantsCopy.pop());
  }

  return matches;
};

const generatePlayoffMatches = (participants, round) => {
  const matches = [];

  for (let i = 0; i < participants.length; i += 2) {
    const match = {
      round,
      id: `playoff-${round}-${matches.length}`,
      player1: participants[i],
      player2: participants[i + 1] || null,
      series: [],
      seriesWinner: null
    };

    if (!match.player2) {
      match.seriesWinner = match.player1?.id;
    }

    matches.push(match);
  }

  return matches;
};

const GamePage = ({ tournament }) => {
  const participants = tournament?.participants || [];
  const [isQualifying, setIsQualifying] = useState(true);
  const [rounds, setRounds] = useState([]);
  const [currentPlayoffRound, setCurrentPlayoffRound] = useState(0);
  const [stats, setStats] = useState(() => initialStats(participants));
  const [playoffParticipants, setPlayoffParticipants] = useState([]);

  // Инициализация отборочного этапа
  useEffect(() => {
    if (isQualifying && participants.length > 0) {
      setRounds(generateRoundRobin(participants));
    }
  }, [participants, isQualifying]);

  // Логика плей-офф
  useEffect(() => {
    if (!isQualifying && rounds.length > 0) {
      const currentMatches = rounds[currentPlayoffRound];
      const allCompleted = currentMatches.every(m => m.seriesWinner);

      if (allCompleted && currentPlayoffRound === rounds.length - 1) {
        const winners = currentMatches
          .map(m => participants.find(p => p.id === m.seriesWinner))
          .filter(Boolean);

        if (winners.length >= 2) {
          setRounds(prev => [...prev, generatePlayoffMatches(winners, currentPlayoffRound + 1)]);
          setCurrentPlayoffRound(prev => prev + 1);
        }
      }
    }
  }, [rounds, currentPlayoffRound, isQualifying]);

  const handleMatchWin = (roundIndex, matchIndex, winnerId) => {
    const updatedRounds = [...rounds];
    const match = updatedRounds[roundIndex][matchIndex];
    const loserId = match.player1?.id === winnerId ? match.player2?.id : match.player1?.id;

    // Обновляем серию
    const series = [...match.series, winnerId];
    const requiredWins = isQualifying ? 1 : 2;
    const wins = series.filter(id => id === winnerId).length;

    // Обновляем статистику
    setStats(prev => {
      const newStats = { ...prev };

      // Обновляем победы в матчах
      newStats[winnerId].matchWins += 1;
      if (loserId) newStats[loserId].matchLosses += 1;

      // Проверяем завершение серии
      if (wins >= requiredWins) {
        newStats[winnerId].seriesWins += 1;
        if (!isQualifying) newStats[winnerId].status = 'qualified';

        if (loserId) {
          newStats[loserId].seriesLosses += 1;
          if (!isQualifying) newStats[loserId].status = 'eliminated';
        }
      }

      return newStats;
    });

    // Обновляем состояние матча
    match.series = series;
    if (wins >= requiredWins) {
      match.seriesWinner = winnerId;
    }

    setRounds(updatedRounds);

    // Проверка завершения отборочного этапа
    if (isQualifying) {
      const allCompleted = updatedRounds.flat().every(m => m.seriesWinner);
      if (allCompleted) {
        const sorted = participants.slice().sort((a, b) => {
          const aStats = stats[a.id];
          const bStats = stats[b.id];

          return (bStats.seriesWins - aStats.seriesWins) ||
                 ((bStats.matchWins - bStats.matchLosses) - (aStats.matchWins - aStats.matchLosses)) ||
                 (bStats.matchWins - aStats.matchWins);
        });

        const playoffCount = tournament.playoffParticipants || Math.ceil(participants.length / 2);
        const qualified = sorted.slice(0, playoffCount);
        setPlayoffParticipants(qualified);

        // Обновляем статусы участников
        setStats(prev => {
          const newStats = { ...prev };
          participants.forEach(p => {
            newStats[p.id].status = qualified.some(q => q.id === p.id) ? 'qualified' : 'eliminated';
          });
          return newStats;
        });

        // Инициализируем плей-офф
        setIsQualifying(false);
        setRounds([generatePlayoffMatches(qualified, 0)]);
        setCurrentPlayoffRound(0);
      }
    }
  };

  return (
    <StatsTable
      participants={participants}
      stats={stats}
      rounds={rounds}
      isQualifying={isQualifying}
      handleMatchWin={handleMatchWin}
      setSelectedMatch={() => {}}
    />
  );
};

export default GamePage;