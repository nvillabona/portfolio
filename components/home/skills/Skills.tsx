import React from "react";
import { useTranslations } from "next-intl";
import { libraries, languages, otherTools } from "./constants";
import Image from "next/image";

interface Skill {
  name: string;
  icon: string;
}

function Skills() {
  const t = useTranslations("Skills");
  return (
    <>
      <h2 className="text-3xl font-semibold mb-2">{t("heading")}</h2>

      <SkillCategory title={t("languages")} skills={languages} />
      <SkillCategory title={t("libraries")} skills={libraries} />
      <SkillCategory title={t("otherTools")} skills={otherTools} />
    </>
  );
}

function SkillCategory({ title, skills }: { title: string; skills: Skill[] }) {
  return (
    <>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <div className="grid place-items-center xl:grid-cols-6 md:grid-cols-4 xs:grid-cols-3 mb-3 gap-2">
        {skills.map((skill) => (
          <SkillImage key={skill.name} skill={skill} />
        ))}
      </div>
    </>
  );
}

function SkillImage({ skill }: { skill: Skill }) {
  return (
    <Image
      className="mr-2"
      src={skill.icon}
      width={50}
      height={50}
      alt={skill.name}
      title={skill.name}
    />
  );
}

export default Skills;
