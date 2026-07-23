export type Language = "pl" | "en";

export const translations = {
  pl: {
    // Navigation
    "nav.boards": "Deski",
    "nav.team": "Team",
    "nav.about": "O nas",
    "nav.build": "Kreator",
    "nav.account": "Konto",
    "nav.login": "Zaloguj się",

    // Hero
    "hero.heading": "Twoja deska, Twój styl",
    "hero.body": "Deskorolki premium na ulice. Stworzone do jazdy, stworzone by trwać.",
    "hero.buttonText": "Złóż swoją deskę",

    // Products
    "products.heading": "Nasze Deski",
    "products.body": "Każda deska starannie dobrana pod kątem jakości, stylu i wydajności na ulicy.",

    // Team
    "team.heading": "Poznaj nasz Team",
    "team.buildBoard": "Złóż ich deskę",

    // Text & Image Sections
    "tai1.heading": "Zaprojektowane na ulice",
    "tai1.body": "Każda deska jest tworzona z precyzją i pasją. Od pierwszego odepchnięcia do ostatniego triku, deski SKET-OK są stworzone do osiągów.",
    "tai1.buttonText": "Odkryj deski",

    "tai2.heading": "Stworzone by trwać",
    "tai2.body": "Materiały premium, profesjonalna konstrukcja. Używamy tylko najlepszego klonu i osprzętu, aby Twoja deska przetrwała każdą sesję.",
    "tai2.buttonText": "Dostosuj swoją",

    "tai3.heading": "Jedź z teamem",
    "tai3.body": "Dołącz do społeczności riderów, którzy żyją i oddychają deskorolką. Riderzy teamu SKET-OK reprezentują ducha ulicy.",
    "tai3.buttonText": "Poznaj Team",

    // Cart / Checkout
    "cart.title": "Koszyk",
    "cart.empty": "Pusty",
    "cart.total": "Suma",
    "cart.checkout": "Do kasy",
    "cart.button": "Koszyk",
    "cart.items": "art.",
    "cart.open": "Otwórz koszyk, {count} art.",
    "cart.close": "Zamknij koszyk",
    "cart.remove": "Usuń {name} z koszyka",
    "cart.qty": "ilość",

    // Build Page
    "build.heading": "Złóż swoją deskę",
    "build.deck": "Blat",
    "build.wheels": "Koła",
    "build.trucks": "Traki",
    "build.bolts": "Montażówki",
    "build.addToCart": "Dodaj do koszyka",
    "build.saveBuild": "Zapisz zestaw",
    "build.savedSuccess": "Zestaw zapisany w koncie!",

    // Product Card
    "product.customize": "Dostosuj",
    "product.addToCart": "+ Dodaj do koszyka",

    // Auth Modal
    "auth.login": "Zaloguj się",
    "auth.register": "Rejestracja",
    "auth.email": "Adres E-mail",
    "auth.password": "Hasło",
    "auth.name": "Imię i nazwisko",
    "auth.submitLogin": "Zaloguj się",
    "auth.submitRegister": "Utwórz konto",
    "auth.noAccount": "Nie masz konta? Zarejestruj się",
    "auth.hasAccount": "Masz już konto? Zaloguj się",
    "auth.logout": "Wyloguj się",
    "auth.welcome": "Witaj,",
    "auth.demoBtn": "Użyj konta demo",

    // Account Page
    "account.title": "Twoje Konto",
    "account.savedBuilds": "Zapisane Deski",
    "account.orderHistory": "Historia Zamówień",
    "account.noBuilds": "Brak zapisanych zestawów. Stwórz swój własny w Kreatorze!",
    "account.noOrders": "Nie masz jeszcze złożonych zamówień.",
    "account.loadBuild": "Otwórz w Kreatorze",
    "account.deleteBuild": "Usuń",
    "account.orderId": "Zamówienie #",
    "account.orderDate": "Data",
    "account.status": "Status",
    "account.total": "Łącznie",
    "account.items": "Produkty",

    // Checkout Page
    "checkout.title": "Składanie Zamówienia",
    "checkout.shippingTitle": "Sposób Dostawy i Adres",
    "checkout.paymentTitle": "Forma Płatności",
    "checkout.summaryTitle": "Podsumowanie Zamówienia",
    "checkout.courier": "Kurier do domu / firmy",
    "checkout.paczkomat": "Paczkomat InPost",
    "checkout.postal": "Poczta Polska",
    "checkout.card": "Karta płatnicza (Visa/Mastercard)",
    "checkout.blik": "BLIK (szybki kod)",
    "checkout.cash": "Płatność przy odbiorze (Kurier)",
    "checkout.applepay": "Apple Pay / Google Pay",
    "checkout.placeOrder": "Zamawiam i płacę",
    "checkout.successTitle": "Dziękujemy za zamówienie!",
    "checkout.successMsg": "Twoje zamówienie zostało przyjęte i jest przetwarzane. Numer zamówienia:",
    "checkout.backHome": "Powrót do strony głównej",
    "checkout.paczkomatPlaceholder": "Wpisz kod Paczkomatu (np. WAW01M)",
    "checkout.fullName": "Imię i nazwisko",
    "checkout.phone": "Numer telefonu",
    "checkout.address": "Ulica i numer domu",
    "checkout.city": "Miasto",
    "checkout.postalCode": "Kod pocztowy",
    "checkout.cardNumber": "Numer karty",
    "checkout.cardExp": "MM/RR",
    "checkout.cardCvc": "CVC",
    "checkout.blikCode": "Wpisz 6-cyfrowy kod BLIK",
  },
  en: {
    // Navigation
    "nav.boards": "Boards",
    "nav.team": "Team",
    "nav.about": "About",
    "nav.build": "Build",
    "nav.account": "Account",
    "nav.login": "Sign In",

    // Hero
    "hero.heading": "Your board, your way",
    "hero.body": "Premium skateboards for the streets. Built to shred, made to last.",
    "hero.buttonText": "Build Your Board",

    // Products
    "products.heading": "Our Boards",
    "products.body": "Every board handpicked for quality, style, and street performance.",

    // Team
    "team.heading": "Meet the Team",
    "team.buildBoard": "Build their board",

    // Text & Image Sections
    "tai1.heading": "Designed for the streets",
    "tai1.body": "Each board is crafted with precision and passion. From the first push to the last trick, SKET-OK boards are built to perform.",
    "tai1.buttonText": "Explore Boards",

    "tai2.heading": "Built to last",
    "tai2.body": "Premium materials, pro-grade construction. We use only the best maple and hardware so your board survives every session.",
    "tai2.buttonText": "Customize Yours",

    "tai3.heading": "Ride with the team",
    "tai3.body": "Join a community of riders who live and breathe skateboarding. SKET-OK team riders represent the spirit of the streets.",
    "tai3.buttonText": "Meet the Team",

    // Cart / Checkout
    "cart.title": "Cart",
    "cart.empty": "Empty",
    "cart.total": "Total",
    "cart.checkout": "Checkout",
    "cart.button": "Cart",
    "cart.items": "items",
    "cart.open": "Open cart, {count} items",
    "cart.close": "Close cart",
    "cart.remove": "Remove {name} from cart",
    "cart.qty": "qty",

    // Build Page
    "build.heading": "Build your board",
    "build.deck": "Deck",
    "build.wheels": "Wheels",
    "build.trucks": "Trucks",
    "build.bolts": "Bolts",
    "build.addToCart": "Add to cart",
    "build.saveBuild": "Save Setup",
    "build.savedSuccess": "Setup saved to account!",

    // Product Card
    "product.customize": "Customize",
    "product.addToCart": "+ Add to cart",

    // Auth Modal
    "auth.login": "Sign In",
    "auth.register": "Create Account",
    "auth.email": "Email Address",
    "auth.password": "Password",
    "auth.name": "Full Name",
    "auth.submitLogin": "Log In",
    "auth.submitRegister": "Sign Up",
    "auth.noAccount": "Don't have an account? Sign up",
    "auth.hasAccount": "Already have an account? Log in",
    "auth.logout": "Log Out",
    "auth.welcome": "Welcome,",
    "auth.demoBtn": "Use Demo Account",

    // Account Page
    "account.title": "Your Account",
    "account.savedBuilds": "Saved Builds",
    "account.orderHistory": "Order History",
    "account.noBuilds": "No saved setups yet. Create your custom setup in the Builder!",
    "account.noOrders": "You haven't placed any orders yet.",
    "account.loadBuild": "Open in Builder",
    "account.deleteBuild": "Delete",
    "account.orderId": "Order #",
    "account.orderDate": "Date",
    "account.status": "Status",
    "account.total": "Total",
    "account.items": "Items",

    // Checkout Page
    "checkout.title": "Checkout",
    "checkout.shippingTitle": "Shipping Method & Address",
    "checkout.paymentTitle": "Payment Method",
    "checkout.summaryTitle": "Order Summary",
    "checkout.courier": "Home / Office Courier",
    "checkout.paczkomat": "InPost Parcel Locker",
    "checkout.postal": "Standard Post",
    "checkout.card": "Credit / Debit Card",
    "checkout.blik": "BLIK (Instant Code)",
    "checkout.cash": "Pay on Delivery (Cash)",
    "checkout.applepay": "Apple Pay / Google Pay",
    "checkout.placeOrder": "Place Order",
    "checkout.successTitle": "Thank you for your order!",
    "checkout.successMsg": "Your order has been received and is being processed. Order number:",
    "checkout.backHome": "Back to Home",
    "checkout.paczkomatPlaceholder": "Enter Locker Code (e.g. WAW01M)",
    "checkout.fullName": "Full Name",
    "checkout.phone": "Phone Number",
    "checkout.address": "Street & House Number",
    "checkout.city": "City",
    "checkout.postalCode": "Postal Code",
    "checkout.cardNumber": "Card Number",
    "checkout.cardExp": "MM/YY",
    "checkout.cardCvc": "CVC",
    "checkout.blikCode": "Enter 6-digit BLIK code",
  },
};
