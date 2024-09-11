'use client'
import Link from 'next/link'
import React from 'react'
import styles from "./Navbar.module.css"
import { usePathname } from 'next/navigation'

function Navbar() {
    const pathname = usePathname()
    return (
        <nav className={styles.navContainer}>
            <Link href="/" className={pathname === '/' ? styles.selected : ""}>
                Home
            </Link>
            <Link href="/about" className={pathname === '/about' ? styles.selected : ""}>
                About me
            </Link>
            <Link href="/contact" className={pathname === '/contact' ? styles.selected : ""}>
                Contact
            </Link>
        </nav>
    )
}

export default Navbar
