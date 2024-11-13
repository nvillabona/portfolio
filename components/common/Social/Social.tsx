"use client";
import Image from "next/image";
import React from "react";

const socialNetworks = [
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/nvillabona/",
    icon: "https://img.icons8.com/?size=100&id=8808&format=png&color=FFFFFF",
  },
  {
    name: "Github",
    url: "https://github.com/nvillabona/",
    icon: "https://img.icons8.com/?size=100&id=3tC9EQumUAuq&format=png&color=FFFFFF",
  },
  {
    name: "GitLab",
    url: "https://gitlab.com/nvillabona/",
    icon: "https://img.icons8.com/?size=100&id=41316&format=png&color=FFFFFF",
  },
  {
    name: "BlueSky",
    url: "https://bsky.app/profile/nvillabona.bsky.social",
    icon: "https://img.icons8.com/?size=100&id=9229&format=png&color=FFFFFF"
  },
  {
    name: "Twitter",
    url: "https://twitter.com/n_villabona/",
    icon: "https://img.icons8.com/?size=100&id=phOKFKYpe00C&format=png&color=FFFFFF",
  },
  {
    name: "Duolingo",
    url: "https://www.duolingo.com/profile/nvillabona",
    icon: "https://img.icons8.com/?size=100&id=MDx6xPlDLmZR&format=png&color=FFFFFF",
  },
];

function Social() {
  return (
    <div className="flex xs:justify-around md:justify-center w-full mb-4">
      {socialNetworks.map((network) => (
        <a
          key={network.name}
          className="bg-tom-thumb-500 md:mx-4  p-2 rounded-3xl mt-4 w-10 hover:bg-tom-thumb-300"
          href={network.url}
          target="_blank"
          rel="noreferrer"
        >
          <Image
            src={network.icon}
            alt={network.name}
            height={25}
            width={25}
            title={network.name}
          />
        </a>
      ))}
    </div>
  );
}

export default Social;
