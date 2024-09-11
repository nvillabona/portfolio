import React from "react";
import { libraries, languages, otherTools } from "./constants";
import Image from "next/image";

interface Skill {
  name: string;
  icon: string;
}

function Skills() {
  return (
    <>
      <h2 className="text-3xl font-semibold mb-2">My Skills</h2>

      <SkillCategory title="Languages" skills={languages} />
      <SkillCategory title="Libraries and frameworks" skills={libraries} />
      <SkillCategory title="Other tools" skills={otherTools} />
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
