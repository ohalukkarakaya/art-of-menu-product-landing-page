#!/usr/bin/env python3
"""Build static, fully translated sales-partner pages from the Turkish layout.

Only writes the five partner landing-page files, not the main site or sitemap.
The /sales-partner/ entry point is a separate, language-detecting static file.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ROUTES = {
    "tr": "tr/satis-ortakligi",
    "en": "en/sales-partner",
    "de": "de/vertriebspartner",
    "es": "es/socios-comerciales",
    "it": "it/partner-commerciali",
    "fr": "fr/partenaires-commerciaux",
}
OG_LOCALES = {"tr": "tr_TR", "en": "en_US", "de": "de_DE", "es": "es_ES", "it": "it_IT", "fr": "fr_FR"}

# Exact source-text substitutions. Keys are source copy on /tr/satis-ortakligi/.
# Each row translates into English, German, Spanish, Italian and French respectively.
COPY = {
    "Satış Ortağı Ol | Art of Menu": [
        "Become a Sales Partner | Art of Menu", "Vertriebspartner werden | Art of Menu",
        "Hazte socio comercial | Art of Menu", "Diventa partner commerciale | Art of Menu",
        "Devenez partenaire commercial | Art of Menu",
    ],
    "Art of Menu'yu restoranlara ve kafelere tanıt, referans kodunla gerçekleşen ilk abonelik satışlarından komisyon kazan. Satış ortaklığı programını incele.": [
        "Introduce Art of Menu to restaurants and cafés. Earn commissions on first subscription sales made with your referral code. Explore our partner programme.",
        "Stelle Art of Menu Restaurants und Cafés vor. Verdiene Provisionen auf erste Aboverkäufe mit deinem Empfehlungscode. Entdecke unser Partnerprogramm.",
        "Presenta Art of Menu a restaurantes y cafeterías. Gana comisiones por las primeras suscripciones con tu código de referido. Descubre nuestro programa de socios.",
        "Presenta Art of Menu a ristoranti e bar. Guadagna commissioni sulle prime sottoscrizioni effettuate con il tuo codice di riferimento. Scopri il programma partner.",
        "Présentez Art of Menu aux restaurants et cafés. Touchez une commission sur les premiers abonnements souscrits avec votre code de parrainage. Découvrez notre programme partenaire.",
    ],
    "Art of Menu Satış Ortağı Ol": [
        "Become an Art of Menu Sales Partner", "Art of Menu Vertriebspartner werden",
        "Hazte socio comercial de Art of Menu", "Diventa partner commerciale Art of Menu",
        "Devenez partenaire commercial Art of Menu",
    ],
    "Restoranlara Art of Menu'yu tanıt. İlk başarılı abonelik satışlarından komisyon kazan.": [
        "Introduce Art of Menu to restaurants. Earn commissions from successful first subscription payments.",
        "Stelle Art of Menu Restaurants vor und verdiene Provisionen bei erfolgreichen ersten Abozahlungen.",
        "Presenta Art of Menu a restaurantes y gana comisiones por los primeros pagos de suscripción completados.",
        "Presenta Art of Menu ai ristoranti e guadagna commissioni sui primi pagamenti di abbonamento riusciti.",
        "Présentez Art of Menu aux restaurants et touchez une commission sur les premiers paiements d'abonnement effectués.",
    ],
    "İçeriğe geç": ["Skip to content", "Zum Inhalt springen", "Ir al contenido", "Vai al contenuto", "Aller au contenu"],
    "Art of Menu ana sayfa": ["Art of Menu home", "Art of Menu Startseite", "Inicio de Art of Menu", "Home di Art of Menu", "Accueil Art of Menu"],
    "Sayfa bağlantıları": ["Page links", "Seitennavigation", "Enlaces de la página", "Navigazione della pagina", "Navigation de la page"],
    "Ürünü incele": ["Explore the product", "Produkt ansehen", "Descubre el producto", "Scopri il prodotto", "Découvrir le produit"],
    "Satış ortağı hesabı oluştur": ["Create a partner account", "Partnerkonto erstellen", "Crea una cuenta de socio", "Crea un account partner", "Créer un compte partenaire"],
    "Satış ortağı ol": ["Become a partner", "Partner werden", "Hazte socio", "Diventa partner", "Devenir partenaire"],
    "Art of Menu satış ortaklığı": ["Art of Menu partner programme", "Art of Menu Partnerprogramm", "Programa de socios de Art of Menu", "Programma partner Art of Menu", "Programme partenaire Art of Menu"],
    "Restoranlara QR menü sat. ": [
        "Sell QR menus to restaurants. ", "Verkaufe QR-Speisekarten an Restaurants. ",
        "Vende menús QR a restaurantes. ", "Vendi menù QR ai ristoranti. ",
        "Vendez des menus QR aux restaurants. ",
    ],
    "Komisyon kazan.": ["Earn commission.", "Verdiene Provisionen.", "Gana comisiones.", "Guadagna commissioni.", "Gagnez des commissions."],
    "Art of Menu’nün dijital menü, masadan sipariş ve akıllı özelliklerini işletmelere sun. Referans kodunla abone olup ilk ödemesini tamamlayan her yeni işletmeden komisyon kazan.": [
        "Introduce Art of Menu's digital menus, table ordering and smart features to restaurants and cafés. Earn a commission whenever a new business subscribes with your referral code and makes its first payment.",
        "Stelle Restaurants und Cafés die digitalen Speisekarten, Tischbestellungen und smarten Funktionen von Art of Menu vor. Du erhältst eine Provision, wenn ein neuer Betrieb mit deinem Empfehlungscode ein Abo abschließt und erstmals bezahlt.",
        "Ofrece a restaurantes y cafeterías los menús digitales, los pedidos desde la mesa y las funciones inteligentes de Art of Menu. Gana una comisión cuando un nuevo negocio se suscriba con tu código y complete su primer pago.",
        "Presenta a ristoranti e bar i menù digitali, gli ordini dal tavolo e le funzioni smart di Art of Menu. Guadagna una commissione quando una nuova attività si abbona con il tuo codice e completa il primo pagamento.",
        "Présentez aux restaurants et cafés les menus numériques, la commande à table et les fonctions intelligentes d'Art of Menu. Touchez une commission lorsqu'un nouvel établissement s'abonne avec votre code et effectue son premier paiement.",
    ],
    "Kendi referans kodun": ["Your own referral code", "Dein eigener Empfehlungscode", "Tu propio código de referido", "Il tuo codice di riferimento", "Votre code de parrainage"],
    "Şeffaf komisyonlar": ["Clear commission rates", "Klare Provisionssätze", "Comisiones transparentes", "Commissioni trasparenti", "Commissions transparentes"],
    "Bağımsız iş ortaklığı": ["Independent partnership", "Unabhängige Partnerschaft", "Colaboración independiente", "Collaborazione indipendente", "Partenariat indépendant"],
    "Art of Menu dijital QR menü örnek görünümü": [
        "Art of Menu digital QR menu preview", "Art of Menu – Vorschau einer digitalen QR-Speisekarte",
        "Vista previa del menú QR digital de Art of Menu", "Anteprima del menù QR digitale Art of Menu",
        "Aperçu du menu QR numérique Art of Menu",
    ],
    "ÖRNEK RESTORAN MENÜSÜ": ["RESTAURANT MENU PREVIEW", "BEISPIEL-SPEISEKARTE", "MENÚ DE RESTAURANTE DE EJEMPLO", "MENÙ RISTORANTE DI ESEMPIO", "EXEMPLE DE CARTE DE RESTAURANT"],
    "Menümüze hoş geldiniz.": ["Welcome to our menu.", "Willkommen auf unserer Speisekarte.", "Bienvenido a nuestro menú.", "Benvenuti nel nostro menù.", "Bienvenue sur notre carte."],
    "Popüler": ["Popular", "Beliebt", "Populares", "Popolari", "Populaires"],
    "Kahveler": ["Coffee", "Kaffee", "Cafés", "Caffè", "Cafés"],
    "Tatlılar": ["Desserts", "Desserts", "Postres", "Dolci", "Desserts"],
    "Sütlü kahve": ["Coffee with milk", "Kaffee mit Milch", "Café con leche", "Caffè con latte", "Café au lait"],
    "Kruvasan": ["Croissant", "Croissant", "Cruasán", "Cornetto", "Croissant"],
    "Fırından taze": ["Freshly baked", "Frisch gebacken", "Recién horneado", "Appena sfornato", "Tout juste sorti du four"],
    "Günün tatlısı": ["Dessert of the day", "Dessert des Tages", "Postre del día", "Dolce del giorno", "Dessert du jour"],
    "İŞLETMELER İÇİN": ["FOR RESTAURANTS", "FÜR GASTRONOMIEBETRIEBE", "PARA NEGOCIOS", "PER LE ATTIVITÀ", "POUR LES ÉTABLISSEMENTS"],
    "Ürün görünümü · örnek menü": ["Product preview · sample menu", "Produktvorschau · Beispielmenü", "Vista previa · menú de ejemplo", "Anteprima prodotto · menù di esempio", "Aperçu du produit · exemple de carte"],
    "Komisyonlar": ["Commissions", "Provisionen", "Comisiones", "Commissioni", "Commissions"],
    "İlk abonelik satışından ne kazanırsın?": [
        "What can you earn on the first subscription?", "Was verdienst du beim ersten Aboabschluss?",
        "¿Cuánto ganas con la primera suscripción?", "Quanto guadagni dal primo abbonamento?",
        "Combien gagnez-vous sur le premier abonnement ?",
    ],
    "Aylık planlarda komisyonun, ilk ödemeden vergi ve ödeme kuruluşu kesintileri düşüldükten sonra kalan net tutar üzerinden hesaplanır.": [
        "For monthly plans, your commission is calculated on the first payment after taxes and payment processing fees have been deducted.",
        "Bei Monatsabos wird deine Provision aus der ersten Zahlung nach Abzug von Steuern und Zahlungsgebühren berechnet.",
        "En los planes mensuales, la comisión se calcula sobre el primer pago, una vez descontados los impuestos y las comisiones de procesamiento.",
        "Per i piani mensili, la commissione è calcolata sul primo pagamento, al netto delle imposte e delle commissioni del servizio di pagamento.",
        "Pour les forfaits mensuels, votre commission est calculée sur le premier paiement, après déduction des taxes et des frais de traitement.",
    ],
    "İlk aylık ödemenin net tutarı": [
        "Of the net first monthly payment", "Vom Nettobetrag der ersten Monatszahlung",
        "Del importe neto del primer pago mensual", "Dell'importo netto del primo pagamento mensile",
        "Du montant net du premier paiement mensuel",
    ],
    "Bu oranlar yalnızca ilk başarılı aylık abonelik ödemesinde geçerlidir. Yıllık planlar için pakete ve müşterinin bulunduğu pazara göre sabit komisyon ödenir. Abonelik yenilemelerinden komisyon kazanılmaz. Ayrıntılar ": [
        "These rates apply only to the first successful monthly subscription payment. Annual plans pay a fixed commission based on the plan and the customer's market. Renewals do not earn commissions. See the ",
        "Diese Sätze gelten nur für die erste erfolgreiche Monatszahlung. Für Jahresabos gibt es je nach Tarif und Kundenmarkt eine feste Provision. Verlängerungen sind nicht provisionsberechtigt. Details in den ",
        "Estos porcentajes solo se aplican al primer pago mensual realizado correctamente. Los planes anuales generan una comisión fija según el plan y el mercado del cliente. Las renovaciones no generan comisiones. Consulta las ",
        "Queste percentuali si applicano solo al primo pagamento mensile riuscito. Gli abbonamenti annuali prevedono una commissione fissa in base al piano e al mercato del cliente. I rinnovi non generano commissioni. Consulta i ",
        "Ces taux ne s'appliquent qu'au premier paiement mensuel réussi. Les forfaits annuels donnent lieu à une commission fixe selon le forfait et le marché du client. Les renouvellements ne sont pas rémunérés. Consultez les ",
    ],
    "satış ortaklığı sözleşmesinde": [
        "partner terms", "Partnerbedingungen", "condiciones del programa", "termini del programma partner", "conditions du programme",
    ],
    "Nasıl çalışır?": ["How it works", "So funktioniert es", "¿Cómo funciona?", "Come funziona?", "Comment ça marche ?"],
    "Üç adımda başla.": ["Start in three steps.", "In drei Schritten starten.", "Empieza en tres pasos.", "Inizia in tre passi.", "Commencez en trois étapes."],
    "01 / HESABINI OLUŞTUR": ["01 / CREATE AN ACCOUNT", "01 / KONTO ERSTELLEN", "01 / CREA TU CUENTA", "01 / CREA IL TUO ACCOUNT", "01 / CRÉEZ UN COMPTE"],
    "02 / ÜRÜNÜ TANIT": ["02 / INTRODUCE THE PRODUCT", "02 / PRODUKT VORSTELLEN", "02 / PRESENTA EL PRODUCTO", "02 / PRESENTA IL PRODOTTO", "02 / PRÉSENTEZ LE PRODUIT"],
    "03 / KOMİSYON KAZAN": ["03 / EARN COMMISSION", "03 / PROVISION VERDIENEN", "03 / GANA COMISIONES", "03 / GUADAGNA COMMISSIONI", "03 / TOUCHEZ VOTRE COMMISSION"],
    "Hesabını aç, e-posta adresini doğrula ve gerekli bilgilerini tamamlayarak referans kodunu al.": [
        "Sign up, verify your email and complete your details to receive your referral code.",
        "Registriere dich, bestätige deine E-Mail-Adresse und vervollständige deine Angaben, um deinen Empfehlungscode zu erhalten.",
        "Regístrate, verifica tu correo y completa tus datos para recibir tu código de referido.",
        "Registrati, verifica l'email e completa i dati richiesti per ottenere il tuo codice.",
        "Inscrivez-vous, confirmez votre adresse e-mail et complétez votre profil pour recevoir votre code de parrainage.",
    ],
    "İşletmelere ulaş": ["Reach local businesses", "Betriebe ansprechen", "Contacta con negocios", "Contatta le attività", "Contactez des établissements"],
    "Art of Menu’yu restoran ve kafelere göster. Ürün sayfasını paylaş ve referans kodunu ilet.": [
        "Show Art of Menu to restaurants and cafés. Share the product page and your referral code.",
        "Zeige Art of Menu Restaurants und Cafés. Teile die Produktseite und deinen Empfehlungscode.",
        "Muestra Art of Menu a restaurantes y cafeterías. Comparte la página del producto y tu código.",
        "Mostra Art of Menu a ristoranti e bar. Condividi la pagina del prodotto e il tuo codice.",
        "Présentez Art of Menu aux restaurants et cafés. Partagez la page du produit et votre code.",
    ],
    "İlk satıştan payını al": ["Earn on your first sale", "Bei deinem ersten Verkauf verdienen", "Gana con tu primera venta", "Guadagna dalla prima vendita", "Gagnez dès votre première vente"],
    "İşletme kodunla ilk aboneliğini satın aldığında komisyonun kaydedilir. Ödeme koşulları tamamlandığında banka havalesiyle ödenir.": [
        "When a business buys its first subscription with your code, your commission is recorded. It is paid by bank transfer once the payout conditions are met.",
        "Wenn ein Betrieb mit deinem Code sein erstes Abo abschließt, wird deine Provision erfasst. Nach Erfüllung der Auszahlungsbedingungen wird sie überwiesen.",
        "Cuando un negocio contrata su primera suscripción con tu código, se registra tu comisión. Se paga por transferencia al cumplir las condiciones de pago.",
        "Quando un'attività sottoscrive il primo abbonamento con il tuo codice, la commissione viene registrata. Riceverai il pagamento tramite bonifico una volta soddisfatte le condizioni.",
        "Lorsqu'un établissement souscrit son premier abonnement avec votre code, votre commission est enregistrée. Elle est versée par virement lorsque les conditions de paiement sont remplies.",
    ],
    "Restoranlara Art of Menu’yu sun. Satışından kazan.": [
        "Introduce Art of Menu to restaurants. Get rewarded for sales.",
        "Stelle Art of Menu Restaurants vor. Verdiene an deinen Verkäufen.",
        "Presenta Art of Menu a restaurantes. Gana por cada primera venta.",
        "Presenta Art of Menu ai ristoranti. Guadagna dalle tue vendite.",
        "Présentez Art of Menu aux restaurants. Gagnez sur vos ventes.",
    ],
    "Satış ortağı hesabını aç, referans kodunu al ve QR menüyle masadan sipariş çözümünü restoranlara tanıtmaya başla.": [
        "Create your partner account, get your referral code and start introducing QR menus and table ordering to restaurants.",
        "Eröffne dein Partnerkonto, hol dir deinen Empfehlungscode und stelle Restaurants QR-Speisekarten und Tischbestellungen vor.",
        "Crea tu cuenta de socio, recibe tu código y empieza a ofrecer menús QR y pedidos desde la mesa a los restaurantes.",
        "Crea il tuo account partner, ottieni il tuo codice e inizia a proporre ai ristoranti menù QR e ordini dal tavolo.",
        "Créez votre compte partenaire, obtenez votre code et présentez les menus QR et la commande à table aux restaurants.",
    ],
    "Satış ortaklığı adımları": ["Partner programme steps", "Schritte im Partnerprogramm", "Pasos del programa de socios", "Fasi del programma partner", "Étapes du programme partenaire"],
    "SATIŞ ORTAKLIĞI": ["PARTNER PROGRAMME", "PARTNERPROGRAMM", "PROGRAMA DE SOCIOS", "PROGRAMMA PARTNER", "PROGRAMME PARTENAIRE"],
    "İşletmeye Art of Menu’yu tanıt": ["Introduce Art of Menu to a business", "Stelle einem Betrieb Art of Menu vor", "Presenta Art of Menu a un negocio", "Presenta Art of Menu a un'attività", "Présentez Art of Menu à un établissement"],
    "Referans kodunla abonelik alınsın": ["The business subscribes with your code", "Der Betrieb abonniert mit deinem Code", "El negocio se suscribe con tu código", "L'attività si abbona con il tuo codice", "L'établissement s'abonne avec votre code"],
    "İlk ödemeden komisyon kazan": ["Earn from the first payment", "Verdiene an der ersten Zahlung", "Gana una comisión del primer pago", "Guadagna sul primo pagamento", "Touchez une commission sur le premier paiement"],
    "Ürün sayfası": ["Product page", "Produktseite", "Página del producto", "Pagina prodotto", "Page du produit"],
    "Satış ortağı girişi": ["Partner sign-in", "Partner-Login", "Acceso para socios", "Accesso partner", "Connexion partenaire"],
    "Satış ortaklığı sözleşmesi": ["Partner terms", "Partnerbedingungen", "Condiciones del programa", "Termini del programma partner", "Conditions du programme"],
}

LANGS = ("en", "de", "es", "it", "fr")
TEMPLATE = ROOT / "tr/satis-ortakligi/index.html"

def localized(source, lang):
    i = LANGS.index(lang)
    result = source.replace('<html lang="tr">', f'<html lang="{lang}">')
    # Longest source fragments first, avoiding partial substitution overlaps.
    for original in sorted(COPY, key=len, reverse=True):
        count = result.count(original)
        if not count:
            raise RuntimeError(f"{lang}: source fragment not found: {original[:90]}")
        result = result.replace(original, COPY[original][i])
    # Localize navigation, legal links, canonical URL, OpenGraph metadata and HTML language.
    result = result.replace('href="/tr/"', f'href="/{lang}/"')
    result = result.replace('/legal/partner-terms/?lang=tr', f'/legal/partner-terms/?lang={lang}')
    result = result.replace("tr_TR", OG_LOCALES[lang])
    source_url = "https://artofmenu.com/tr/satis-ortakligi/"
    target_url = f"https://artofmenu.com/{ROUTES[lang]}/"
    result = result.replace(f'<link rel="canonical" href="{source_url}">', f'<link rel="canonical" href="{target_url}">')
    result = result.replace(f'<meta property="og:url" content="{source_url}">', f'<meta property="og:url" content="{target_url}">')
    return result

def build():
    source = TEMPLATE.read_text(encoding="utf-8")
    for lang in LANGS:
        page = ROOT / ROUTES[lang] / "index.html"
        page.parent.mkdir(parents=True, exist_ok=True)
        page.write_text(localized(source, lang), encoding="utf-8")
        print(f"Wrote /{ROUTES[lang]}/")
    # The Turkish source stays hand-edited; this script never overwrites it.
    print("Turkish page is the source. Keep its hreflang links updated if routes change.")

if __name__ == "__main__":
    build()
