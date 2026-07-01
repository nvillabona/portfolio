"use client";
import Image from "next/image";
import { useTranslations } from "next-intl";
import React from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { experiences } from "./constants";

interface Job {
  title: string;
  period: string;
}

function Experience() {
  const pathname = usePathname();
  const t = useTranslations("Experience");
  const jobs = t.raw("jobs") as Job[];
  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <h2 className="text-3xl font-semibold mb-4">{t("heading")}</h2>

        <ul className="list-disc ml-4">
          {experiences.map((experience, index) => (
            <li
              key={index}
              className="mb-4 pb-4 border-b-2 border-tom-thumb-700 last:border-b-0"
            >
              <h3 className="text-xl font-semibold">{jobs[index].title}</h3>
              {experience.companyUrl ? (
                <a
                  className="text-tom-thumb-400 text-xl font-normal"
                  href={experience.companyUrl}
                  target="__blank"
                >
                  {experience.company}
                </a>
              ) : (
                <p className="text-tom-thumb-400 text-xl font-normal">
                  {experience.company}
                </p>
              )}
              <p className="text-sm font-normal">{jobs[index].period}</p>
              {experience.technologies && pathname === "/about" && (
                <>
                  <p className="text-xl font-normal mt-2">
                    {t("technologiesUsed")}
                  </p>
                  <div className="grid md:grid-cols-12 xs:grid-cols-6 gap-2 mt-2">
                    {experience.technologies.map((tech, index) => (
                      <Image
                        key={index}
                        src={tech.icon}
                        width={50}
                        height={50}
                        alt={tech.name}
                        title={tech.name}
                      />
                    ))}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex md:justify-end xs:justify-center">
        {pathname === "/" && (
          <Link
            href="/about"
            className="bg-transparent text-white font-semibold p-2 rounded-lg mt-4 ml-4 hover:underline"
          >
            {t("readMore")}
          </Link>
        )}
      </div>
    </div>
  );
}

export default Experience;
