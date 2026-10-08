"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type FormEvent, type KeyboardEvent as ReactKeyboardEvent, type TouchEvent as ReactTouchEvent, type TransitionEvent as ReactTransitionEvent } from "react";
import {
  FaArrowRight,
  FaChevronLeft,
  FaChevronRight,
  FaEnvelope,
  FaInstagram,
  FaPhone,
  FaStar,
  FaTelegramPlane,
  FaTimes,
} from "react-icons/fa";

const navigation = [
  ["Обо мне", "about"],
  ["Обучение", "course"],
  ["Услуги", "services"],
  ["Портфолио", "portfolio"],
  ["Отзывы", "reviews"],
  ["Контакты", "contacts"],
] as const;

const instagramUrl = "https://www.instagram.com/dariii.sav?stkn=c3lhaWM2MWFpMmZy";
const telegramUrl = "https://t.me/dariiisav";
const bookingUrl = "https://dikidi.net/1954760";
const services = [
  {
    number: "01",
    name: "Коррекция бровей",
    detail: "Коррекция воском и пинцетом, прореживание и премиум-уход.",
    price: "25 BYN",
    bookingUrl: "https://dikidi.net/1954760?p=2.pi-ssm-si&o=7&s=20979942",
  },
  {
    number: "02",
    name: "Окрашивание бровей",
    detail: "Окрашивание бровей краской и премиум-уход.",
    price: "30 BYN",
    bookingUrl: "https://dikidi.net/1954760?p=2.pi-ssm-si&o=7&s=20999484",
  },
  {
    number: "03",
    name: "Окрашивание и коррекция",
    detail: "Окрашивание краской, коррекция воском и пинцетом, премиум-уход.",
    price: "35 BYN",
    bookingUrl: "https://dikidi.net/1954760?p=2.pi-ssm-si&o=7&s=20979826",
  },
  {
    number: "04",
    name: "Осветление/коррекция",
    detail: "Осветление, коррекция воском и пинцетом, прореживание и премиум-уход.",
    price: "35 BYN",
    bookingUrl: "https://dikidi.net/1954760?p=2.pi-ssm-si&o=7&s=20999498",
  },
  {
    number: "05",
    name: "Ламинирование/коррекция",
    detail: "Ламинирование, коррекция воском и пинцетом, прореживание и премиум-уход.",
    price: "35 BYN",
    bookingUrl: "https://dikidi.net/1954760?p=2.pi-ssm-si&o=7&s=20979954",
  },
  {
    number: "06",
    name: "Осветление/окрашивание/коррекция",
    detail: "Для тёмных или густых бровей: осветление, окрашивание, коррекция и премиум-уход.",
    price: "40 BYN",
    bookingUrl: "https://dikidi.net/1954760?p=2.pi-ssm-si&o=7&s=20979854",
  },
  {
    number: "07",
    name: "Ламинирование/окрашивание/коррекция",
    detail: "Ламинирование бровей, окрашивание краской, коррекция и премиум-уход.",
    price: "45 BYN",
    bookingUrl: "https://dikidi.net/1954760?p=2.pi-ssm-si&o=7&s=20979927",
  },
  {
    number: "08",
    name: "Ламинирование ресниц",
    detail: "Ламинирование верхних ресниц с окрашиванием и премиум-уходом в конце процедуры.",
    price: "40 BYN",
    bookingUrl: "https://dikidi.net/1954760?p=2.pi-ssm-si&o=7&s=22566385",
  },
  {
    number: "09",
    name: "Окрашивание ресниц (доп услуга к оформлению бровей)",
    detail: "Окрашивание верхних и нижних ресниц краской — дополнительная услуга к оформлению бровей.",
    price: "5 BYN",
  },
  {
    number: "10",
    name: "Удаление пушка",
    detail: "Цена указана за одну зону.",
    price: "5 BYN",
  },
] as const;

const serviceComplexes = [
  {
    number: "01",
    name: "Комплекс STANDART",
    detail: "Ламинирование ресниц с окрашиванием (по желанию) и люкс-уходом; окрашивание бровей в любой технике, коррекция воском или пинцетом и люкс-уход.",
    price: "70 BYN",
    bookingUrl: "https://dikidi.net/1954760?p=2.pi-ssm-si&o=7&s=22567153",
  },
  {
    number: "02",
    name: "Комплекс STANDART 2",
    detail: "Ламинирование ресниц с окрашиванием (по желанию) и люкс-уходом; ламинирование бровей, коррекция воском или пинцетом и люкс-уход.",
    price: "70 BYN",
    bookingUrl: "https://dikidi.net/1954760?p=2.pi-ssm-si&o=7&s=22568182",
  },
  {
    number: "03",
    name: "Комплекс VIP",
    detail: "Ламинирование ресниц с окрашиванием (по желанию) и люкс-уходом; ламинирование бровей, окрашивание в любой технике, коррекция и люкс-уход.",
    price: "80 BYN",
    bookingUrl: "https://dikidi.net/1954760?p=2.pi-ssm-si&o=7&s=22567136",
    featured: true,
  },
] as const;

const courseTopics = [
  {
    title: "Осветление — химия",
    topics: "Виды продуктов · химический процесс · ошибки и их исправление",
    result: "Поймёте, как работает осветление внутри волоса, и перестанете допускать ошибки, из-за которых результат не получается.",
  },
  {
    title: "Чем работать?",
    topics: "Пудра и дилютер · отличия · выбор продукта под исходник",
    result: "Научитесь различать продукты и выбирать подходящий под исходник и запрос клиента.",
  },
  {
    title: "Состояние волоса",
    topics: "Технология процедуры · сохранение качества · восстановление после неудачи",
    result: "Получите чёткую структуру работы, техники сохранения качества и подборку уходовых средств.",
  },
  {
    title: "Дилютер",
    topics: "Демонстрация на модели · анализ исходника · время выдержки · остановка реакции",
    result: "Научитесь работать с кремовым осветлителем, подбирать время выдержки и грамотно останавливать реакцию.",
  },
  {
    title: "Пудра",
    topics: "Демонстрация на модели · логика действий · анализ исходника · остановка реакции",
    result: "Разберётесь в работе с порошковыми осветлителями и выборе времени выдержки.",
  },
  {
    title: "Перманент",
    topics: "Демонстрация на модели · контроль процесса · натуральная техника перекрытия",
    result: "Увидите осветление на перманенте и освоите технику перекрытия для блондинок.",
  },
  {
    title: "Тотал блонд",
    topics: "Полное осветление бровей · чистый белоснежный оттенок · подбор продуктов",
    result: "Научитесь создавать чистый оттенок без желтизны для яркого креативного окрашивания.",
  },
  {
    title: "Окрашивание без затемнения",
    topics: "Окрашивание пористого волоса после осветления · частые ошибки",
    result: "Освоите технику натурального или графичного окрашивания без затемнения волоса.",
  },
] as const;

