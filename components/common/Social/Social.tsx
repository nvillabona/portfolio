import Image from "next/image";
import React from "react";
import { socialIcons } from "@/lib/icons";

const socialNetworks = [
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/nvillabona/",
    icon: socialIcons.linkedin,
  },
  {
    name: "Github",
    url: "https://github.com/nvillabona/",
    icon: socialIcons.github,
  },
  {
    name: "GitLab",
    url: "https://gitlab.com/nvillabona/",
    icon: socialIcons.gitlab,
  },
  {
    name: "BlueSky",
    url: "https://bsky.app/profile/nvillabona.bsky.social",
    icon: socialIcons.bluesky
  },
  {
    name: "Twitter",
    url: "https://twitter.com/n_villabona/",
    icon: socialIcons.twitter,
  },
  {
    name: "Duolingo",
    url: "https://www.duolingo.com/profile/nvillabona",
    icon: socialIcons.duolingo,
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
          rel="noopener noreferrer"
          aria-label={network.name}
        >
          <Image
            src={network.icon}
            alt=""
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
