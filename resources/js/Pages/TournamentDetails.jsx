import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function TournamentDetails() {
  const { id } = useParams(); // Получение ID из URL
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const response = await axios.get(`/api/tournament/${id}`);
        setTournament(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>{tournament.name}</h1>
      <p><strong>Type:</strong> {tournament.type}</p>
      <p><strong>Description:</strong> {tournament.description}</p>
      <p><strong>Participants:</strong></p>
      <ul>
        {tournament.participants.map(participant => (
          <li key={participant.id}>{participant.name}</li>
        ))}
      </ul>
    </div>
  );
}
