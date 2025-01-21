import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bracket, Seed, SeedItem, SeedTeam } from 'react-brackets';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import '../../css/new.css';

const CombinedBracketPage = ({ tournament }) => {
  const [bracketData, setBracketData] = useState(tournament.bracketData || []);
  const isAdmin = tournament.user_id === tournament.admin_id;

  useEffect(() => {
    if (bracketData.length === 0) {
      generateInitialBracketData();
    }
  }, [tournament, bracketData]);

  const generateInitialBracketData = () => {
    const participants = tournament.participants;
    const teams = participants.map((participant, index) => ({
      id: index + 1,
      name: participant.name,
    }));

    const rounds = Math.ceil(Math.log2(teams.length));
    const seeds = Array.from({ length: rounds }, (_, roundIndex) => ({
      round: roundIndex + 1,
      matches: [],
    }));

    for (let i = 0; i < teams.length; i += 2) {
      const match = {
        id: i / 2 + 1,
        participant1: teams[i] || null,
        participant2: teams[i + 1] || null,
        winner: null,
      };
      seeds[0].matches.push(match);
    }

    setBracketData(seeds);
  };

  const handleUpdateBracket = async (updatedData) => {
    try {
      const response = await axios.post(`/game/${tournament.id}/update-bracket`, {
        bracketData: updatedData,
      });

      if (response.status === 200) {
        setBracketData(updatedData);
        alert('Bracket updated successfully!');
      } else {
        alert('Failed to update the bracket. Server did not return success.');
      }
    } catch (error) {
      console.error('Error updating bracket:', error);
      alert('Failed to update the bracket.');
    }
  };

  const handleSelectWinner = (roundIndex, matchIndex, winnerId) => {
    const updatedBracket = JSON.parse(JSON.stringify(bracketData));
    const match = updatedBracket[roundIndex].matches[matchIndex];
    if (!match) return;

    match.winner = winnerId;

    // Fill next round
    if (roundIndex + 1 < updatedBracket.length) {
      const nextRound = updatedBracket[roundIndex + 1];
      const nextMatchIndex = Math.floor(matchIndex / 2);

      if (!nextRound.matches[nextMatchIndex]) {
        nextRound.matches[nextMatchIndex] = { participant1: null, participant2: null, winner: null };
      }

      const nextMatch = nextRound.matches[nextMatchIndex];
      if (matchIndex % 2 === 0) {
        nextMatch.participant1 = match.participant1.id === winnerId ? match.participant1 : match.participant2;
      } else {
        nextMatch.participant2 = match.participant1.id === winnerId ? match.participant1 : match.participant2;
      }
    }

    handleUpdateBracket(updatedBracket);
  };

  return (
    <AuthenticatedLayout>
      <div className="game-page">
        <h1>{tournament.name} - Bracket</h1>

        {bracketData.length > 0 ? (
          <Bracket
            rounds={bracketData.map((round, roundIndex) => ({
              title: `Round ${round.round}`,
              seeds: round.matches.map((match, matchIndex) => ({
                id: match.id,
                teams: [
                  { name: match.participant1?.name || 'Bye' },
                  { name: match.participant2?.name || 'Bye' },
                ],
              })),
            }))}
            renderSeedComponent={({ seed }) => (
              <Seed>
                <SeedItem>
                  <SeedTeam>{seed.teams[0]?.name || 'Bye'}</SeedTeam>
                  <SeedTeam>{seed.teams[1]?.name || 'Bye'}</SeedTeam>
                </SeedItem>
              </Seed>
            )}
          />
        ) : (
          <p>No bracket data available.</p>
        )}

        {isAdmin && bracketData.length > 0 && (
          <div>
            {bracketData.map((round, roundIndex) => (
              <div key={roundIndex}>
                <h2>Round {round.round}</h2>
                {round.matches.map((match, matchIndex) => (
                  <div key={matchIndex}>
                    <p>
                      {match.participant1?.name || 'Not specified'} vs {match.participant2?.name || 'Not specified'}
                    </p>
                    {match.winner && (
                      <p>
                        <strong>Winner: </strong>
                        {match.winner === match.participant1?.id
                          ? match.participant1?.name
                          : match.participant2?.name}
                      </p>
                    )}
                    {isAdmin && !match.winner && (
                      <div>
                        <button onClick={() => handleSelectWinner(roundIndex, matchIndex, match.participant1?.id)}>
                          {match.participant1?.name}
                        </button>
                        <button onClick={() => handleSelectWinner(roundIndex, matchIndex, match.participant2?.id)}>
                          {match.participant2?.name}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default CombinedBracketPage;
