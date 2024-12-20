
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Tournament } from '@/Components/Tournament';
import '../../css/tournaments.css';
import { useState } from 'react';

export default function Tournaments({ tournaments }) {
  const [tournamentsList, setTournamentsList] = useState(tournaments);

  const handleDelete = (id) => {
    setTournamentsList((prev) => prev.filter((tournament) => tournament.id !== id));
  };

  return (
    <div className='tournaments-page'>
      <AuthenticatedLayout>
        <Head title="Tournaments" />
        <div className='tournaments-page-title'>
          <h1 className='welcome'>Welcome to Tournaments!</h1>
        </div>
        <div className='tournaments-page-body'>
          {tournamentsList.length > 0 ? (
            <ul>
              {tournamentsList.slice().reverse().map((tournament) => (
                <li key={tournament.id} style={{ marginBottom: '1rem' }}>
                  <Tournament
                    key={tournament.id}
                    tournament={tournament}
                    onDelete={handleDelete}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p>No tournaments available.</p>
          )}
        </div>
      </AuthenticatedLayout>
    </div>
  );
}
