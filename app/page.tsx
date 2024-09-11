import Image from "next/image";
import { Jersey_10 } from "next/font/google"
import styles from "./page.module.css"
import Card from "@/components/common/Card";
import Skills from "@/components/home/skills/Skills";

const jersey = Jersey_10({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-jersey",
})

export default function Home() {
  return (
    <>
      <Card>
        <div className="p-4 grid lg:grid-cols-2 xs:grid-cols-1 gap-4">
          <div>
            <h1 className={`sm:text-5xl xs:text-3xl font-semibold mb-1 ${styles.typewriter}`}>Nicolás Villabona</h1>
            <p className="text-2xl font-normal">I&apos;m a sofware developer from Cali, Colombia.</p>
          </div>
          <div className="flex justify-center">
            <Image src="/memoji.webp" width={300} height={300} alt="me" quality={80} priority={true} />
          </div>
        </div>
      </Card>
      <div className="grid md:grid-cols-2 xs:grid-cols-1 w-full gap-4">
        <Card className="card w-full p-4">
          <Skills />
        </Card>
        <Card className="card w-full p-4">
          <h2 className="text-3xl font-semibold">My Experience</h2>

        </Card>
      </div>
    </>
  );
}