const courseFaq = [
  {
    question: "Что я получу после курса?",
    answer: "Научитесь работать в актуальных техниках осветления, подбирать время выдержки, нейтрализовать желтизну, окрашивать без затемнения и доводить результат до идеала.",
  },
  {
    question: "Есть ли обратная связь?",
    answer: "Можно связаться со мной по любому вопросу: я рассмотрю вашу работу, укажу на возможные ошибки и дам совет. Отвечаю в ближайшее рабочее время.",
  },
] as const;

const portfolioItems = Array.from({ length: 14 }, (_, index) => ({
  image: `/images/works-${String(index + 1).padStart(2, "0")}.jpg`,
  alt: `Фото работы мастера ${index + 1}`,
}));
const portfolioSlides = [...portfolioItems, ...portfolioItems.slice(0, 4)];

const reviews = [
  {
    text: "Ресницы получились шикарные, без склеивания и заломов. ✨ Процедура прошла комфортно и быстро.",
    author: "Анна · 7 июня 2026",
  },
  {
    text: "Никогда от мастеров не уходила настолько довольной! Прекрасные брови, миленький подарочек, даже напоили чаем и угостили конфетками 🥰",
    author: "Аноним · 25 декабря 2025",
  },
  {
    text: "Прекрасный, талантливый, очаровательный мастер, знающий своё дело! Уютная, приятная атмосфера! Бровки 🔥🔥🔥 Спасибо за ваш профессионализм! ❤️",
    author: "Ирина Сокол · 15 ноября 2025",
  },
] as const;

const legalContent = {
  payment: {
    title: "Оплата и безопасность",
    paragraphs: [
      "Демо-информация. После подключения эквайринга оплата будет проходить на защищённой платёжной странице Альфа-Банка. Данные банковской карты на этом сайте не запрашиваются и не хранятся.",
      "Итоговая стоимость услуги или курса подтверждается до заказа. Условия онлайн-оплаты будут опубликованы после подключения эквайринга.",
    ],
  },
  delivery: {
    title: "Порядок оказания услуг",
    paragraphs: [
      "Демо-условия. Дата и время процедуры согласуются при записи. Студия находится в Минске; точный адрес будет опубликован после замены демонстрационных данных.",
      "Доступ к онлайн-курсу направляется на указанную при заказе электронную почту в течение одного рабочего дня после подтверждения оплаты.",
    ],
  },
  returns: {
    title: "Возврат и отмена записи",
    paragraphs: [
      "Демо-условия. Если вы не можете прийти, пожалуйста, сообщите об этом не позднее чем за 24 часа — мы подберём другое время.",
      "Порядок возврата оплаты за цифровой курс и услуги будет опубликован до начала продаж и приведён в соответствие с законодательством Республики Беларусь.",
    ],
  },
  privacy: {
    title: "Конфиденциальность",
    paragraphs: [
      "Форма может содержать имя, телефон, ник в Telegram, тему обращения и сообщение. Сейчас данные никуда не отправляются и не сохраняются.",
      "Перед запуском сайта этот раздел будет дополнен сведениями об операторе персональных данных, целях и сроках обработки, а также способом отозвать согласие.",
    ],
  },
} as const;

type LegalKey = keyof typeof legalContent;

const interestOptions = [
  { value: "service", label: "Запись на услугу" },
  { value: "question", label: "Задать вопрос" },
  { value: "course", label: "Авторский курс" },
] as const;

const phoneCountries = [
  { code: "BY", flag: "🇧🇾", name: "Беларусь", dial: "+375", mask: "## ###-##-##" },
  { code: "RU", flag: "🇷🇺", name: "Россия", dial: "+7", mask: "(###) ###-##-##" },
  { code: "UA", flag: "🇺🇦", name: "Украина", dial: "+380", mask: "(##) ###-##-##" },
  { code: "PL", flag: "🇵🇱", name: "Польша", dial: "+48", mask: "### ### ###" },
  { code: "LT", flag: "🇱🇹", name: "Литва", dial: "+370", mask: "(6##) #####" },
  { code: "LV", flag: "🇱🇻", name: "Латвия", dial: "+371", mask: "## ### ###" },
  { code: "DE", flag: "🇩🇪", name: "Германия", dial: "+49", mask: "#### ########" },
  { code: "GB", flag: "🇬🇧", name: "Великобритания", dial: "+44", mask: "#### ### ####" },
  { code: "US", flag: "🇺🇸", name: "США", dial: "+1", mask: "(###) ###-####" },
  { code: "CA", flag: "🇨🇦", name: "Канада", dial: "+1", mask: "(###) ###-####" },
  { code: "KZ", flag: "🇰🇿", name: "Казахстан", dial: "+7", mask: "(###) ###-##-##" },
  { code: "GE", flag: "🇬🇪", name: "Грузия", dial: "+995", mask: "(###) ###-###" },
  { code: "AM", flag: "🇦🇲", name: "Армения", dial: "+374", mask: "## ###-###" },
  { code: "MD", flag: "🇲🇩", name: "Молдова", dial: "+373", mask: "(###) ##-###" },
  { code: "FR", flag: "🇫🇷", name: "Франция", dial: "+33", mask: "# ## ## ## ##" },
  { code: "IT", flag: "🇮🇹", name: "Италия", dial: "+39", mask: "### ### ####" },
  { code: "ES", flag: "🇪🇸", name: "Испания", dial: "+34", mask: "### ### ###" },
  { code: "TR", flag: "🇹🇷", name: "Турция", dial: "+90", mask: "(###) ###-##-##" },
  { code: "IL", flag: "🇮🇱", name: "Израиль", dial: "+972", mask: "##-###-####" },
  { code: "AE", flag: "🇦🇪", name: "ОАЭ", dial: "+971", mask: "## ### ####" },
  { code: "IN", flag: "🇮🇳", name: "Индия", dial: "+91", mask: "#####-#####" },
  { code: "CN", flag: "🇨🇳", name: "Китай", dial: "+86", mask: "### #### ####" },
  { code: "JP", flag: "🇯🇵", name: "Япония", dial: "+81", mask: "##-####-####" },
  { code: "PT", flag: "🇵🇹", name: "Португалия", dial: "+351", mask: "### ### ###" },
  { code: "NL", flag: "🇳🇱", name: "Нидерланды", dial: "+31", mask: "# ########" },
  { code: "BE", flag: "🇧🇪", name: "Бельгия", dial: "+32", mask: "### ## ## ##" },
  { code: "CH", flag: "🇨🇭", name: "Швейцария", dial: "+41", mask: "## ### ## ##" },
  { code: "AT", flag: "🇦🇹", name: "Австрия", dial: "+43", mask: "### ######" },
  { code: "CZ", flag: "🇨🇿", name: "Чехия", dial: "+420", mask: "### ### ###" },
  { code: "SK", flag: "🇸🇰", name: "Словакия", dial: "+421", mask: "### ### ###" },
  { code: "EE", flag: "🇪🇪", name: "Эстония", dial: "+372", mask: "#### ####" },
  { code: "FI", flag: "🇫🇮", name: "Финляндия", dial: "+358", mask: "## ### ####" },
  { code: "SE", flag: "🇸🇪", name: "Швеция", dial: "+46", mask: "## ### ####" },
  { code: "NO", flag: "🇳🇴", name: "Норвегия", dial: "+47", mask: "### ## ###" },
  { code: "DK", flag: "🇩🇰", name: "Дания", dial: "+45", mask: "## ## ## ##" },
  { code: "GR", flag: "🇬🇷", name: "Греция", dial: "+30", mask: "### ### ####" },
  { code: "RO", flag: "🇷🇴", name: "Румыния", dial: "+40", mask: "### ### ###" },
  { code: "BG", flag: "🇧🇬", name: "Болгария", dial: "+359", mask: "## ### ####" },
  { code: "HR", flag: "🇭🇷", name: "Хорватия", dial: "+385", mask: "## ### ####" },
  { code: "SI", flag: "🇸🇮", name: "Словения", dial: "+386", mask: "## ### ###" },
  { code: "RS", flag: "🇷🇸", name: "Сербия", dial: "+381", mask: "## ### ####" },
  { code: "AZ", flag: "🇦🇿", name: "Азербайджан", dial: "+994", mask: "## ### ## ##" },
  { code: "UZ", flag: "🇺🇿", name: "Узбекистан", dial: "+998", mask: "## ### ####" },
  { code: "KG", flag: "🇰🇬", name: "Кыргызстан", dial: "+996", mask: "### ### ###" },
  { code: "TJ", flag: "🇹🇯", name: "Таджикистан", dial: "+992", mask: "## ### ####" },
  { code: "KR", flag: "🇰🇷", name: "Южная Корея", dial: "+82", mask: "##-####-####" },
  { code: "TH", flag: "🇹🇭", name: "Таиланд", dial: "+66", mask: "## ### ####" },
  { code: "VN", flag: "🇻🇳", name: "Вьетнам", dial: "+84", mask: "## #### ####" },
  { code: "ID", flag: "🇮🇩", name: "Индонезия", dial: "+62", mask: "###-####-####" },
  { code: "PH", flag: "🇵🇭", name: "Филиппины", dial: "+63", mask: "### ### ####" },
  { code: "AU", flag: "🇦🇺", name: "Австралия", dial: "+61", mask: "### ### ###" },
  { code: "NZ", flag: "🇳🇿", name: "Новая Зеландия", dial: "+64", mask: "## ### ####" },
  { code: "BR", flag: "🇧🇷", name: "Бразилия", dial: "+55", mask: "## #####-####" },
  { code: "MX", flag: "🇲🇽", name: "Мексика", dial: "+52", mask: "## #### ####" },
  { code: "AR", flag: "🇦🇷", name: "Аргентина", dial: "+54", mask: "## ####-####" },
  { code: "ZA", flag: "🇿🇦", name: "ЮАР", dial: "+27", mask: "## ### ####" },
  { code: "EG", flag: "🇪🇬", name: "Египет", dial: "+20", mask: "## #### ####" },
  { code: "SA", flag: "🇸🇦", name: "Саудовская Аравия", dial: "+966", mask: "## ### ####" },
  { code: "NG", flag: "🇳🇬", name: "Нигерия", dial: "+234", mask: "### ### ####" },
  { code: "KE", flag: "🇰🇪", name: "Кения", dial: "+254", mask: "### ######" },
] as const;

