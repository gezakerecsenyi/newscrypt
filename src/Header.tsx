import logo from './logo.png';
import {useCallback, useState} from "react";
import Cookies from "js-cookie";
import useLocale from "./useLocale";
import {Debate, User} from "./types";

interface Props {
    authState?: [User | null, (state: User | null) => void]
}

export default function Header(
    {
        authState,
    }: Props
) {
    const [locale, setLocale] = useState(Cookies.get('locale') || 'en');
    const updateLanguage = useCallback((language: string) => {
        Cookies.set('locale', language, {expires: 10000});
        document.location.reload();
    }, []);

    const localizer = useLocale();

    const signOut = useCallback(() => {
        Cookies.remove('authToken');
        document.location.reload();
    }, []);

    return (
        <header>
            <div className="logo-container">
                <img className="logo" src={logo} alt="NewsCrypt logo"/>
            </div>
            <div className="language-selector">
                <img
                    className="globe-icon"
                    src="https://img.icons8.com/ios-filled/50/000000/globe.png"
                     alt="Language Selector"
                />
                <select
                    onChange={(e) => updateLanguage(e.target.value)}
                    value={locale}
                >
                    <option value="en">EN</option>
                    <option value="es">ES</option>
                    <option value="fr">FR</option>
                    <option value="de">DE</option>
                    <option value="zh">中文</option>
                </select>
            </div>
            <h2 className="tagline">#cryptotwt unravelled</h2>
            {
                authState && authState[0] && (
                    <button className='signout-float' onClick={signOut}>
                        {localizer('Sign out')}
                    </button>
                )
            }
        </header>
    );
}