import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Tournaments({ tournaments }) {
  return (
    <AuthenticatedLayout>
      <Head title="Tournaments" />
      <div style={{color: 'black'}}>
        <h1>Welcome to Tournaments!</h1>
        {tournaments.length > 0 ? (
          <ul>
            {tournaments.map((tournament) => (
              <li key={tournament.id} style={{ marginBottom: '1rem' }}>
                <h3>{tournament.name} ({tournament.type})</h3>
                {tournament.novus_type && <p><strong>Novus Type:</strong> {tournament.novus_type}</p>}
                <p>{tournament.description}</p>
                <small>Created by: {tournament.user}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p>No tournaments available.</p>
        )}
      </div>
    </AuthenticatedLayout>
  );
}

