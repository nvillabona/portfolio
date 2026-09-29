'use client'
import { useTranslations } from 'next-intl'
import React from 'react'
import styles from "./Navbar.module.css"
import { Link, usePathname } from '@/i18n/navigation'
import LanguageSwitcher from './LanguageSwitcher'

function Navbar() {
    const pathname = usePathname()
    const t = useTranslations('Navbar')
    return (
        <nav className={styles.navContainer}>
            <div className={styles.navInner}>
            <Link href="/" className={styles.brand} aria-label="Nicolás Villabona">
                <span className={styles.monogram} aria-hidden="true">NV</span>
                <span className={styles.brandName}>Nicolás Villabona</span>
            </Link>
            <div className={styles.navLinks}>
                <Link
                    href="/"
                    className={pathname === '/' ? styles.selected : ""}
                    aria-current={pathname === '/' ? 'page' : undefined}
                >
                    {t('home')}
                </Link>
                <Link
                    href="/about"
                    className={pathname === '/about' ? styles.selected : ""}
                    aria-current={pathname === '/about' ? 'page' : undefined}
                >
                    {t('about')}
                </Link>
                <Link
                    href="/contact"
                    className={pathname === '/contact' ? styles.selected : ""}
                    aria-current={pathname === '/contact' ? 'page' : undefined}
                >
                    {t('contact')}
                </Link>
            </div>
            <div className={styles.navActions}>
                <LanguageSwitcher />
            </div>
            </div>
        </nav>
    )
}

export default Navbar
