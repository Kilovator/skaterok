export type MonacoLang = "pl" | "en" | "ru";

export interface MonacoTranslations {
  // Header
  storeName: string;
  posTerminal: string;
  shortcuts: string;
  syncData: string;
  notifications: string;
  adminProfile: string;
  lockTerminal: string;
  logout: string;
  liveClock: string;

  // Sidebar
  dashboard: string;
  pos: string;
  products: string;
  categories: string;
  sales: string;
  purchases: string;
  giftCards: string;
  people: string;
  settings: string;
  reports: string;

  // Quick Links
  quickLinks: string;
  openInvoices: string;
  customers: string;
  users: string;
  backup: string;
  stores: string;

  // Charts
  salesChartTitle: string;
  tax: string;
  discount: string;
  revenue: string;
  topProductsTitle: string;
  unitsSold: string;
  stock: string;

  // POS Cashier
  searchOrBarcode: string;
  walkInCustomer: string;
  selectCustomer: string;
  item: string;
  qty: string;
  price: string;
  subtotal: string;
  total: string;
  holdOrder: string;
  cancelOrder: string;
  payCheckout: string;
  paymentMethod: string;
  cash: string;
  card: string;
  blik: string;
  amountTendered: string;
  changeDue: string;
  confirmPayment: string;
  emptyCart: string;
  allCategories: string;

  // Orders / Sales
  orderId: string;
  customer: string;
  date: string;
  status: string;
  actions: string;
  processing: string;
  shipped: string;
  delivered: string;
  cancelled: string;
  searchOrders: string;
  filterStatus: string;
  orderDetails: string;
  customBuild: string;
  printReceipt: string;

  // General & Footer & Extras
  footerRights: string;
  version: string;
  pinPlaceholder: string;
  unlock: string;
  accessGranted: string;
  invalidPin: string;

  all: string;
  thankYou: string;
  newSale: string;
  close: string;
  backToDashboard: string;
  moduleActive: string;
  holdOrderAlert: string;
}