const subscribeToNothing = () => () => {};
const timeZoneCountries: Record<string, string> = {
  "Europe/Warsaw": "PL",
  "Europe/Minsk": "BY",
  "Europe/Moscow": "RU",
  "Europe/Kaliningrad": "RU",
  "Europe/Kyiv": "UA",
  "Europe/Kiev": "UA",
  "Europe/Vilnius": "LT",
  "Europe/Riga": "LV",
  "Europe/Berlin": "DE",
  "Europe/London": "GB",
  "Europe/Paris": "FR",
  "Europe/Rome": "IT",
  "Europe/Madrid": "ES",
  "Europe/Lisbon": "PT",
  "Europe/Amsterdam": "NL",
  "Europe/Brussels": "BE",
  "Europe/Zurich": "CH",
  "Europe/Vienna": "AT",
  "Europe/Prague": "CZ",
  "Europe/Bratislava": "SK",
  "Europe/Tallinn": "EE",
  "Europe/Helsinki": "FI",
  "Europe/Stockholm": "SE",
  "Europe/Oslo": "NO",
  "Europe/Copenhagen": "DK",
  "Europe/Athens": "GR",
  "Europe/Bucharest": "RO",
  "Europe/Sofia": "BG",
  "Europe/Zagreb": "HR",
  "Europe/Ljubljana": "SI",
  "Europe/Belgrade": "RS",
  "Asia/Almaty": "KZ",
  "Asia/Tbilisi": "GE",
  "Asia/Yerevan": "AM",
  "Asia/Baku": "AZ",
  "Asia/Tashkent": "UZ",
  "Asia/Bishkek": "KG",
  "Asia/Dushanbe": "TJ",
  "Asia/Jerusalem": "IL",
  "Asia/Dubai": "AE",
  "Asia/Kolkata": "IN",
  "Asia/Shanghai": "CN",
  "Asia/Tokyo": "JP",
  "Asia/Seoul": "KR",
  "Asia/Bangkok": "TH",
  "Asia/Ho_Chi_Minh": "VN",
  "Asia/Jakarta": "ID",
  "Asia/Manila": "PH",
  "Australia/Sydney": "AU",
  "Pacific/Auckland": "NZ",
  "America/Toronto": "CA",
  "America/Vancouver": "CA",
  "America/Mexico_City": "MX",
  "America/Sao_Paulo": "BR",
  "America/Argentina/Buenos_Aires": "AR",
  "Africa/Johannesburg": "ZA",
  "Africa/Cairo": "EG",
  "Asia/Riyadh": "SA",
  "Africa/Lagos": "NG",
  "Africa/Nairobi": "KE",
};

function getLocaleCountryCode() {
  if (typeof navigator === "undefined") return "BY";
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timeZoneCountry = timeZoneCountries[timeZone];
  if (timeZoneCountry && phoneCountries.some((item) => item.code === timeZoneCountry)) return timeZoneCountry;
  const languageTags = navigator.languages?.length ? navigator.languages : [navigator.language];
  const region = languageTags
    .map((language) => {
      try {
        return new Intl.Locale(language).region;
      } catch {
        return language.match(/-([A-Za-z]{2})(?:-|$)/)?.[1]?.toUpperCase();
      }
    })
    .find((candidate) => candidate && phoneCountries.some((item) => item.code === candidate));
  return region ?? "BY";
}

