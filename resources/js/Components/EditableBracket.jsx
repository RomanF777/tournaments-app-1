import React, { useState } from 'react';
import axios from 'axios';

export const EditableBracket = ({ initialBracket, tournamentPath }) => {
  const [bracket, setBracket] = useState(initialBracket);

  const handleEditMatch = (roundIndex, matchIndex, teamIndex, newName) => {
    setBracket((prevBracket) => {
      const updatedBracket = [...prevBracket];
      updatedBracket[roundIndex].matches[matchIndex].teams[teamIndex].name = newName;
      return updatedBracket;
    });
  };

  const saveBracket = async () => {
    try {
      const response = await axios.post(`/tournament/${tournamentPath}/update-bracket`, {
        bracket,
      });
      alert(response.data.message);
    } catch (error) {
      console.error('Error saving bracket:', error);
      alert('Failed to save bracket.');
    }
  };

  return (
    <div>
      {bracket.map((round, roundIndex) => (
        <div key={roundIndex}>
          <h3>{`Round ${round.round}`}</h3>
          {round.matches.map((match, matchIndex) => (
            <div key={matchIndex}>
              {match.teams.map((team, teamIndex) => (
                <input
                  key={teamIndex}
                  value={team ? team.name : ''}
                  onChange={(e) =>
                    handleEditMatch(roundIndex, matchIndex, teamIndex, e.target.value)
                  }
                />
              ))}
            </div>
          ))}
        </div>
      ))}
      <button onClick={saveBracket}>Save Bracket</button>
    </div>
  );
};


