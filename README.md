# Nicolás Villabona — Portfolio

Personal portfolio site built with [Next.js](https://nextjs.org/) (App Router), [Tailwind CSS](https://tailwindcss.com/) and [next-intl](https://next-intl.dev/).

The site is available in English, Spanish, French and Swedish. English is served without a URL prefix; other languages live under `/es`, `/fr` and `/sv`.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` – start the development server
- `npm run build` – create a production build
- `npm run start` – serve the production build
- `npm run lint` – run ESLint

## Project structure

- `app/[locale]/` – pages (home, about, contact) and the root layout
- `components/` – UI components (layout, cards, skills, experience, social links)
- `lib/icons.ts` – shared icon URLs for technologies, flags and social networks
- `messages/` – translation files, one per locale
- `i18n/` – next-intl routing, navigation and request config
- `proxy.ts` – locale detection and redirects

## Adding a translation

1. Add the locale to `i18n/routing.ts`.
2. Create `messages/<locale>.json` with the same keys as `messages/en.json`.
3. Add its name and flag to `LOCALE_META` in `components/layout/Navbar/LanguageSwitcher.tsx`.
