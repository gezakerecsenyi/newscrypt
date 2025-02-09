import useLocale from "./useLocale";

export default function Footer() {
    const localizer = useLocale();

    return (
        <footer>
            <p className="email">
                <a href="mailto:newscryptteam@gmail.com" className="email-link">{localizer('Email us')}</a>
                <span className="blinking-cursor">|</span>
            </p>
            <p className='credits'>
                {localizer('Created by Geza Kerecsenyi and Alex Barron at ETH Oxford 2025. Published under MIT.')} <a href='https://github.com/gezakerecsenyi/newscrypt' target='_blank'>GitHub</a>
            </p>
        </footer>
    )
}