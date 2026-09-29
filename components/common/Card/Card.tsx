import React from "react";
import styles from "./Card.module.css";

interface CardProps {
    children: React.ReactNode;
    className?: string;

}

function Card({ children, className }: CardProps) {
    return <section className={`${styles.card} ${className ?? ""} p-6 md:p-8`}>
        {children}
    </section>;
}

export default Card;
