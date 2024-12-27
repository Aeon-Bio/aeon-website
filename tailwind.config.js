/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'aeon-deep-space': 'var(--aeon-deep-space)',
        'aeon-primary': 'var(--aeon-primary)',
        'aeon-biolum': 'var(--aeon-biolum)',
        'aeon-surface-0': 'var(--aeon-surface-0)',
        'aeon-surface-1': 'var(--aeon-surface-1)',
        'aeon-surface-2': 'var(--aeon-surface-2)',
        'aeon-interactive': 'var(--aeon-interactive)',
        'aeon-interactive-hover': 'var(--aeon-interactive-hover)',
      }
    }
  },
  plugins: []
};

