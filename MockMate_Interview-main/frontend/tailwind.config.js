export default {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                ink: '#08121c',
                mist: '#d8ecf8',
                sand: '#f2d9c2',
                coral: '#ff8d6d',
                mint: '#3dd9b8',
                slate: '#112538'
            },
            fontFamily: {
                display: ['"Space Grotesk"', 'sans-serif'],
                body: ['"Manrope"', 'sans-serif']
            },
            boxShadow: {
                glow: '0 20px 50px rgba(8, 18, 28, 0.18)'
            }
        }
    },
    plugins: []
};
