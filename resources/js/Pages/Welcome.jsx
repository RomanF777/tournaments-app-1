import { Head, Link } from '@inertiajs/react';
import '../../css/app.css';
import GuestLayout from '@/Layouts/GuestLayout';


export default function Welcome({ auth, laravelVersion, phpVersion }) {
    const handleImageError = () => {
        document
            .getElementById('screenshot-container')
            ?.classList.add('!hidden');
        document.getElementById('docs-card')?.classList.add('!row-span-1');
        document
            .getElementById('docs-card-content')
            ?.classList.add('!flex-row');
        document.getElementById('background')?.classList.add('!hidden');
    };

    return (
        <div id='welcome'>
            <Head title="Welcome" />
            <div className="min-h-screen flex flex-col items-center justify-between text-white">
                        <header className="w-full flex justify-between items-center p-6 backdrop-blur-md bg-black">
                        <a href="/"><img src="https://www.databank.lv/assets/images/logo.png" alt="Databank" className="h-10" /></a>
                            <nav className="flex space-x-4">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="nav-link"
                                    >
                                        Go to main page
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="nav-link"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="nav-link"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </header>

                        <main className="flex-grow flex items-center justify-center text-center">
                            <div>
                                <h1 className="text-5xl font-extrabold drop-shadow-lg">Welcome to the Portal</h1>
                            </div>
                        </main>

                        <footer className="w-full text-center py-4 backdrop-blur-md bg-black">

                            <p className="text-sm text-red-700">
                                Laravel v{laravelVersion} (PHP v{phpVersion})
                            </p>
                        </footer>
            </div>
        </div>
    );
}


