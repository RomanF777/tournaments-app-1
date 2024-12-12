import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Cards } from '../Components/Cards';
// import '../../css/Cards.css';
import '../../css/app.css';
import React from 'react';


export default function Dashboard() {
    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="cards">
                <Cards />
            </div>
        </AuthenticatedLayout>
    );
}


