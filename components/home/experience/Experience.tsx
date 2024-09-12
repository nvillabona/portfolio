"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { experiences } from "./constants";

function Experience() {
  const pathname = usePathname();
  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <h2 className="text-3xl font-semibold mb-4">My Experience</h2>

        <ul className="list-disc ml-4">
          {experiences.map((experience, index) => (
            <li
              key={index}
              className="mb-4 pb-4 border-b-2 border-tom-thumb-700 last:border-b-0"
            >
              <h3 className="text-xl font-semibold">{experience.title}</h3>
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
              <p className="text-sm font-normal">{experience.period}</p>
              {experience.technologies && pathname === "/about" && (
                <>
                  <p className="text-xl font-normal mt-2">Technologies used:</p>
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
            Read more about me ➤
          </Link>
        )}
      </div>
    </div>
  );
}

export default Experience;
