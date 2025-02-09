import Cookies from "js-cookie";

const i18n = {
    "Summary": {
        "fr": "Résumé",
        "de": "Zusammenfassung",
        "es": "Resumen",
        "zh": "摘要"
    },
    "Tweets": {
        "fr": "Tweets",
        "de": "Tweets",
        "es": "Tweets",
        "zh": "推文"
    },
    "Send": {
        "fr": "Envoyer",
        "de": "Senden",
        "es": "Enviar",
        "zh": "发送"
    },
    "Email us": {
        "fr": "Envoyez-nous un e-mail",
        "de": "Schreiben Sie uns eine E-Mail",
        "es": "Envíanos un correo",
        "zh": "给我们发送电子邮件"
    },
    "Created by Geza Kerecsenyi and Alex Barron at ETH Oxford 2025. Published under MIT.": {
        "fr": "Créé par Geza Kerecsenyi et Alex Barron à ETH Oxford 2025. Publié sous licence MIT.",
        "de": "Erstellt von Geza Kerecsenyi und Alex Barron an der ETH Oxford 2025. Veröffentlicht unter der MIT-Lizenz.",
        "es": "Creado por Geza Kerecsenyi y Alex Barron en ETH Oxford 2025. Publicado bajo la licencia MIT.",
        "zh": "由 Geza Kerecsenyi 和 Alex Barron 于 2025 年在 ETH Oxford 创建。MIT 许可下发布。"
    },
    "Type a message...": {
        "fr": "Tapez un message...",
        "de": "Nachricht eingeben...",
        "es": "Escribe un mensaje...",
        "zh": "输入消息..."
    },
    "Welcome! Choose your display name.": {
        "fr": "Bienvenue ! Choisissez votre nom d'affichage.",
        "de": "Willkommen! Wählen Sie Ihren Anzeigenamen.",
        "es": "¡Bienvenido! Elige tu nombre visible.",
        "zh": "欢迎！请选择您的显示名称。"
    },
    "Choose any name you feel comfortable using publicly.": {
        "fr": "Choisissez un nom avec lequel vous êtes à l'aise en public.",
        "de": "Wählen Sie einen Namen, mit dem Sie sich öffentlich wohlfühlen.",
        "es": "Elige un nombre con el que te sientas cómodo en público.",
        "zh": "请选择一个您在公开场合使用时感到舒适的名字。"
    },
    "Submit": {
        "fr": "Soumettre",
        "de": "Absenden",
        "es": "Enviar",
        "zh": "提交"
    },
    "Sign in with your face.": {
        "fr": "Connectez-vous avec votre visage.",
        "de": "Melden Sie sich mit Ihrem Gesicht an.",
        "es": "Inicia sesión con tu rostro.",
        "zh": "使用人脸登录。"
    },
    "Enter or choose your passphrase.": {
        "fr": "Saisissez ou choisissez votre phrase de passe.",
        "de": "Geben Sie Ihr Passwort ein oder wählen Sie eines.",
        "es": "Introduce o elige tu frase de contraseña.",
        "zh": "输入或选择您的密码短语。"
    },
    "Enter your username.": {
        "fr": "Entrez votre nom d'utilisateur.",
        "de": "Geben Sie Ihren Benutzernamen ein.",
        "es": "Introduce tu nombre de usuario.",
        "zh": "输入您的用户名。"
    }
} as const;

export default function useLocale() {
    const locale = Cookies.get("locale") || 'en';

    // @ts-ignore
    return (english: keyof typeof i18n): string => locale === 'en' ? english : i18n[english][locale];
}