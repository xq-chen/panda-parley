/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                panda: {
                    base: '#fdfdfc', // Rice paper
                    ink: '#1a1a1a',  // Deep black/grey
                    charcoal: '#374151',
                    green: '#4ade80', // Bamboo bright
                    darkgreen: '#166534', // Bamboo shadow
                    red: '#f87171', // Stamp red
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'bounce-slow': 'bounce 3s infinite',
            }
        },
    },
    plugins: [],
}
