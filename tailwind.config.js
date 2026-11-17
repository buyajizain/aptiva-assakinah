import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
                display: ['Plus Jakarta Sans', ...defaultTheme.fontFamily.sans],
                headline: ['Plus Jakarta Sans', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                primary: '#00236f',
                'primary-container': '#1e3a8a',
                'on-primary': '#ffffff',
                'on-primary-container': '#90a8ff',
                'primary-fixed': '#dce1ff',
                'on-primary-fixed': '#00164e',
                secondary: '#006a61',
                'secondary-container': '#86f2e4',
                'on-secondary': '#ffffff',
                'on-secondary-container': '#006f66',
                'secondary-fixed': '#89f5e7',
                'on-secondary-fixed': '#00201d',
                tertiary: '#442100',
                'tertiary-container': '#653400',
                'on-tertiary-container': '#fc922b',
                'tertiary-fixed': '#ffdcc3',
                'on-tertiary-fixed-variant': '#6e3900',
                error: '#ba1a1a',
                'error-container': '#ffdad6',
                'on-error': '#ffffff',
                'on-error-container': '#93000a',
                surface: '#f8f9ff',
                'surface-dim': '#cbdbf5',
                'surface-bright': '#f8f9ff',
                'surface-container-lowest': '#ffffff',
                'surface-container-low': '#eff4ff',
                'surface-container': '#e5eeff',
                'surface-container-high': '#dce9ff',
                'surface-container-highest': '#d3e4fe',
                'surface-variant': '#d3e4fe',
                'on-surface': '#0b1c30',
                'on-surface-variant': '#444651',
                outline: '#757682',
                'outline-variant': '#c5c5d3',
                'surface-tint': '#4059aa',
            },
        },
    },

    plugins: [forms],
};
