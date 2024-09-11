import Card from "@/components/common/Card/Card";
import Social from "@/components/common/Social/Social";
import Image from "next/image";
import React from "react";

function page() {
    return (
        <Card className="grid md:grid-cols-2 xs:grid-cols-1">
            <div className="flex flex-col xs:text-center md:text-start">
                <h1
                    className="sm:text-5xl xs:text-3xl 
                font-semibold 
                mb-1 "
                >
                    Contact
                </h1>
                <p className="text-2xl font-normal">
                    You can contact me at
                </p>
                <Social />
            </div>
            <div className="flex justify-center">
                <Image src="/contact.webp" width={300} height={300} alt="contact me" quality={90} priority={true} />
            </div>
        </Card>
    );
}

export default page;
