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
            <div className={styles.navSpacer} aria-hidden="true" />
            <div className={styles.navLinks}>
                <Link href="/" className={pathname === '/' ? styles.selected : ""}>
                    {t('home')}
                </Link>
                <Link href="/about" className={pathname === '/about' ? styles.selected : ""}>
                    {t('about')}
                </Link>
                <Link href="/contact" className={pathname === '/contact' ? styles.selected : ""}>
                    {t('contact')}
                </Link>
            </div>
            <div className={styles.navActions}>
                <LanguageSwitcher />
            </div>
        </nav>
    )
}

export default Navbar