function formatPhoneNumber(rawValue: string, mask: string) {
  const digits = rawValue.replace(/\D/g, "").slice(0, (mask.match(/#/g) ?? []).length);
  let digitIndex = 0;
  let formatted = "";
  for (const character of mask) {
    if (character === "#") {
      if (digitIndex >= digits.length) break;
      formatted += digits[digitIndex++];
    } else if (digitIndex < digits.length) {
      formatted += character;
    }
  }
  return formatted;
}

function PhoneField() {
  const localeCountryCode = useSyncExternalStore(subscribeToNothing, getLocaleCountryCode, () => "BY");
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const countryCode = selectedCountryCode ?? localeCountryCode;
  const [phone, setPhone] = useState("");
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);
  const [activeCountryIndex, setActiveCountryIndex] = useState(0);
  const countryPickerRef = useRef<HTMLDivElement>(null);
  const country = phoneCountries.find((item) => item.code === countryCode) ?? phoneCountries[0];

  useEffect(() => {
    if (!countryMenuOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (event.target instanceof Node && !countryPickerRef.current?.contains(event.target)) setCountryMenuOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [countryMenuOpen]);

  const selectCountry = (code: string) => {
    const nextCountry = phoneCountries.find((item) => item.code === code);
    if (!nextCountry) return;
    setSelectedCountryCode(code);
    setPhone((current) => formatPhoneNumber(current, nextCountry.mask));
    setCountryMenuOpen(false);
  };
  const handleCountryKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    const currentIndex = Math.max(0, phoneCountries.findIndex((item) => item.code === countryCode));
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!countryMenuOpen) {
        setActiveCountryIndex(currentIndex);
        setCountryMenuOpen(true);
      } else {
        setActiveCountryIndex((index) => (index + (event.key === "ArrowDown" ? 1 : -1) + phoneCountries.length) % phoneCountries.length);
      }
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setCountryMenuOpen(true);
      setActiveCountryIndex(event.key === "Home" ? 0 : phoneCountries.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (countryMenuOpen) selectCountry(phoneCountries[activeCountryIndex].code);
      else {
        setActiveCountryIndex(currentIndex);
        setCountryMenuOpen(true);
      }
    } else if (event.key === "Escape" && countryMenuOpen) {
      event.preventDefault();
      setCountryMenuOpen(false);
    }
  };

  return (
    <div className="phone-field">
      <div className="phone-country-picker" ref={countryPickerRef}>
        <button
          className="phone-country-trigger"
          type="button"
          aria-label="Код страны"
          role="combobox"
          aria-expanded={countryMenuOpen}
          aria-controls="phone-country-options"
          aria-activedescendant={countryMenuOpen ? `phone-country-option-${phoneCountries[activeCountryIndex].code}` : undefined}
          aria-haspopup="listbox"
          onClick={() => {
            setActiveCountryIndex(Math.max(0, phoneCountries.findIndex((item) => item.code === countryCode)));
            setCountryMenuOpen((current) => !current);
          }}
          onKeyDown={handleCountryKeyDown}
        >
          <span>{country.flag}</span><span>{country.dial}</span><span className="phone-country-chevron" aria-hidden="true" />
        </button>
        {countryMenuOpen && (
          <div className="phone-country-menu" id="phone-country-options" role="listbox" aria-label="Выберите страну">
            {phoneCountries.map((item) => (
              <div
                key={item.code}
                id={`phone-country-option-${item.code}`}
                role="option"
                aria-selected={item.code === countryCode}
                className={`phone-country-option${item.code === countryCode ? " is-selected" : ""}${phoneCountries[activeCountryIndex].code === item.code ? " is-active" : ""}`}
                onMouseEnter={() => setActiveCountryIndex(phoneCountries.findIndex((countryOption) => countryOption.code === item.code))}
                onClick={() => selectCountry(item.code)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") selectCountry(item.code);
                }}
              >
                <span>{item.flag}</span><span>{item.name}</span><span>{item.dial}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <input
        name="phoneNational"
        type="tel"
        value={phone}
        onChange={(event) => setPhone(formatPhoneNumber(event.target.value, country.mask))}
        placeholder={country.mask.replace(/#/g, "_")}
        autoComplete="tel-national"
        inputMode="tel"
        aria-label="Номер телефона"
        required
      />
      <input type="hidden" name="phone" value={`${country.dial}${phone.replace(/\D/g, "")}`} />
    </div>
  );
}

function InterestSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, interestOptions.findIndex((option) => option.value === value)));
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedIndex = Math.max(0, interestOptions.findIndex((option) => option.value === value));

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [open]);

  const chooseOption = (index: number) => {
    onChange(interestOptions[index].value);
    setActiveIndex(index);
    setOpen(false);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setActiveIndex(selectedIndex);
        setOpen(true);
      } else {
        setActiveIndex((current) => (current + (event.key === "ArrowDown" ? 1 : -1) + interestOptions.length) % interestOptions.length);
      }
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex(event.key === "Home" ? 0 : interestOptions.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) chooseOption(activeIndex);
      else {
        setActiveIndex(selectedIndex);
        setOpen(true);
      }
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div className={`interest-select${open ? " is-open" : ""}`} ref={rootRef}>
      <input type="hidden" name="interest" value={value} />
      <button
        className="interest-select-trigger"
        type="button"
        role="combobox"
        aria-label="Тема обращения"
        aria-expanded={open}
        aria-controls="interest-options"
        aria-haspopup="listbox"
        aria-activedescendant={open ? `interest-option-${interestOptions[activeIndex].value}` : undefined}
        onClick={() => {
          setActiveIndex(selectedIndex);
          setOpen((current) => !current);
        }}
        onKeyDown={handleKeyDown}
      >
        <span>{interestOptions[selectedIndex].label}</span>
        <span className="interest-select-chevron" aria-hidden="true" />
      </button>
      {open && (
        <div className="interest-select-menu" id="interest-options" role="listbox" aria-label="Тема обращения">
          {interestOptions.map((option, index) => (
            <div
              key={option.value}
              id={`interest-option-${option.value}`}
              className={`interest-select-option${index === selectedIndex ? " is-selected" : ""}${index === activeIndex ? " is-active" : ""}`}
              role="option"
              aria-selected={index === selectedIndex}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => chooseOption(index)}
              onKeyDown={(event) => {
                if (event.key === "Enter") chooseOption(index);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeLegal, setActiveLegal] = useState<LegalKey | null>(null);
  const [courseProgramOpen, setCourseProgramOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [formSent, setFormSent] = useState(false);
  const [interest, setInterest] = useState("service");
  const [phoneFieldKey, setPhoneFieldKey] = useState(0);
  const [activePortfolioIndex, setActivePortfolioIndex] = useState<number | null>(null);
  const portfolioTrackRef = useRef<HTMLDivElement>(null);
  const [portfolioIndex, setPortfolioIndex] = useState(0);
  const [portfolioMaxIndex, setPortfolioMaxIndex] = useState(10);
  const [portfolioVisibleCount, setPortfolioVisibleCount] = useState(4);
  const [portfolioHovered, setPortfolioHovered] = useState(false);
  const [portfolioFocused, setPortfolioFocused] = useState(false);
  const portfolioTouchRef = useRef<{ x: number; y: number } | null>(null);
  const suppressPortfolioClickRef = useRef(false);

  useEffect(() => {
    let frame = 0;
    const updateActiveSection = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const marker = document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 82;
        const sections = navigation
          .map(([, id]) => document.getElementById(id))
          .filter((section): section is HTMLElement => section instanceof HTMLElement);
        const current = [...sections].reverse().find((section) => section.getBoundingClientRect().top <= marker + 24);
        setActiveSection(current?.id ?? null);
      });
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, []);

  const closePortfolio = () => setActivePortfolioIndex(null);
  const showPreviousPortfolioItem = () => setActivePortfolioIndex((index) => index === null ? null : (index - 1 + portfolioItems.length) % portfolioItems.length);
  const showNextPortfolioItem = () => setActivePortfolioIndex((index) => index === null ? null : (index + 1) % portfolioItems.length);
  const movePortfolio = useCallback((direction: -1 | 1) => {
    const track = portfolioTrackRef.current;
    if (!track) return;
    const cards = Array.from(track.children) as HTMLElement[];
    const viewport = track.parentElement;
    if (!viewport || cards.length === 0) return;
    const gap = parseFloat(getComputedStyle(track).columnGap || "0");
    const visibleCount = Math.max(1, Math.floor((viewport.clientWidth + gap) / (cards[0].offsetWidth + gap)));
    const maxIndex = Math.min(portfolioItems.length, Math.max(0, cards.length - visibleCount));
    const nextIndex = Math.max(0, Math.min(maxIndex, portfolioIndex + direction));
    track.style.transform = `translate3d(-${cards[nextIndex].offsetLeft - cards[0].offsetLeft}px, 0, 0)`;
    setPortfolioMaxIndex(maxIndex);
    setPortfolioVisibleCount(visibleCount);
    setPortfolioIndex(nextIndex);
  }, [portfolioIndex]);

  const handlePortfolioTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    portfolioTouchRef.current = { x: touch.clientX, y: touch.clientY };
  };
  const handlePortfolioTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    const start = portfolioTouchRef.current;
    const touch = event.changedTouches[0];
    portfolioTouchRef.current = null;
    if (!start || Math.abs(touch.clientX - start.x) < 45 || Math.abs(touch.clientX - start.x) < Math.abs(touch.clientY - start.y)) return;
    movePortfolio(touch.clientX < start.x ? 1 : -1);
    suppressPortfolioClickRef.current = true;
    window.setTimeout(() => { suppressPortfolioClickRef.current = false; }, 450);
  };
  const handleLightboxTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    const start = portfolioTouchRef.current;
    const touch = event.changedTouches[0];
    portfolioTouchRef.current = null;
    if (!start || Math.abs(touch.clientX - start.x) < 45 || Math.abs(touch.clientX - start.x) < Math.abs(touch.clientY - start.y)) return;
    if (touch.clientX < start.x) showNextPortfolioItem();
    else showPreviousPortfolioItem();
  };
  const handlePortfolioTransitionEnd = (event: ReactTransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== "transform" || portfolioIndex < portfolioItems.length) return;
    const track = event.currentTarget;
    track.style.transitionDuration = "0s";
    track.style.transform = "translate3d(0, 0, 0)";
    setPortfolioIndex(0);
    requestAnimationFrame(() => track.style.removeProperty("transition-duration"));
  };

  useEffect(() => {
    if (!activeLegal) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveLegal(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeLegal]);

  useEffect(() => {
    if (!courseProgramOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCourseProgramOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [courseProgramOpen]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const revealItems = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!("IntersectionObserver" in window) || revealItems.length === 0) return;

    document.documentElement.classList.add("has-scroll-reveal");
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -36px 0px" });

    revealItems.forEach((item) => observer.observe(item));
    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("has-scroll-reveal");
    };
  }, []);

  useEffect(() => {
    if (activePortfolioIndex === null) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActivePortfolioIndex(null);
      if (event.key === "ArrowLeft") setActivePortfolioIndex((index) => index === null ? null : (index - 1 + portfolioItems.length) % portfolioItems.length);
      if (event.key === "ArrowRight") setActivePortfolioIndex((index) => index === null ? null : (index + 1) % portfolioItems.length);
    };
    document.body.classList.add("portfolio-lightbox-open");
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.classList.remove("portfolio-lightbox-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePortfolioIndex]);

  useEffect(() => {
    if (activePortfolioIndex !== null || portfolioHovered || portfolioFocused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const intervalId = window.setInterval(() => {
      if (document.hidden || portfolioIndex >= portfolioItems.length) return;
      movePortfolio(1);
    }, 4200);
    return () => window.clearInterval(intervalId);
  }, [activePortfolioIndex, movePortfolio, portfolioFocused, portfolioHovered, portfolioIndex]);

  useEffect(() => {
    const updatePortfolioBounds = () => {
      const track = portfolioTrackRef.current;
      const viewport = track?.parentElement;
      const firstCard = track?.children[0] as HTMLElement | undefined;
      if (!track || !viewport || !firstCard) return;
      const gap = parseFloat(getComputedStyle(track).columnGap || "0");
      const visibleCount = Math.max(1, Math.floor((viewport.clientWidth + gap) / (firstCard.offsetWidth + gap)));
      setPortfolioMaxIndex(Math.min(portfolioItems.length, Math.max(0, track.children.length - visibleCount)));
      setPortfolioVisibleCount(visibleCount);
      setPortfolioIndex(0);
      track.style.transform = "translate3d(0, 0, 0)";
    };
    updatePortfolioBounds();
    window.addEventListener("resize", updatePortfolioBounds);
    return () => window.removeEventListener("resize", updatePortfolioBounds);
  }, []);

  function submitDemoForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormSent(true);
    event.currentTarget.reset();
    setPhoneFieldKey((key) => key + 1);
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#home" aria-label="Daria Savich — на главную">
          <span className="brand-name">Daria Savich</span>
          <span className="brand-caption">Мастер-бровист · Амбассадор BRONSUN</span>
        </a>
        <button
          className={`menu-toggle${menuOpen ? " is-open" : ""}`}
          type="button"
          aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
        <nav
          className={`main-navigation${menuOpen ? " is-open" : ""}`}
          id="main-navigation"
          aria-label="Основная навигация"
        >
          {navigation.map(([label, id]) => (
            <a key={id} href={`#${id}`} className={activeSection === id ? "is-active" : undefined} aria-current={activeSection === id ? "location" : undefined} onClick={() => setMenuOpen(false)}>
              {label}
            </a>
          ))}
          <div className="mobile-socials">
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram aria-hidden="true" />
            </a>
            <a href={telegramUrl} target="_blank" rel="noopener noreferrer" aria-label="Telegram">
              <FaTelegramPlane aria-hidden="true" />
            </a>
          </div>
        </nav>
        <div className="header-socials">
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <FaInstagram aria-hidden="true" />
            <span>Instagram</span>
          </a>
          <a href={telegramUrl} target="_blank" rel="noopener noreferrer" aria-label="Telegram">
            <FaTelegramPlane aria-hidden="true" />
            <span>Telegram</span>
          </a>
        </div>
      </header>
      <section className="hero" id="home" aria-labelledby="hero-title">
        <div className="hero-photo" aria-hidden="true">
          <Image
            src="/images/hero-daria-wide.png"
            alt=""
            fill
            priority
            unoptimized
            sizes="100vw"
            className="cover-image hero-image-desktop"
          />
          <Image
            src="/images/hero-daria-mobile.jpg"
            alt=""
            fill
            priority
            unoptimized
            sizes="100vw"
            className="cover-image hero-image-mobile"
          />
          <div className="hero-photo-note">
            <span>Естественная</span>
            <span>красота</span>
            <i />
            <span>Профессиональный</span>
            <span>подход</span>
          </div>
        </div>

        <div className="hero-content">
          <p className="eyebrow hero-eyebrow"><span /> Эстетика взгляда и обучение мастерству</p>
          <h1 id="hero-title">Искусство<br />естественной красоты</h1>
          <p className="hero-description">
            Естественные брови и выразительный взгляд. Услуги и обучение для тех,
            кто ценит качество, эстетику и осознанный подход к себе.
          </p>
          <div className="hero-actions">
            <a className="button button-burgundy" href={bookingUrl} target="_blank" rel="noopener noreferrer">
              Выбрать услугу <FaArrowRight aria-hidden="true" />
            </a>
            <a className="button button-outline" href="#course" onClick={() => setInterest("course")}>
            Об авторском курсе <FaArrowRight aria-hidden="true" />
            </a>
          </div>
          <p className="hero-motto"><span /> Красота — в гармонии с собой</p>
        </div>
        <a className="scroll-cue" href="#about" aria-label="Прокрутить к разделу «Обо мне»">
          <span />
        </a>
      </section>

      <section className="about section-light" aria-labelledby="about-title">
        <div className="about-photo-wrap" id="about" data-reveal>
          <Image
            src="/images/about-daria.jpeg"
            alt="Портрет мастера Дарии Савич в студии"
            fill
            unoptimized
            sizes="(max-width: 760px) 100vw, 42vw"
            className="cover-image"
          />
          <div className="course-eye-inset" aria-hidden="true">
            <Image src="/images/course-eye.jpg" alt="" fill unoptimized sizes="150px" className="cover-image" />
          </div>
          <span className="photo-caption">Красота начинается с внимания</span>
        </div>
        <div className="about-copy" data-reveal>
          <p className="eyebrow eyebrow-burgundy">Обо мне <span /></p>
          <h2 id="about-title">Привет,<br />я Дария Савич</h2>
          <p>
            Я действующий мастер-бровист и ламимейкер с опытом более 4 лет,
            преподаватель авторских курсов с продуманными программами и официальный
            амбассадор международного бренда <a href="https://bronsunpro.com/" target="_blank" rel="noopener noreferrer">BRONSUN</a>.
          </p>
          <p>
            Я постоянно учусь и слежу за новыми техниками в индустрии и способами
            продвижения. Более 3 000 $ я вложила в профессиональные знания — и
            продолжаю инвестировать в своё развитие, чтобы делиться с клиентами и
            учениками актуальным опытом.
          </p>
          <a className="text-link text-link-burgundy" href="#contacts">
            Познакомиться ближе <FaArrowRight aria-hidden="true" />
          </a>
          <div className="about-values">
            <span>Естественный результат</span>
            <i />
            <span>Внимание к деталям</span>
          </div>
        </div>
      </section>

      <section className="course section-dark" id="course" aria-labelledby="course-title">
        <div className="course-copy" data-reveal>
          <p className="eyebrow eyebrow-gold">Онлайн-курс повышения квалификации</p>
          <h2 id="course-title">Blonde Formula</h2>
          <h3 className="course-subtitle">Обучение осветлению от А до Я</h3>
          <p className="course-lead">
            Внедрите в работу мои техники и советы — и наблюдайте, как растут ваша экспертность и клиентская база.
          </p>
          <p className="course-format">Видеоуроки с теорией и практикой, а также файлы с конспектами.</p>
          <div className="course-audience">
            <h3>Кому подойдёт</h3>
            <p>Начинающим мастерам, практикующим специалистам, которые хотят освоить актуальные техники, и креативным мастерам.</p>
          </div>
          <div className="course-benefits">
            <span>8 подробных уроков</span>
            <span>Доступ навсегда</span>
            <span>Материалы обновляются</span>
          </div>
          <div className="course-actions">
            <button className="button button-course-program" type="button" onClick={() => setCourseProgramOpen(true)}>
              Смотреть программу <FaArrowRight aria-hidden="true" />
            </button>
            <a className="button button-course-reserve" href="#contacts" onClick={() => setInterest("course")}>
              Забронировать · 90 BYN / 2490 RUB
            </a>
          </div>
        </div>
        <div className="course-side">
          <div className="course-faq">
            <p className="eyebrow eyebrow-gold">Частые вопросы</p>
            {courseFaq.map((item, index) => (
              <div className="course-faq-item" key={item.question}>
                <button
                  className="course-faq-trigger"
                  type="button"
                  aria-expanded={openFaqIndex === index}
                  aria-controls={`course-faq-answer-${index}`}
                  onClick={() => setOpenFaqIndex((current) => current === index ? null : index)}
                >
                  {item.question}
                  <span aria-hidden="true">+</span>
                </button>
                <div
                  className={`course-faq-answer${openFaqIndex === index ? " is-open" : ""}`}
                  id={`course-faq-answer-${index}`}
                  aria-hidden={openFaqIndex !== index}
                  ref={(element) => {
                    if (element) element.style.setProperty("--faq-answer-height", `${element.scrollHeight}px`);
                  }}
                  style={{ maxHeight: openFaqIndex === index ? "var(--faq-answer-height)" : "0px" }}
                >
                  <p>{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="course-questions" data-reveal>
            <div>
              <p className="eyebrow eyebrow-gold">Личная консультация</p>
              <p>Напишите мне в Telegram — обсудим курс и подберём удобный формат консультации.</p>
            </div>
            <a className="button button-gold" href={telegramUrl} target="_blank" rel="noopener noreferrer">
              Задать мне вопрос в Telegram <FaTelegramPlane aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="services section-light" id="services" aria-labelledby="services-title">
        <div className="section-heading" data-reveal>
          <div>
            <p className="eyebrow eyebrow-burgundy">Услуги <span /></p>
            <h2 id="services-title">Уход, созданный<br />для вашего взгляда</h2>
          </div>
          <p>Выберите отдельную услугу или готовый комплекс и запишитесь онлайн.</p>
        </div>
        <div className="service-group" data-reveal>
          <div className="service-group-heading">
            <h3>Отдельные услуги</h3>
          </div>
          <div className="service-list">
            {services.map((service) => (
              <a className="service-row service-row-link" key={service.number} href={"bookingUrl" in service ? service.bookingUrl : bookingUrl} target="_blank" rel="noopener noreferrer" aria-label={`Записаться: ${service.name}`}>
                <span className="service-number">{service.number}</span>
                <div className="service-main">
                  <h4>{service.name}</h4>
                  <p>{service.detail}</p>
                </div>
                <div className="service-price"><span>{service.price}</span></div>
                <span className="service-link" aria-hidden="true">
                  <FaArrowRight aria-hidden="true" />
                </span>
              </a>
            ))}
          </div>
        </div>
        <div className="service-group service-complexes">
          <div className="service-group-heading">
            <h3>Комплексы</h3>
            <p>Несколько услуг и люкс-уход в одном визите</p>
          </div>
          <div className="complex-grid">
            {serviceComplexes.map((complex) => (
              <a href={complex.bookingUrl} target="_blank" rel="noopener noreferrer" className={`complex-card${"featured" in complex ? " complex-card-featured" : ""}`} key={complex.number} aria-label={`Записаться: ${complex.name}`}>
                <div className="complex-card-top"><span>{"featured" in complex ? "Премиальный комплекс" : "Готовый комплекс"}</span><span>{complex.price}</span></div>
                <h4>{complex.name}</h4>
                <p>{complex.detail}</p>
                <span className="text-link" aria-hidden="true">
                  Записаться <FaArrowRight aria-hidden="true" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="portfolio section-light" id="portfolio" aria-labelledby="portfolio-title">
        <div className="section-heading portfolio-heading">
          <div>
            <p className="eyebrow eyebrow-burgundy">Портфолио <span /></p>
            <h2 id="portfolio-title">Результат, который<br className="mobile-break" /> видно</h2>
          </div>
        </div>
        <div className="portfolio-slider" onMouseEnter={() => setPortfolioHovered(true)} onMouseLeave={() => setPortfolioHovered(false)} onFocusCapture={() => setPortfolioFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPortfolioFocused(false); }} onTouchStart={handlePortfolioTouchStart} onTouchEnd={handlePortfolioTouchEnd}>
          <div className="portfolio-grid" ref={portfolioTrackRef} onTransitionEnd={handlePortfolioTransitionEnd}>
          {portfolioSlides.map((item, index) => (
            <button className="portfolio-item" type="button" onClick={() => { if (suppressPortfolioClickRef.current) { suppressPortfolioClickRef.current = false; return; } setActivePortfolioIndex(index % portfolioItems.length); }} key={`${item.image}-${index}`} aria-label={`Открыть фото ${index % portfolioItems.length + 1}`}>
              <div className="portfolio-image-wrap">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  unoptimized
                  sizes="(max-width: 600px) 50vw, 25vw"
                  className="cover-image portfolio-image"
                />
              </div>
            </button>
          ))}
          </div>
          <div className="portfolio-slider-controls" aria-label="Управление слайдером">
            <button type="button" onClick={() => movePortfolio(-1)} disabled={portfolioIndex === 0} aria-label="Предыдущие работы"><FaChevronLeft aria-hidden="true" /></button>
            <span className="portfolio-slider-progress" aria-hidden="true"><span style={{ transform: `scaleX(${Math.min(1, (portfolioIndex + portfolioVisibleCount) / portfolioItems.length)})` }} /></span>
            <button type="button" onClick={() => movePortfolio(1)} disabled={portfolioIndex >= portfolioMaxIndex} aria-label="Следующие работы"><FaChevronRight aria-hidden="true" /></button>
          </div>
        </div>
        {activePortfolioIndex !== null && (
          <div className="portfolio-lightbox" role="dialog" aria-modal="true" aria-label="Просмотр фотографий портфолио" onMouseDown={(event) => { if (event.target === event.currentTarget) closePortfolio(); }} onTouchStart={handlePortfolioTouchStart} onTouchEnd={handleLightboxTouchEnd}>
            <button className="portfolio-lightbox-close" type="button" onClick={closePortfolio} aria-label="Закрыть просмотр"><FaTimes aria-hidden="true" /></button>
            <button className="portfolio-lightbox-arrow portfolio-lightbox-previous" type="button" onClick={showPreviousPortfolioItem} aria-label="Предыдущее фото"><FaChevronLeft aria-hidden="true" /></button>
            <figure className="portfolio-lightbox-content">
              <div className="portfolio-lightbox-image-wrap">
                <Image key={activePortfolioIndex} src={portfolioItems[activePortfolioIndex].image} alt={portfolioItems[activePortfolioIndex].alt} fill unoptimized sizes="100vw" className="portfolio-lightbox-image" />
              </div>
            </figure>
            <button className="portfolio-lightbox-arrow portfolio-lightbox-next" type="button" onClick={showNextPortfolioItem} aria-label="Следующее фото"><FaChevronRight aria-hidden="true" /></button>
          </div>
        )}
      </section>

      <section className="course-callout" aria-label="Авторский курс Blonde Formula" data-reveal>
        <div className="course-callout-card">
          <div className="course-callout-photo">
            <Image src="/images/course-students.jpg" alt="Ученицы курса с сертификатом после обучения" fill unoptimized sizes="(max-width: 760px) 100vw, 40vw" className="cover-image" />
          </div>
          <div className="course-callout-content">
            <p className="eyebrow eyebrow-gold">Онлайн-курс повышения квалификации</p>
            <h2>BLONDE FORMULA</h2>
            <h3 className="course-callout-subtitle">Обучение осветлению от А до Я</h3>
            <p className="course-callout-description">Авторская программа для мастеров: теория, практика и техники для уверенной работы.</p>
            <div className="course-callout-footer">
              <span className="course-callout-price">90 BYN <i>·</i> 2490 RUB</span>
              <a className="button button-gold" href="#contacts" onClick={() => setInterest("course")}>
                Забронировать <FaArrowRight aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="reviews section-light" id="reviews" aria-labelledby="reviews-title">
        <div className="section-heading" data-reveal>
          <div>
            <p className="eyebrow eyebrow-burgundy">Отзывы <span /></p>
            <h2 id="reviews-title">Тёплые слова</h2>
          </div>
        </div>
        <div className="review-grid">
          {reviews.map((review) => (
            <figure className="review" data-reveal key={review.author}>
              <div className="review-stars" aria-label="5 из 5">
                {[0, 1, 2, 3, 4].map((star) => <FaStar key={star} aria-hidden="true" />)}
              </div>
              <blockquote>{review.text}</blockquote>
              <figcaption>{review.author}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="contact section-dark" id="contacts" aria-labelledby="contact-title">
        <div className="contact-intro" data-reveal>
          <p className="eyebrow eyebrow-gold">Будем на связи</p>
          <h2 id="contact-title">Обсудим ваши вопросы</h2>
          <p className="contact-description">Запишитесь на услугу, узнайте подробности курса или задайте вопрос — через форму или напрямую.</p>
          <div className="contact-methods">
            <a className="contact-method" href="tel:+375297887992">
              <span className="contact-method-icon"><FaPhone aria-hidden="true" /></span>
              <span><small>Позвонить</small><strong>+375 (29) 788 79 92</strong></span>
              <FaArrowRight className="contact-method-arrow" aria-hidden="true" />
            </a>
            <a className="contact-method" href={telegramUrl} target="_blank" rel="noopener noreferrer">
              <span className="contact-method-icon"><FaTelegramPlane aria-hidden="true" /></span>
              <span><small>Написать в Telegram</small><strong>@dariiisav</strong></span>
              <FaArrowRight className="contact-method-arrow" aria-hidden="true" />
            </a>
            <a className="contact-method" href={instagramUrl} target="_blank" rel="noopener noreferrer">
              <span className="contact-method-icon"><FaInstagram aria-hidden="true" /></span>
              <span><small>Следить за работами</small><strong>Instagram</strong></span>
              <FaArrowRight className="contact-method-arrow" aria-hidden="true" />
            </a>
          </div>
          <p className="contact-hours"><span /> Режим работы · 10:00–19:30</p>
        </div>
        <form className="contact-form" data-reveal onSubmit={submitDemoForm}>
          <p className="contact-form-intro">Напишите, чем я могу помочь: с записью на услугу, обучением или другим вопросом.</p>
          <label>
            Ваше имя
            <input name="name" type="text" placeholder="Как к вам обращаться" autoComplete="name" required />
          </label>
          <label>
            Номер телефона
            <PhoneField key={phoneFieldKey} />
          </label>
          <label>
            Ник в Telegram
            <input name="telegram" type="text" placeholder="@username" autoComplete="off" />
          </label>
          <label>
            Тема обращения
            <InterestSelect value={interest} onChange={setInterest} />
          </label>
          <label>
            Сообщение
            <textarea name="message" rows={4} placeholder="Расскажите, что вас интересует" />
          </label>
          <div className="contact-consent">
            <input id="personal-data-consent" name="consent" type="checkbox" value="accepted" required />
            <div>
              <label htmlFor="personal-data-consent">Согласен с условиями обработки персональных данных</label>
              <button type="button" onClick={() => setActiveLegal("privacy")}>Политика конфиденциальности</button>
            </div>
          </div>
          <button className="button button-gold" type="submit">
            Связаться <FaArrowRight aria-hidden="true" />
          </button>
          {formSent && (
            <p className="form-success" role="status">
              Спасибо! Форма заполнена.
            </p>
          )}
        </form>
      </section>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand-block">
            <a className="brand brand-footer" href="#home">
              <span className="brand-name">Daria Savich</span>
              <span className="brand-caption">Мастер-бровист · Амбассадор BRONSUN</span>
            </a>
            <p>Свяжитесь со мной, чтобы обсудить процедуру или обучение.</p>
          </div>
          <div className="company-details">
            <h2>Контакты</h2>
            <div className="footer-contact-links">
              <a href="tel:+375297887992"><FaPhone aria-hidden="true" /> +375 (29) 788 79 92</a>
              <a href="mailto:daruwell2007@gmail.com"><FaEnvelope aria-hidden="true" /> daruwell2007@gmail.com</a>
              <a href={telegramUrl} target="_blank" rel="noopener noreferrer" aria-label="Telegram"><FaTelegramPlane aria-hidden="true" /> Telegram</a>
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram aria-hidden="true" /> Instagram</a>
            </div>
            <p>Режим работы: 10:00–19:30</p>
          </div>
          <div className="company-details company-legal-details">
            <h2>Юридические данные</h2>
            <p>ИП Савич Дария Викторовна</p>
            <p>Юридический адрес: Беларусь, Брестская область, г. Барановичи, ул. Домейко, дом 6, кв. 17</p>
            <p>Свидетельство о государственной регистрации ИП: № 291937817 от 09.09.2026</p>
            <p>Орган, выдавший свидетельство: Барановичский горисполком</p>
            <p>УНП: 291937817</p>
            <p>Расчетный счет: BY28POIS30130188864001933001</p>
            <p>ОАО «Паритетбанк» · БИК: POISBY2X</p>
          </div>
          <nav className="footer-legal" aria-label="Правовая информация">
            <button type="button" onClick={() => setActiveLegal("delivery")}>Порядок оказания услуг</button>
            <button type="button" onClick={() => setActiveLegal("returns")}>Возврат и отмена</button>
            <button type="button" onClick={() => setActiveLegal("payment")}>Оплата и безопасность</button>
            <button type="button" onClick={() => setActiveLegal("privacy")}>Конфиденциальность</button>
          </nav>
        </div>
        <div className="payment-strip">
          <div className="payment-copy">
            <span>Способы оплаты</span>
          </div>
          <Image
            src="/images/payment-logos.png"
            alt="Visa, Visa Secure, Mastercard, Mastercard ID Check, Белкарт, Белкарт ИнтернетПароль, Apple Pay и Samsung Pay"
            width={13637}
            height={1377}
            unoptimized
            sizes="(max-width: 760px) 100vw, 62vw"
            className="payment-logos"
          />
        </div>
        <div className="footer-bottom">
          <span>© 2026 Daria Savich. Все права защищены.</span>
          <a href="#home">Наверх <FaArrowRight aria-hidden="true" /></a>
        </div>
      </footer>

      {activeLegal && (
        <div className="dialog-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setActiveLegal(null);
        }}>
          <section className="legal-dialog" role="dialog" aria-modal="true" aria-labelledby="legal-title">
            <button className="dialog-close" type="button" onClick={() => setActiveLegal(null)} aria-label="Закрыть">
              <FaTimes aria-hidden="true" />
            </button>
            <p className="eyebrow eyebrow-burgundy">Демо-информация</p>
            <h2 id="legal-title">{legalContent[activeLegal].title}</h2>
            {legalContent[activeLegal].paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <button className="button button-burgundy" type="button" onClick={() => setActiveLegal(null)}>Понятно</button>
          </section>
        </div>
      )}

      {courseProgramOpen && (
        <div className="dialog-backdrop course-dialog-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setCourseProgramOpen(false);
        }}>
          <section className="course-dialog" role="dialog" aria-modal="true" aria-labelledby="course-dialog-title">
            <button className="dialog-close" type="button" onClick={() => setCourseProgramOpen(false)} aria-label="Закрыть программу">
              <FaTimes aria-hidden="true" />
            </button>
            <p className="eyebrow eyebrow-burgundy">BLONDE FORMULA · 8 уроков</p>
            <h2 id="course-dialog-title">Программа курса</h2>
            <ol className="course-dialog-lessons">
              {courseTopics.map((lesson, index) => (
                <li key={lesson.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{lesson.title}</h3>
                    <p className="course-dialog-topics">{lesson.topics}</p>
                    <p>{lesson.result}</p>
                  </div>
                </li>
              ))}
            </ol>
            <a className="button button-burgundy" href="#contacts" onClick={() => { setInterest("course"); setCourseProgramOpen(false); }}>
              Забронировать · 90 BYN / 2490 RUB <FaArrowRight aria-hidden="true" />
            </a>
          </section>
        </div>
      )}
    </main>
  );
}
