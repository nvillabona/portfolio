import Image from "next/image";
import type { Tech } from "@/lib/icons";

// Icon + label pill, so every technology is readable without hovering
function TechChip({ tech }: { tech: Tech }) {
  return (
    <li className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 py-1.5 pl-2 pr-3 text-sm">
      <Image src={tech.icon} width={20} height={20} alt="" />
      <span>{tech.name}</span>
    </li>
  );
}

export function TechList({ items }: { items: Tech[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <TechChip key={item.name} tech={item} />
      ))}
    </ul>
  );
}

export default TechChip;
