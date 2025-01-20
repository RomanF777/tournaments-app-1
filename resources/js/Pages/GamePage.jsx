import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bracket, Seed, SeedItem, SeedTeam } from 'react-brackets';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import '../../css/new.css';

const CombinedBracketPage = ({ tournament }) => {
  const [bracketData, setBracketData] = useState(tournament.bracketData || []);
  // const [isAdmin, setIsAdmin] = useState(tournament.user_id);
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
    const seeds = [];

    for (let i = 0; i < rounds; i++) {
      seeds.push({ round: i + 1, matches: [] });
    }

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
    console.log('Updated Bracket Data:', updatedData); // Log the updated bracket data
    try {
      const response = await axios.post(`/game/${tournament.id}/update-bracket`, {
        bracketData: updatedData, // Send the updated bracket
      });

      if (response.status === 200) {
        setBracketData(updatedData); // Update state with the new bracket
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
    const updatedBracket = JSON.parse(JSON.stringify(bracketData)); // Copy the current bracket
    const match = updatedBracket[roundIndex].matches[matchIndex];

    // Update the winner of the match
    match.winner = winnerId;

    // Update the bracket data
    handleUpdateBracket(updatedBracket);
  };

  console.log('Bracket Data:', bracketData);
  console.log(tournament)
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
                <div>
                  {round.matches.map((match, matchIndex) => (
                    <div key={matchIndex} style={{ marginBottom: '10px' }}>
                      <p>
                        {match.participant1?.name || 'TBD'} vs {match.participant2?.name || 'TBD'}
                      </p>
                      <div>
                        {isAdmin && (
                          <div className='bg-gray-100 p-4 '>
                            <button className='bg-blue-500 text-white px-4 py-2 rounded m-2'
                              onClick={() =>
                                handleSelectWinner(roundIndex, matchIndex, match.participant1?.id)
                              }
                            >
                              Select {match.participant1?.name || 'TBD'} as Winner
                            </button>
                            <br />
                            <button className='bg-blue-500 text-white px-4 py-2 rounded m-2'
                              onClick={() =>
                                handleSelectWinner(roundIndex, matchIndex, match.participant2?.id)
                              }
                            >
                              Select {match.participant2?.name || 'TBD'} as Winner
                            </button>
                          </div>
                        )}
                        <p>Winner: {match.winner ? `Participant ${match.winner}` : 'TBD'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default CombinedBracketPage;
