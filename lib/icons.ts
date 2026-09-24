const icons8 = (id: string, color = "000000") =>
  `https://img.icons8.com/?size=100&id=${id}&format=png&color=${color}`;

export interface Tech {
  name: string;
  icon: string;
}

export const tech = {
  javascript: { name: "JavaScript", icon: icons8("108784") },
  typescript: { name: "TypeScript", icon: icons8("uJM6fQYqDaZK") },
  html: { name: "Html", icon: icons8("20909") },
  css: { name: "Css", icon: icons8("7gdY5qNXaKC0") },
  php: { name: "Php", icon: icons8("fAMVO_fuoOuC") },
  sql: { name: "SQL", icon: icons8("13406") },
  react: { name: "React", icon: icons8("122637", "A9E3FF") },
  nextjs: { name: "Next.js", icon: icons8("MWiBjkuHeMVq") },
  vue: { name: "Vue", icon: icons8("rY6agKizO9eb") },
  laravel: { name: "Laravel", icon: icons8("lRjcvhvtR81o") },
  git: { name: "Git", icon: icons8("20906") },
  jest: { name: "Jest", icon: icons8("bp24DwGXJDyT") },
  testingLibrary: { name: "Testing Library", icon: icons8("Ua2GvZ1QPsy0") },
  tailwind: { name: "Tailwind", icon: icons8("4PiNHtUJVbLs") },
  materialUi: { name: "Material UI", icon: icons8("gFw7X5Tbl3ss") },
  webpack: { name: "Webpack", icon: icons8("QjbHx7WUskg1") },
  vite: { name: "Vite", icon: icons8("YO3YqSaTOu5K") },
} satisfies Record<string, Tech>;

export const flags = {
  colombia: icons8("15495"),
  usa: icons8("15532"),
  france: icons8("15497"),
  sweden: icons8("15527"),
};

export const socialIcons = {
  linkedin: icons8("8808", "FFFFFF"),
  github: icons8("3tC9EQumUAuq", "FFFFFF"),
  gitlab: icons8("41316", "FFFFFF"),
  bluesky: icons8("9229", "FFFFFF"),
  twitter: icons8("phOKFKYpe00C", "FFFFFF"),
  duolingo: icons8("MDx6xPlDLmZR", "FFFFFF"),
};
