import React from "react";
import styles from "./Card.module.css";

interface CardProps {
    children: React.ReactNode;
    className?: string;

}

function Card({ children, className }: CardProps) {
    return <section className={`${styles.card} ${className}`}>{children}</section>;
}

export default Card;
