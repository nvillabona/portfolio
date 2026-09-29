import React from "react";
import { useTranslations } from "next-intl";
import { libraries, languages, otherTools } from "./constants";
import type { Tech as Skill } from "@/lib/icons";
import SectionTitle from "@/components/common/SectionTitle";
import { TechList } from "@/components/common/TechChip/TechChip";

function Skills() {
  const t = useTranslations("Skills");
  return (
    <>
      <SectionTitle>{t("heading")}</SectionTitle>

      <SkillCategory title={t("languages")} skills={languages} />
      <SkillCategory title={t("libraries")} skills={libraries} />
      <SkillCategory title={t("otherTools")} skills={otherTools} />
    </>
  );
}

function SkillCategory({ title, skills }: { title: string; skills: Skill[] }) {
  return (
    <div className="mb-5 last:mb-0">
      <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-tom-thumb-200">{title}</h3>
      <TechList items={skills} />
    </div>
  );
}

export default Skills;
