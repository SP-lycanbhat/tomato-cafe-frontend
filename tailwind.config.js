/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: 'rgb(var(--primary) / <alpha-value>)',
                background: 'rgb(var(--background) / <alpha-value>)',
                surface: 'rgb(var(--surface) / <alpha-value>)',
                text: 'rgb(var(--text) / <alpha-value>)',
                border: 'rgb(var(--border) / <alpha-value>)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
