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

