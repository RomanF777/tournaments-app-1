import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bracket, Seed, SeedItem, SeedTeam } from 'react-brackets';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import '../../css/new.css';

const GamePage = ({ tournament }) => {
  const [bracketData, setBracketData] = useState(tournament.bracketData || []);
  const isAdmin = tournament.user_id === tournament.admin_id;

  useEffect(() => {
    if (!bracketData.length) generateInitialBracketData();
  }, [tournament, bracketData]);

  const generateInitialBracketData = () => {
    const participants = tournament.participants || [];
    const teams = participants.map((participant, index) => ({
      id: index + 1,
      name: participant.name,
    }));

    // Calculate total slots needed for the first round (power of 2)
    const totalSlots = Math.pow(2, Math.ceil(Math.log2(teams.length)));
    const paddedTeams = [...teams, ...Array(totalSlots - teams.length).fill(null)];

    const rounds = Math.log2(totalSlots);
    const seeds = Array.from({ length: rounds }, (_, roundIndex) => ({
      round: roundIndex + 1,
      matches: [],
    }));

    // Populate the first round
    for (let i = 0; i < paddedTeams.length; i += 2) {
      const match = {
        id: i / 2 + 1,
        participant1: paddedTeams[i],
        participant2: paddedTeams[i + 1],
        winner: null,
      };

      if (!match.participant2) {
        match.winner = match.participant1?.id; // Auto-win for "Bye"
        match.participant2 = { id: 0, name: 'Bye' }; // Assign a virtual Bye
      }

      seeds[0].matches.push(match);
    }

    // Generate subsequent rounds
    for (let roundIndex = 1; roundIndex < rounds; roundIndex++) {
      const previousRound = seeds[roundIndex - 1];
      const currentRound = seeds[roundIndex];

      for (let i = 0; i < previousRound.matches.length; i += 2) {
        const match = {
          id: i / 2 + 1,
          participant1: null,
          participant2: null,
          winner: null,
        };

        const match1 = previousRound.matches[i];
        const match2 = previousRound.matches[i + 1];

        // Assign participants from previous round's winners
        match.participant1 = match1?.winner ? match1.participant1 : { id: 0, name: '-' };
        match.participant2 = match2?.winner ? match2.participant1 : { id: 0, name: '-' };

        currentRound.matches.push(match);
      }
    }

    setBracketData(seeds);
  };

  const handleUpdateBracket = async (updatedData) => {
    try {
      const { status } = await axios.post(`/game/${tournament.id}/update-bracket`, { bracketData: updatedData });
      if (status === 200) {
        setBracketData(updatedData);
        alert('Bracket updated successfully!');
      } else {
        console.error('Unexpected server response:', status);
        alert('Failed to update the bracket. Please try again.');
      }
    } catch (error) {
      console.error('Error updating bracket:', error);
      alert('Failed to update the bracket. Please check the console for more details.');
    }
  };

  const handleSelectWinner = (roundIndex, matchIndex, winnerId) => {
    const updatedBracket = structuredClone(bracketData);
    const match = updatedBracket[roundIndex]?.matches[matchIndex];
    if (!match || match.winner) return;

    match.winner = winnerId;

    // Update the next round match
    if (roundIndex + 1 < updatedBracket.length) {
      const nextRound = updatedBracket[roundIndex + 1];
      const nextMatchIndex = Math.floor(matchIndex / 2);

      if (!nextRound.matches[nextMatchIndex]) {
        nextRound.matches[nextMatchIndex] = { participant1: null, participant2: null, winner: null };
      }

      const nextMatch = nextRound.matches[nextMatchIndex];
      if (matchIndex % 2 === 0) {
        nextMatch.participant1 = match.participant1?.id === winnerId ? match.participant1 : match.participant2;
      } else {
        nextMatch.participant2 = match.participant1?.id === winnerId ? match.participant1 : match.participant2;
      }

      // Auto-advance for "Bye" in next round
      if (!nextMatch.participant2) nextMatch.winner = nextMatch.participant1?.id;
    }

    handleUpdateBracket(updatedBracket);
  };

  const MatchCard = ({ roundIndex, match, matchIndex }) => (
    <div className="border border-gray-300 rounded-lg p-4 mb-4 bg-white shadow">
      <p className="text-lg font-medium">
        {match.participant1?.name || <span className="text-gray-500">Bye</span>} vs{' '}
        {match.participant2?.name || <span className="text-gray-500">Bye</span>}
      </p>
      {match.winner && (
        <p className="text-green-600 font-semibold mt-2">
          Winner: {match.winner === match.participant1?.id ? match.participant1?.name : match.participant2?.name}
        </p>
      )}
      {isAdmin && !match.winner && match.participant1 && match.participant2 && (
        <AdminControls
          roundIndex={roundIndex}
          matchIndex={matchIndex}
          participant1={match.participant1}
          participant2={match.participant2}
        />
      )}
    </div>
  );

  const AdminControls = ({ roundIndex, matchIndex, participant1, participant2 }) => (
    <div className="flex gap-4 mt-4">
      <button
        onClick={() => handleSelectWinner(roundIndex, matchIndex, participant1?.id)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        {participant1?.name}
      </button>
      <button
        onClick={() => handleSelectWinner(roundIndex, matchIndex, participant2?.id)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        {participant2?.name}
      </button>
    </div>
  );

  return (
    <AuthenticatedLayout>
      <div className="game-page p-8 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-center">{tournament.name} - Bracket</h1>
        {bracketData.length > 0 ? (
          <Bracket
            rounds={bracketData.map((round, roundIndex) => ({
              title: `Round ${round.round}`,
              seeds: round.matches.map((match) => ({
                id: match.id,
                teams: [
                  { name: match.participant1?.name || '-' },
                  { name: match.participant2?.name || '-' },
                ],
              })),
            }))}
            renderSeedComponent={({ seed }) => (
              <Seed>
                <SeedItem>
                  <SeedTeam className="text-center text-white-800">{seed.teams[0]?.name || '-'}</SeedTeam>
                  <SeedTeam className="text-center text-white-800">{seed.teams[1]?.name || '-'}</SeedTeam>
                </SeedItem>
              </Seed>
            )}
          />
        ) : (
          <p className="text-center text-gray-600">No bracket data available.</p>
        )}

        {isAdmin && bracketData.length > 0 && (
          <div className="admin-bracket mt-8">
            {bracketData.map((round, roundIndex) => (
              <div key={roundIndex} className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Round {round.round}</h2>
                {round.matches.map((match, matchIndex) => (
                  <MatchCard
                    key={matchIndex}
                    roundIndex={roundIndex}
                    match={match}
                    matchIndex={matchIndex}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default GamePage;
