// Icons are self-hosted SVGs in /public/icons (brand logos from Simple Icons, flags from flag-icons)
const icon = (path: string) => `/icons/${path}.svg`;

export interface Tech {
  name: string;
  icon: string;
}

export const tech = {
  javascript: { name: "JavaScript", icon: icon("tech/javascript") },
  typescript: { name: "TypeScript", icon: icon("tech/typescript") },
  html: { name: "Html", icon: icon("tech/html") },
  css: { name: "Css", icon: icon("tech/css") },
  php: { name: "Php", icon: icon("tech/php") },
  sql: { name: "SQL", icon: icon("tech/sql") },
  react: { name: "React", icon: icon("tech/react") },
  nextjs: { name: "Next.js", icon: icon("tech/nextjs") },
  vue: { name: "Vue", icon: icon("tech/vue") },
  laravel: { name: "Laravel", icon: icon("tech/laravel") },
  git: { name: "Git", icon: icon("tech/git") },
  jest: { name: "Jest", icon: icon("tech/jest") },
  testingLibrary: { name: "Testing Library", icon: icon("tech/testingLibrary") },
  tailwind: { name: "Tailwind", icon: icon("tech/tailwind") },
  materialUi: { name: "Material UI", icon: icon("tech/materialUi") },
  webpack: { name: "Webpack", icon: icon("tech/webpack") },
  vite: { name: "Vite", icon: icon("tech/vite") },
} satisfies Record<string, Tech>;

export const flags = {
  colombia: icon("flags/colombia"),
  usa: icon("flags/usa"),
  france: icon("flags/france"),
  sweden: icon("flags/sweden"),
};

export const socialIcons = {
  linkedin: icon("social/linkedin"),
  github: icon("social/github"),
  gitlab: icon("social/gitlab"),
  bluesky: icon("social/bluesky"),
  twitter: icon("social/twitter"),
  duolingo: icon("social/duolingo"),
};
