import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Cards } from '../Components/Cards';
import '../../css/app.css';
import React from 'react';
import {cards_dashboard} from '../data';


export default function Dashboard() {
    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="rainbow-bg cards">
                <Cards cards={cards_dashboard} />
            </div>
        </AuthenticatedLayout>
    );
}


