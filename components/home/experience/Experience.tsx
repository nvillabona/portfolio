import React from "react";

function Experience() {
  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <h2 className="text-3xl font-semibold">My Experience</h2>

        <ul className="list-disc">
          <li>
            <h3 className="text-2xl font-semibold">Web UI Developer</h3>
            <a
              className="text-emerald-500 text-xl font-normal"
              href="https://www.globant.com/"
              target="__blank"
            >
              Globant
            </a>
            <p className="text-xl font-normal"> June 2022 - Present</p>
          </li>
          <li>
            <h3 className="text-2xl font-semibold">Software Developer</h3>
            <p className="text-emerald-500 text-xl font-normal">Freelance</p>
            <p className="text-xl font-normal">Dec 2021 - June 2022</p>
          </li>
        </ul>
      </div>
      <div className="flex md:justify-end xs:justify-center">
        <button className="bg-tom-thumb-500 text-white font-semibold p-2 rounded-lg mt-4">
          Download Resume
        </button>
        <button className="bg-transparent text-white font-semibold p-2 rounded-lg mt-4 ml-4 hover:underline">
          See all my experience ➤{" "}
        </button>
      </div>
    </div>
  );
}

export default Experience;
