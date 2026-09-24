'use client'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { flags } from '@/lib/icons'
import styles from './LanguageSwitcher.module.css'

const LOCALE_META: Record<string, { name: string; flag: string }> = {
    en: {
        name: 'English',
        flag: flags.usa,
    },
    es: {
        name: 'Español',
        flag: flags.colombia,
    },
    fr: {
        name: 'Français',
        flag: flags.france,
    },
    sv: {
        name: 'Svenska',
        flag: flags.sweden,
    },
}

function LanguageSwitcher() {
    const locale = useLocale()
    const pathname = usePathname()
    const router = useRouter()
    const t = useTranslations('Navbar')
    const [open, setOpen] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) return

        function handlePointerDown(event: MouseEvent) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setOpen(false)
            }
        }
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') setOpen(false)
        }

        document.addEventListener('mousedown', handlePointerDown)
        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('mousedown', handlePointerDown)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [open])

    function selectLocale(nextLocale: string) {
        setOpen(false)
        if (nextLocale !== locale) {
            router.replace(pathname, { locale: nextLocale })
        }
    }

    const current = LOCALE_META[locale]

    return (
        <div className={styles.wrapper} ref={wrapperRef}>
            <button
                type="button"
                className={styles.trigger}
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-label={t('language')}
            >
                <Image
                    src={current.flag}
                    alt=""
                    width={18}
                    height={18}
                    className={styles.flag}
                />
                <span className={styles.code}>{locale}</span>
                <span
                    className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
                    aria-hidden="true"
                />
            </button>

            {open && (
                <ul className={styles.dropdown}>
                    {routing.locales.map((loc, index) => (
                        <li
                            key={loc}
                            className={styles.item}
                            style={{ animationDelay: `${index * 35}ms` }}
                        >
                            <button
                                type="button"
                                aria-current={loc === locale ? 'true' : undefined}
                                lang={loc}
                                className={`${styles.option} ${loc === locale ? styles.optionActive : ''
                                    }`}
                                onClick={() => selectLocale(loc)}
                            >
                                <Image
                                    src={LOCALE_META[loc].flag}
                                    alt=""
                                    width={22}
                                    height={22}
                                    className={styles.flag}
                                />
                                <span>{LOCALE_META[loc].name}</span>
                                {loc === locale && (
                                    <span className={styles.stamp} aria-hidden="true" />
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default LanguageSwitcher
