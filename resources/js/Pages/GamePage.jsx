import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Bracket, Seed, SeedItem, SeedTeam } from 'react-brackets';
import axios from 'axios';
import '../../css/new.css'

const GamePage = ({ tournament }) => {
  const [bracketData, setBracketData] = useState([]);

  useEffect(() => {
    // Генерация данных для турнирной сетки
    const generateBracketData = () => {
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
          teams: [teams[i], teams[i + 1] || null],
        };
        seeds[0].matches.push(match);
      }

      setBracketData(seeds);
    };

    generateBracketData();
  }, [tournament]);

  return (
    <AuthenticatedLayout>
      <div className="game-page">
        <h1>{tournament.name}</h1>
        <Bracket
          rounds={bracketData.map((round) => ({
            title: `Round ${round.round}`,
            seeds: round.matches.map((match) => ({
              id: match.id,
              teams: match.teams.map((team) => ({
                name: team ? team.name : 'Bye',
              })),
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
      </div>
    </AuthenticatedLayout>
  );
};

export default GamePage;
