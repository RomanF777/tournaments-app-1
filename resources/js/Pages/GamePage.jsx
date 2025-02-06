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

const generateQualifyingMatches = (participants, stats) => {
  const activeParticipants = participants.filter(p => stats[p.id].status === 'active');

  // Группируем игроков по их статистике серий
  const groups = activeParticipants.reduce((acc, p) => {
    const key = `${stats[p.id].seriesWins}-${stats[p.id].seriesLosses}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  const matches = [];
  Object.values(groups).forEach(group => {
    const shuffled = [...group].sort(() => Math.random() - 0.5);
    for (let i = 0; i < shuffled.length; i += 2) {
      const p1 = shuffled[i];
      const p2 = shuffled[i + 1] || null;
      if (p1 && p2) {
        // Определяем тип серии
        const p1Stats = stats[p1.id];
        const p2Stats = stats[p2.id];
        let requiredWins = 2;
        if (p1Stats.seriesWins >= 2 || p1Stats.seriesLosses >= 2 ||
            p2Stats.seriesWins >= 2 || p2Stats.seriesLosses >= 2) {
          requiredWins = 3;
        }
        matches.push({
          round: matches.length,
          id: `qual-${crypto.randomUUID()}`,
          player1: p1,
          player2: p2,
          series: [],
          seriesWinner: null,
          requiredWins
        });
      }
    }
  });

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
      seriesWinner: null,
      requiredWins: 2
    };
    if (!match.player2) match.seriesWinner = match.player1?.id;
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
  const [playoffCount, setPlayoffCount] = useState(
    tournament.playoffParticipants || Math.ceil(participants.length / 2)
  );

  const [selectedMatch, setSelectedMatch] = useState(null);


  // Инициализация квалификации
  useEffect(() => {
    if (isQualifying && participants.length > 0) {
      setRounds([generateQualifyingMatches(participants, stats)]);
    }
  }, [isQualifying]);


  // Эффект для обработки логики плей-офф (генерация следующего раунда)
  useEffect(() => {
    if (!isQualifying && rounds.length > 0) {
      const lastRound = rounds[rounds.length - 1];
      const allCompleted = lastRound.every(match => match.seriesWinner);

      if (allCompleted) {
        // Получаем победителей текущего раунда
        const winners = lastRound
          .map(match => match.player1?.id === match.seriesWinner ? match.player1 : match.player2)
          .filter(Boolean);

        if (winners.length === 1) {
          // Убедимся, что все проигравшие помечены как "eliminated"
          setStats(prevStats => {
            const newStats = { ...prevStats };
            participants.forEach(p => {
              if (p.id !== winners[0].id) {
                newStats[p.id].status = 'eliminated';
              }
            });
            return newStats;
          });

          console.log("Турнир завершён. Победитель:", winners[0]?.name);
        } else {
          const nextRound = generatePlayoffMatches(winners, rounds.length);
          setRounds(prev => [...prev, nextRound]);
        }
      }
    }
  }, [rounds, isQualifying]);



  // Логика завершения раундов
  // В useEffect для завершения раундов ПЕРЕРАБАТЫВАЕМ логику
  useEffect(() => {
    if (isQualifying && rounds.length > 0) {
      const lastRound = rounds[rounds.length - 1];
      const allCompleted = lastRound.every(m => m.seriesWinner);

      if (allCompleted) {
        // Автоматически определяем выбывших по 3 поражениям
        const updatedStats = { ...stats };
        participants.forEach(p => {
          if (stats[p.id].seriesLosses >= 3 && stats[p.id].status === 'active') {
            updatedStats[p.id].status = 'eliminated';
          }
        });
        setStats(updatedStats);

        const active = participants.filter(p =>
          updatedStats[p.id].status === 'active'
        );

        // Если осталось участников <= playoffCount или нельзя сформировать матчи
        if (active.length <= playoffCount ||
            active.length < 2 ||
            !canGenerateMatches(active, updatedStats)) {

          // Выбираем топ участников по статистике
          const qualified = participants
          .sort((a, b) => {
            const statsA = updatedStats[a.id];
            const statsB = updatedStats[b.id];
            return (
              statsB.seriesWins - statsA.seriesWins ||
              (statsB.matchWins - statsB.matchLosses) - (statsA.matchWins - statsA.matchLosses) ||
              statsB.matchWins - statsA.matchWins
            );
          })
          .slice(0, playoffCount);


          // Обновляем статусы
          setStats(prev => {
            const newStats = { ...prev };
            participants.forEach(p => {
              newStats[p.id].status = qualified.some(q => q.id === p.id)
                ? 'qualified'
                : 'eliminated';
            });
            return newStats;
          });

          // Переход в плей-офф
          setIsQualifying(false);
          setRounds([generatePlayoffMatches(qualified, 0)]);
          return;
        }

        // Генерируем новый раунд
        const nextRound = generateQualifyingMatches(active, updatedStats);
        if (nextRound.length > 0) {
          setRounds(prev => [...prev, nextRound]);
        } else {
          // Если не удалось сгенерировать матчи - форсируем завершение
          setIsQualifying(false);
          setRounds([generatePlayoffMatches(active.slice(0, playoffCount), 0)]);
        }
      }
    }
  }, [rounds, stats]);

  // Новая функция проверки возможности генерации матчей
  const canGenerateMatches = (activeParticipants, currentStats) => {
    const groups = activeParticipants.reduce((acc, p) => {
      const key = `${currentStats[p.id].seriesWins}-${currentStats[p.id].seriesLosses}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(p);
      return acc;
    }, {});

    return Object.values(groups).some(group => group.length >= 2);
  };

  const handleMatchWin = (roundIndex, matchIndex, winnerId) => {
    const updatedRounds = [...rounds];
    const match = updatedRounds[roundIndex][matchIndex];
    const loserId = match.player1.id === winnerId ? match.player2?.id : match.player1.id;
    const requiredWins = match.requiredWins;

    // Обновляем серию
    const series = [...match.series, winnerId];
    const wins = series.filter(id => id === winnerId).length;

    // Обновляем статистику
    setStats(prev => {
      const newStats = { ...prev };
      newStats[winnerId].matchWins += 1;
      if (loserId) newStats[loserId].matchLosses += 1;

      if (wins >= requiredWins) {
        newStats[winnerId].seriesWins += 1;
        if (loserId) newStats[loserId].seriesLosses += 1;

        // Automatic status updates
        if (newStats[winnerId].seriesWins >= 3) {
          newStats[winnerId].status = 'qualified';
        }
        if (loserId && newStats[loserId].seriesLosses >= 3) {
          newStats[loserId].status = 'eliminated';
        }
      }
      return newStats;
    });


    // Обновляем матч
    match.series = series;
    if (wins >= requiredWins) match.seriesWinner = winnerId;
    setRounds(updatedRounds);
  };

  return (
    <div className="tournament-container">
      <StatsTable
        participants={participants}
        stats={stats}
        rounds={rounds}
        isQualifying={isQualifying}
        handleMatchWin={handleMatchWin}
        playoffCount={playoffCount}
        setPlayoffCount={setPlayoffCount}
        selectedMatch={selectedMatch}
        setSelectedMatch={setSelectedMatch}
        // setSelectedMatch={() => {}}
      />
    </div>
  );
};

export default GamePage;