export const monacoTranslations: Record<MonacoLang, MonacoTranslations> = {
  pl: {
    storeName: "Center Market (Skate POS)",
    posTerminal: "Terminal POS",
    shortcuts: "Skróty klawiszowe",
    syncData: "Synchronizuj bazę",
    notifications: "Powiadomienia",
    adminProfile: "Admin Admin",
    lockTerminal: "Zablokuj terminal",
    logout: "Wyloguj się",
    liveClock: "Czas na żywo",

    dashboard: "Panel główny",
    pos: "Kasa POS",
    products: "Produkty",
    categories: "Kategorie",
    sales: "Sprzedaż",
    purchases: "Dostawy",
    giftCards: "Karty podarunkowe",
    people: "Klienci i personel",
    settings: "Ustawienia",
    reports: "Raporty",

    quickLinks: "Szybkie moduły",
    openInvoices: "Otwarte zamówienia",
    customers: "Klienci",
    users: "Personel",
    backup: "Kopia bazy",
    stores: "Oddziały",

    salesChartTitle: "Wykres sprzedaży",
    tax: "Podatek",
    discount: "Rabat",
    revenue: "Przychód",
    topProductsTitle: "Najpopularniejsze produkty",
    unitsSold: "sprzedano szt.",
    stock: "W magazynie",

    searchOrBarcode: "Skanuj kod kreskowy lub szukaj...",
    walkInCustomer: "Klient stacjonarny",
    selectCustomer: "Wybierz klienta",
    item: "Produkt",
    qty: "Ilość",
    price: "Cena",
    subtotal: "Suma częściowa",
    total: "Do zapłaty",
    holdOrder: "Wstrzymaj",
    cancelOrder: "Anuluj",
    payCheckout: "Płatność",
    paymentMethod: "Metoda płatności",
    cash: "Gotówka",
    card: "Karta płatnicza",
    blik: "BLIK / Kod",
    amountTendered: "Wpłacona kwota",
    changeDue: "Reszta",
    confirmPayment: "Potwierdź płatność i paragon",
    emptyCart: "Koszyk jest pusty. Wybierz produkty z katalogu",
    allCategories: "Wszystkie kategorie",

    orderId: "Nr zamówienia",
    customer: "Klient",
    date: "Data",
    status: "Status",
    actions: "Akcje",
    processing: "W realizacji",
    shipped: "Wysłane",
    delivered: "Dostarczone",
    cancelled: "Anulowane",
    searchOrders: "Szukaj zamówień po ID, kliencie, telefonie...",
    filterStatus: "Filtruj status",
    orderDetails: "Szczegóły zamówienia",
    customBuild: "Personalizowana deska",
    printReceipt: "Drukuj paragon",

    footerRights: "Copyright © 2018-2026 Monaco POS. Wszelkie prawa zastrzeżone.",
    version: "Wersja 1.2",
    pinPlaceholder: "Wprowadź kod PIN personelu",
    unlock: "Odblokuj Monaco POS",
    accessGranted: "Dostęp przyznany",
    invalidPin: "Nieprawidłowy PIN. Spróbuj ponownie.",

    all: "Wszystkie",
    thankYou: "DZIĘKUJEMY ZA ZAKUPY!",
    newSale: "Nowa sprzedaż",
    close: "Zamknij",
    backToDashboard: "Powrót do panelu",
    moduleActive: "Aktywny moduł zsynchronizowany z terminalem Monaco POS i bazą danych Neon.",
    holdOrderAlert: "Rachunek został wstrzymany",
  },
  en: {
    storeName: "Center Market (Skate POS)",
    posTerminal: "POS Terminal",
    shortcuts: "Keyboard Shortcuts",
    syncData: "Sync Database",
    notifications: "Notifications",
    adminProfile: "Admin Admin",
    lockTerminal: "Lock Register",
    logout: "Log Out",
    liveClock: "Live Clock",

    dashboard: "Dashboard",
    pos: "POS",
    products: "Products",
    categories: "Categories",
    sales: "Sales",
    purchases: "Purchases",
    giftCards: "Gift Cards",
    people: "People",
    settings: "Settings",
    reports: "Reports",

    quickLinks: "Quick Links",
    openInvoices: "Open Invoices",
    customers: "Customers",
    users: "Users",
    backup: "Backup",
    stores: "Stores",

    salesChartTitle: "Sales Chart",
    tax: "Tax",
    discount: "Discount",
    revenue: "Sales",
    topProductsTitle: "Top Products",
    unitsSold: "Units Sold",
    stock: "Stock",

    searchOrBarcode: "Scan barcode or search products...",
    walkInCustomer: "Walk-in Customer",
    selectCustomer: "Select Customer",
    item: "Product",
    qty: "Qty",
    price: "Price",
    subtotal: "Subtotal",
    total: "Total",
    holdOrder: "Hold Order",
    cancelOrder: "Cancel Order",
    payCheckout: "Pay Now",
    paymentMethod: "Payment Method",
    cash: "Cash",
    card: "Credit / Debit Card",
    blik: "Digital / BLIK",
    amountTendered: "Amount Tendered",
    changeDue: "Change Due",
    confirmPayment: "Confirm Payment & Receipt",
    emptyCart: "Cart is currently empty",
    allCategories: "All Categories",

    orderId: "Order #",
    customer: "Customer",
    date: "Date",
    status: "Status",
    actions: "Actions",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
    searchOrders: "Search orders by ID, name, phone...",
    filterStatus: "Filter status",
    orderDetails: "Order Details",
    customBuild: "Custom Skateboard Build",
    printReceipt: "Print Receipt",

    footerRights: "Copyright © 2018-2026 Monaco POS. All rights reserved.",
    version: "Version 1.2",
    pinPlaceholder: "Enter Staff Secret PIN",
    unlock: "Unlock Monaco POS",
    accessGranted: "Access granted",
    invalidPin: "Invalid PIN. Please try again.",

    all: "All",
    thankYou: "THANK YOU FOR YOUR PURCHASE!",
    newSale: "New Sale",
    close: "Close",
    backToDashboard: "Back to Dashboard",
    moduleActive: "Active module synchronized with Monaco POS terminal and Neon database.",
    holdOrderAlert: "Order put on hold",
  },
  ru: {
    storeName: "Center Market (Skate POS)",
    posTerminal: "POS Терминал",
    shortcuts: "Горячие клавиши",
    syncData: "Синхронизация данных",
    notifications: "Уведомления",
    adminProfile: "Admin Admin",
    lockTerminal: "Блокировка терминала",
    logout: "Выйти из системы",
    liveClock: "Текущее время",

    dashboard: "Дашборд",
    pos: "POS-Касса",
    products: "Товары",
    categories: "Категории",
    sales: "Продажи",
    purchases: "Закупки",
    giftCards: "Подарочные карты",
    people: "Клиенты и штат",
    settings: "Настройки",
    reports: "Отчеты",

    quickLinks: "Быстрые модули",
    openInvoices: "Открытые заказы",
    customers: "Клиенты",
    users: "Пользователи",
    backup: "Бэкап базы",
    stores: "Филиалы",

    salesChartTitle: "График продаж",
    tax: "Налог",
    discount: "Скидка",
    revenue: "Выручка",
    topProductsTitle: "Топ популярных товаров",
    unitsSold: "Продано шт.",
    stock: "В наличии",

    searchOrBarcode: "Сканировать штрихкод или поиск товара...",
    walkInCustomer: "Розничный покупатель",
    selectCustomer: "Выбрать клиента",
    item: "Товар",
    qty: "Кол-во",
    price: "Цена",
    subtotal: "Подытог",
    total: "Итого к оплате",
    holdOrder: "Отложить чек",
    cancelOrder: "Сбросить чек",
    payCheckout: "Оплатить",
    paymentMethod: "Способ оплаты",
    cash: "Наличные",
    card: "Банковская карта",
    blik: "BLIK / СБП / Pay",
    amountTendered: "Внесено покупателем",
    changeDue: "Сдача",
    confirmPayment: "Подтвердить оплату и чек",
    emptyCart: "Чек пуст. Добавьте товары из каталога справа",
    allCategories: "Все категории",

    orderId: "№ Заказа",
    customer: "Покупатель",
    date: "Дата",
    status: "Статус",
    actions: "Действия",
    processing: "В обработке",
    shipped: "Отправлен",
    delivered: "Доставлен",
    cancelled: "Отменен",
    searchOrders: "Поиск заказа по номеру, имени, телефону...",
    filterStatus: "Фильтр статуса",
    orderDetails: "Подробности заказа",
    customBuild: "Кастомная сборка скейта",
    printReceipt: "Печать чека",

    footerRights: "Copyright © 2018-2026 Monaco POS. Все права защищены.",
    version: "Версия 1.2",
    pinPlaceholder: "Введите PIN доступа персонала",
    unlock: "Войти в Monaco POS",
    accessGranted: "Авторизация успешна",
    invalidPin: "Неверный PIN персонала.",

    all: "Все",
    thankYou: "СПАСИБО ЗА ПОКУПКУ!",
    newSale: "Новая продажа",
    close: "Закрыть",
    backToDashboard: "Вернуться в Дашборд",
    moduleActive: "Активный модуль синхронизирован с терминалом Monaco POS и базой данных Neon.",
    holdOrderAlert: "Чек отложен в ожидание",
  },
};
