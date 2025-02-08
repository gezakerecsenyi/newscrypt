import logo from './logo.png';

export default function Header() {
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
                <select>
                    <option value="en">EN</option>
                    <option value="es">ES</option>
                    <option value="fr">FR</option>
                    <option value="de">DE</option>
                    <option value="zh">中文</option>
                </select>
            </div>
            <h2 className="tagline">#cryptotwt unravelled</h2>
        </header>
    );
}