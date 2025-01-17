import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const BracketPage = ({ tournament }) => {
  const [bracketData, setBracketData] = useState(tournament.bracketData || []);
  const [isOwner, setIsOwner] = useState(tournament.isOwner);

  useEffect(() => {
    console.log('Bracket Data:', bracketData);
  }, [bracketData]);

  const handleUpdateBracket = async (updatedData) => {
    try {
      await axios.post(`/game/${tournament.id}/update-bracket`, { bracketData: updatedData });
      setBracketData(updatedData);
      alert('Bracket updated successfully!');
    } catch (error) {
      console.error('Error updating bracket:', error);
      alert('Failed to update the bracket.');
    }
  };

  const handleSelectWinner = (roundIndex, matchIndex, winnerId) => {
    const updatedBracket = [...bracketData];
    updatedBracket[roundIndex].matches[matchIndex].winner = winnerId;
    handleUpdateBracket(updatedBracket);
  };

  return (
    <AuthenticatedLayout>
      <div>
        <h1>{tournament.name} - Bracket</h1>
        {bracketData.length > 0 ? (
          bracketData.map((round, roundIndex) => (
            <div key={roundIndex}>
              <h2>Round {round.round}</h2>
              <div>
                {round.matches.map((match, matchIndex) => (
                  <div key={matchIndex} style={{ marginBottom: '10px' }}>
                    <p>
                      {match.participant1?.name || 'TBD'} vs {match.participant2?.name || 'TBD'}
                    </p>
                    {isOwner && (
                      <div>
                        <button onClick={() => handleSelectWinner(roundIndex, matchIndex, match.participant1?.id)}>
                          Select {match.participant1?.name || 'TBD'} as Winner
                        </button>
                        <button onClick={() => handleSelectWinner(roundIndex, matchIndex, match.participant2?.id)}>
                          Select {match.participant2?.name || 'TBD'} as Winner
                        </button>
                      </div>
                    )}
                    <p>Winner: {match.winner ? `Participant ${match.winner}` : 'TBD'}</p>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p>No bracket data available.</p>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default BracketPage;