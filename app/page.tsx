import Image from "next/image";
import styles from "./page.module.css";
import Card from "@/components/common/Card/Card";
import Skills from "@/components/home/skills/Skills";
import Experience from "@/components/home/experience/Experience";
import Social from "@/components/common/Social/Social";

export default function Home() {
  return (
    <>
      <Card>
        <div className="grid lg:grid-cols-2 xs:grid-cols-1 gap-4">
          <div>
            <h1
              className={`
                sm:text-5xl xs:text-3xl 
                font-semibold 
                mb-1 
                xs:max-w-72 sm:max-w-md
                ${styles.typewriter}`}
            >
              Nicolás Villabona
            </h1>
            <p className="text-2xl font-normal">
              I&apos;m a sofware developer from Cali, Colombia.
            </p>
          </div>
          <div className="flex justify-center">
            <Image
              src="/memoji.webp"
              width={300}
              height={300}
              alt="me"
              quality={90}
              priority={true}
            />
          </div>
        </div>
      </Card>
      <div className="grid md:grid-cols-2 xs:grid-cols-1 w-full gap-4">
        <Card className="card w-full">
          <Skills />
        </Card>
        <Card className="card w-full">
          <Experience />
        </Card>
      </div>

      <Social />
    </>
  );
}
