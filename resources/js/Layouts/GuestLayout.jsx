// import ApplicationLogo from '@/Components/ApplicationLogo';
// import { Link } from '@inertiajs/react';

// export default function GuestLayout({ children }) {
//     return (
//         <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0 dark:bg-gray-900">
//             <div>
//                 <Link href="/">
//                     <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />
//                 </Link>
//             </div>

//             <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg dark:bg-gray-800">
//                 {children}
//             </div>
//         </div>
//     );
// }


// resources/js/Layouts/GuestLayout.jsx

// resources/js/Layouts/GuestLayout.jsx

// import ApplicationLogo from '@/Components/ApplicationLogo';
// import { Link } from '@inertiajs/react';

// export default function GuestLayout({ auth = {}, children }) {
//     // Default to empty object if auth is not provided

//     return (
//         <div className="">
//             {/* Navbar */}
//             <header className="w-full flex justify-between items-center p-6 backdrop-blur-md bg-black">
//                 <a href="/">
//                     <img
//                         src="https://www.databank.lv/assets/images/logo.png"
//                         alt="Databank"
//                         className="h-10"
//                     />
//                 </a>
//                 <nav className="flex space-x-4">
//                     {auth.user ? (
//                         <Link href={route('dashboard')} className="nav-link">
//                             Go to main page
//                         </Link>
//                     ) : (
//                         <>
//                             <Link href={route('login')} className="nav-link">
//                                 Log in
//                             </Link>
//                             <Link href={route('register')} className="nav-link">
//                                 Register
//                             </Link>
//                         </>
//                     )}
//                 </nav>
//             </header>

//             {/* Content */}
//             <div className="">
//                 {children}
//             </div>
//         </div>
//     );
// }



import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    // Access auth data from the Inertia page props
    const { auth } = usePage().props;

    return (
        <div className="">
            {/* Navbar */}
            <header className="w-full flex justify-between items-center p-6 backdrop-blur-md bg-black">
                <a href="/">
                    <img
                        src="https://www.databank.lv/assets/images/logo.png"
                        alt="Databank"
                        className="h-10"
                    />
                </a>
                <nav className="flex space-x-4">
                    {auth.user ? (
                        // If user is signed in, show "Go to main page" button
                        <Link href={route('dashboard')} className="nav-link">
                            Go to main page
                        </Link>
                    ) : (
                        // If user is not signed in, show login and register buttons
                        <>
                            <Link href={route('login')} className="nav-link">
                                Log in
                            </Link>
                            <Link href={route('register')} className="nav-link">
                                Register
                            </Link>
                        </>
                    )}
                </nav>
            </header>

            {/* Content */}
            <div className="">
                {children}
            </div>
        </div>
    );
}
