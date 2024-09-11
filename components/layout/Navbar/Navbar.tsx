import Link from 'next/link'
import React from 'react'
import styles from "./Navbar.module.css"

function Navbar() {
    return (
        <nav className={styles.navContainer}>
            <Link href="/">
                Home
            </Link>
            <Link href="/">
                About me
            </Link>
            <Link href="/">
                Contact
            </Link>
        </nav>
    )
}

export default Navbar
