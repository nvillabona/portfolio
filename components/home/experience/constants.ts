import { tech, type Tech } from "@/lib/icons";

export interface ExperienceEntry {
    // Key into the Experience.jobs translations
    id: string;
    company: string;
    companyUrl?: string;
    technologies: Tech[];
}

export const experiences: ExperienceEntry[] = [
    {
        id: "perficient",
        company: "Perficient",
        companyUrl: "https://www.perficient.com/",
        technologies: [
            tech.javascript,
            tech.typescript,
            tech.react,
            { ...tech.vite, name: "Vite with module federation" },
        ],
    },
    {
        id: "globant",
        company: "Globant",
        companyUrl: "https://www.globant.com/",
        technologies: [
            tech.javascript,
            tech.typescript,
            tech.react,
            { ...tech.webpack, name: "Webpack Module Federation" },
            tech.jest,
            tech.testingLibrary,
        ],
    },
    {
        id: "freelance",
        company: "Freelance",
        technologies: [tech.javascript, tech.php, tech.vue, tech.tailwind, tech.laravel],
    },
    {
        id: "waco",
        company: "Waco Services",
        technologies: [tech.javascript, tech.react, tech.materialUi],
    },
];
