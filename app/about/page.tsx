import Card from "@/components/common/Card/Card";
import Experience from "@/components/home/experience/Experience";
import Image from "next/image";
import React from "react";

function page() {
  return (
    <>
      <Card>
        <div className="grid md:grid-cols-2 xs:grid-cols-1">
          <div>
            <h1 className="text-3xl font-semibold">About</h1>
            <p className="mb-2">
              I’m <strong>Nicolás Villabona</strong>, a Frontend Developer with
              over four years of experience. I specialize in React and Vue,
              creating dynamic, scalable web applications. I’m skilled in HTML,
              CSS, Sass, and UI libraries like Tailwind and Material UI,
              ensuring both functionality and aesthetics.
            </p>
            <p>
              My background spans e-commerce, internal apps, and web3 projects.
              I’m always learning, currently focused on TypeScript and
              microfrontends.I’m driven by innovation and teamwork.
            </p>
          </div>
          <div className="flex justify-center items-center">
            <Image
              src="/me.webp"
              width={300}
              height={300}
              alt="me"
              quality={90}
              priority={true}
            />
          </div>
        </div>
      </Card>
      <Card className="mb-5">
        <h2 className="text-3xl font-semibold mb-4">Languages I speak</h2>
        <div className="grid md:grid-cols-4 xs:grid-cols-2 place-items-center">
          <div className="flex flex-col items-center justify-center mb-2">
            <Image
              src="https://img.icons8.com/?size=100&id=15495&format=png&color=000000"
              width={50}
              height={50}
              alt="Colombia"
              quality={90}
              priority={true}
            />
            <p>Spanish</p>
            <p className="text-tom-thumb-400">Native</p>
          </div>
          <div className="flex flex-col items-center justify-center mb-2">
            <Image
              src="https://img.icons8.com/?size=100&id=15532&format=png&color=000000"
              width={50}
              height={50}
              alt="Usa"
              quality={90}
              priority={true}
            />
            <p>English</p>
            <p className="text-tom-thumb-400">Advanced</p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <Image
              src="https://img.icons8.com/?size=100&id=15497&format=png&color=000000"
              width={50}
              height={50}
              alt="France"
              quality={90}
              priority={true}
            />
            <p>French</p>
            <p className="text-tom-thumb-400">Intermediate</p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <Image
              src="https://img.icons8.com/?size=100&id=15527&format=png&color=000000"
              width={50}
              height={50}
              alt="Sweden"
              quality={90}
              priority={true}
            />
            <p>Swedish</p>
            <p className="text-tom-thumb-400">Basic</p>
          </div>
        </div>
      </Card>
      <Card className="mb-5">
        <Experience />
      </Card>
    </>
  );
}

export default page;
