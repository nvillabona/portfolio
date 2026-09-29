import { useTranslations } from "next-intl";
import React from "react";
import { Link } from "@/i18n/navigation";
import { experiences } from "./constants";
import SectionTitle from "@/components/common/SectionTitle";
import { TechList } from "@/components/common/TechChip/TechChip";

interface ExperienceProps {
  // Full view (About page): shows technologies instead of the "read more" link
  showDetails?: boolean;
}

function Experience({ showDetails = false }: ExperienceProps) {
  const t = useTranslations("Experience");
  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <SectionTitle>{t("heading")}</SectionTitle>

        {/* Timeline: a vertical rule with one dot per job; the current job gets a filled dot */}
        <ol className="relative ml-2 border-l border-white/15">
          {experiences.map((experience, index) => (
            <li key={experience.id} className="relative mb-6 pl-6 last:mb-0">
              <span
                aria-hidden="true"
                className={`absolute -left-[7px] top-1.5 h-3 w-3 rounded-full border-2 ${
                  index === 0 ? "border-accent bg-accent" : "border-tom-thumb-300 bg-tom-thumb-900"
                }`}
              />
              <p className="mb-1 inline-block rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-tom-thumb-100">
                {t(`jobs.${experience.id}.period`)}
              </p>
              <h3 className="text-lg font-bold leading-snug">
                {t(`jobs.${experience.id}.title`)}
              </h3>
              {experience.companyUrl ? (
                <a
                  className="text-tom-thumb-200 underline-offset-4 hover:underline"
                  href={experience.companyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {experience.company} ↗
                </a>
              ) : (
                <p className="text-tom-thumb-200">{experience.company}</p>
              )}
              {showDetails && (
                <div className="mt-3">
                  <p className="sr-only">{t("technologiesUsed")}</p>
                  <TechList items={experience.technologies} />
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
      {!showDetails && (
        <div className="mt-6 flex md:justify-end xs:justify-center">
          <Link
            href="/about"
            className="rounded-lg border border-white/20 px-4 py-2 font-bold transition-colors hover:bg-white/10"
          >
            {t("readMore")}
          </Link>
        </div>
      )}
    </div>
  );
}

export default Experience;
