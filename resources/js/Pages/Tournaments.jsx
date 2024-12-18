import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Tournament } from '@/Components/Tournament';
import '../../css/tournaments.css';

export default function Tournaments({ tournaments }) {
  return (
    <div className='tournaments-page'>
      <AuthenticatedLayout>
      <Head title="Tournaments" />
      <div>
        <h1 className='welcome'>Welcome to Tournaments!</h1>
      </div>
      <div className='tournaments-page-body'>
        {tournaments.length > 0 ? (
          <ul>
            {tournaments.map((tournament) => (
              <li key={tournament.id} style={{ marginBottom: '1rem' }}>
                <Tournament tournament={tournament} />
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

