import '../css/app.css';
import './bootstrap';


import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot, hydrateRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const pageHandler = (pageName) => {
    if(pageName) {
        localStorage.setItem('lastPage', pageName)
    }
    return resolvePageComponent(
        `./Pages/${pageName ? pageName : localStorage.getItem('lastPage')}.jsx`,
        import.meta.glob('./Pages/**/*.jsx'),
    )
}

createInertiaApp({
    title: (title) => `${title || 'Default Title'} - ${appName}`,
    resolve: (name) =>  pageHandler(name),
    setup({ el, App, props }) {
        if (import.meta.env.SSR) {
            hydrateRoot(el, <App {...props} />);
            return;
        }

        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});




// import '../css/app.css';
// import './bootstrap';

// import { createInertiaApp } from '@inertiajs/react';
// import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
// import { createRoot, hydrateRoot } from 'react-dom/client';

// const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// // Handle page resolution and store the last page
// const pageHandler = async (pageName) => {
//     try {
//         const resolvedPageName = pageName || localStorage.getItem('lastPage');
//         if (!resolvedPageName) {
//             throw new Error("Page name is undefined, and no fallback is found.");
//         }

//         // Dynamically import the component
//         const componentPromise = resolvePageComponent(
//             `./Pages/${resolvedPageName}.jsx`,
//             import.meta.glob('./Pages/**/*.jsx')
//         );

//         // Log for debugging
//         console.log('Resolved Page:', resolvedPageName);

//         const component = await componentPromise;

//         // Store the last page in localStorage
//         if (pageName) {
//             localStorage.setItem('lastPage', resolvedPageName);
//         }

//         return component;
//     } catch (error) {
//         console.error('Error resolving page:', pageName, error);
//         throw error; // Re-throw so Inertia can handle the error appropriately.
//     }
// };


// createInertiaApp({
//     title: (title) => `${title || 'Default Title'} - ${appName}`,
//     resolve: async (name) => await pageHandler(name),
//     setup({ el, App, props }) {
//         if (import.meta.env.SSR) {
//             hydrateRoot(el, <App {...props} />);
//             return;
//         }

//         createRoot(el).render(<App {...props} />);
//     },
//     progress: {
//         color: '#4B5563',
//     },
// });



