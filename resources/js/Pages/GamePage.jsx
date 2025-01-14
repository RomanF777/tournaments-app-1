import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
// import { usePage } from '@inertiajs/react';
import Welcome from './Welcome';

const GamePage = ({ tournament }) => {
    return (
      <div style={{color: 'black'}}>
        <AuthenticatedLayout>
          <div>
            <h1>Game Page</h1>
            <h2>{tournament.name}</h2>
          </div>
        </AuthenticatedLayout>
        </div>
    );
};

export default GamePage;

