import Image from "next/image";
import { Jersey_10 } from "next/font/google"
import styles from "./page.module.css"
import Card from "@/components/common/Card";

const jersey = Jersey_10({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-jersey",
})

export default function Home() {
  return (
    <>
      <main className={`${jersey.className} flex min-h-screen flex-col items-center gap-4 md:px-10 lg:px-24 xl:px-60 xs:px-4 `}>
        <Card>
          <div className="p-4 grid lg:grid-cols-2 xs:grid-cols-1 gap-4">
            <div>
              <h1 className={`sm:text-5xl xs:text-3xl font-semibold mb-1 ${styles.typewriter}`}>Nicolás Villabona</h1>
              <p className="text-2xl font-light">Frontend Developer</p>
            </div>
            <div className="flex justify-center">
              <Image src="/memoji.webp" width={300} height={200} alt="me" quality={100} />
            </div>
          </div>
        </Card>
        <div className="grid md:grid-cols-3 xs:grid-cols-1 w-full">
          <Card className="card w-full p-4">
            Hola
          </Card>
          <Card className="card w-full p-4">
            Hola
          </Card>
          <Card className="card w-full p-4">
            Hola
          </Card>
        </div>
      </main>
    </>
  );
}
