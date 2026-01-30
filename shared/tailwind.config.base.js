export default {
    theme: {
        extend: {
            colors: {
                'xverse-blue': '#0A2540',
                'deep-void': '#FFFFFF', // Refined to White for Light Theme
                'deep-ink': '#0f172a', // Dark text
                'ethereal-white': '#F8FAFC',
                'luminous-blue': '#9d2124', // Accent Red
                'calm-green': '#9d2124',
                'cyber-teal': '#ef4444', // Red-500 for gradients
                'metallic-silver': '#94A3B8',
            },
            fontFamily: {
                sans: ['"Zen Kaku Gothic New"', '"Inter"', 'sans-serif'],
            },
            animation: {
                'fade-up': 'fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'blur-in': 'blurIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                blurIn: {
                    '0%': { opacity: '0', filter: 'blur(10px)' },
                    '100%': { opacity: '1', filter: 'blur(0)' },
                },
            },
            backgroundImage: {
                'nebula': 'linear-gradient(to bottom right, #020617, #051025, #0f172a)',
                'auroral': 'linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(6, 182, 212, 0.1))',
            }
        },
    },
    plugins: [],
}
