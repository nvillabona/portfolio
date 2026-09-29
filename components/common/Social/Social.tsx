import Image from "next/image";
import React from "react";
import { socialIcons } from "@/lib/icons";

export const socialNetworks = [
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
    name: "X",
    url: "https://x.com/n_villabona",
    icon: socialIcons.twitter,
  },
  {
    name: "Duolingo",
    url: "https://www.duolingo.com/profile/nvillabona",
    icon: socialIcons.duolingo,
  },
];

function Social({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-3 ${className}`}>
      {socialNetworks.map((network) => (
        <li key={network.name}>
          <a
            className="flex h-11 w-11 items-center justify-center rounded-full bg-tom-thumb-600 transition-colors hover:bg-tom-thumb-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            href={network.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={network.name}
            title={network.name}
          >
            <Image src={network.icon} alt="" height={22} width={22} />
          </a>
        </li>
      ))}
    </ul>
  );
}

export default Social;
