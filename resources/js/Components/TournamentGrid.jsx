import React, { useEffect, useState } from "react";
import axios from "axios";
import '../../css/new.css';

export const TournamentGrid = ({ tournamentId }) => {
  const [matches, setMatches] = useState([]);
  const [editingMatchId, setEditingMatchId] = useState(null);
  const [winnerId, setWinnerId] = useState("");

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await axios.get(`/tournament/${tournamentId}/grid`);
      setMatches(response.data.matches);
    } catch (error) {
      console.error("Error fetching tournament grid:", error);
    }
  };

  const updateMatch = async (matchId) => {
    try {
      const response = await axios.post(`/tournament/match/${matchId}`, {
        winner_id: winnerId,
      });
      alert(response.data.message);
      fetchMatches();
      setEditingMatchId(null);
      setWinnerId("");
    } catch (error) {
      console.error("Error updating match:", error);
    }
  };

  return (
    <div className="tournament-grid">
      <h2>Tournament Grid</h2>
      <div className="grid">
        {matches.map((match) => (
          <div key={match.id} className="match">
            <p>Round: {match.round}</p>
            <p>Player 1: {match.participant1_id}</p>
            <p>Player 2: {match.participant2_id}</p>
            <p>
              Winner: {match.winner_id ? match.winner_id : "Not decided yet"}
            </p>
            {editingMatchId === match.id ? (
              <div>
                <input
                  type="text"
                  placeholder="Enter winner ID"
                  value={winnerId}
                  onChange={(e) => setWinnerId(e.target.value)}
                />
                <button onClick={() => updateMatch(match.id)}>Save</button>
              </div>
            ) : (
              <button onClick={() => setEditingMatchId(match.id)}>
                Edit Match
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

