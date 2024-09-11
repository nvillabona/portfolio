import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {

      'tom-thumb': {
        '50': '#f2f7f3',
        '100': '#e0ebe1',
        '200': '#c3d7c6',
        '300': '#9bbaa2',
        '400': '#6f9879',
        '500': '#4f7a5c',
        '600': '#3b6047',
        '700': '#34553f',
        '800': '#273e2f',
        '900': '#213327',
        '950': '#121c16',
      },
    },

    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
    screens: {
      'xs': '300px',
      'sm': '540px',
      'md': '720px',
      'lg': '1020px',
      'xl': '1500px'
    },
  },
  plugins: [],
};
export default config;
