import { motion, AnimatePresence } from 'framer-motion';

export const TournamentGrid = ({ rounds, setSelectedMatch, handleMatchWin  }) => {

  // Анимационные константы
const matchAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
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
  )
}