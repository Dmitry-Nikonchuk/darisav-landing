"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type TouchEvent as ReactTouchEvent,
  type TransitionEvent as ReactTransitionEvent,
} from "react";
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

const instagramUrl =
  "https://www.instagram.com/dariii.sav?stkn=c3lhaWM2MWFpMmZy";
const telegramUrl = "https://t.me/dariiisav";
const courseBookingTelegramUrl = (tariff: string) =>
  `${telegramUrl}?text=${encodeURIComponent(`Привет! Я хочу забронировать место на курс Brow Stylist, тариф "${tariff}"`)}`;
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
    detail:
      "Осветление, коррекция воском и пинцетом, прореживание и премиум-уход.",
    price: "35 BYN",
    bookingUrl: "https://dikidi.net/1954760?p=2.pi-ssm-si&o=7&s=20999498",
  },
  {
    number: "05",
    name: "Ламинирование/коррекция",
    detail:
      "Ламинирование, коррекция воском и пинцетом, прореживание и премиум-уход.",
    price: "35 BYN",
    bookingUrl: "https://dikidi.net/1954760?p=2.pi-ssm-si&o=7&s=20979954",
  },
  {
    number: "06",
    name: "Осветление/окрашивание/коррекция",
    detail:
      "Для тёмных или густых бровей: осветление, окрашивание, коррекция и премиум-уход.",
    price: "40 BYN",
    bookingUrl: "https://dikidi.net/1954760?p=2.pi-ssm-si&o=7&s=20979854",
  },
  {
    number: "07",
    name: "Ламинирование/окрашивание/коррекция",
    detail:
      "Ламинирование бровей, окрашивание краской, коррекция и премиум-уход.",
    price: "45 BYN",
    bookingUrl: "https://dikidi.net/1954760?p=2.pi-ssm-si&o=7&s=20979927",
  },
  {
    number: "08",
    name: "Ламинирование ресниц",
    detail:
      "Ламинирование верхних ресниц с окрашиванием и премиум-уходом в конце процедуры.",
    price: "40 BYN",
    bookingUrl: "https://dikidi.net/1954760?p=2.pi-ssm-si&o=7&s=22566385",
  },
  {
    number: "09",
    name: "Окрашивание ресниц (доп услуга к оформлению бровей)",
    detail:
      "Окрашивание верхних и нижних ресниц краской — дополнительная услуга к оформлению бровей.",
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
    detail:
      "Ламинирование ресниц с окрашиванием (по желанию) и люкс-уходом; окрашивание бровей в любой технике, коррекция воском или пинцетом и люкс-уход.",
    price: "70 BYN",
    bookingUrl: "https://dikidi.net/1954760?p=2.pi-ssm-si&o=7&s=22567153",
  },
  {
    number: "02",
    name: "Комплекс STANDART 2",
    detail:
      "Ламинирование ресниц с окрашиванием (по желанию) и люкс-уходом; ламинирование бровей, коррекция воском или пинцетом и люкс-уход.",
    price: "70 BYN",
    bookingUrl: "https://dikidi.net/1954760?p=2.pi-ssm-si&o=7&s=22568182",
  },
  {
    number: "03",
    name: "Комплекс VIP",
    detail:
      "Ламинирование ресниц с окрашиванием (по желанию) и люкс-уходом; ламинирование бровей, окрашивание в любой технике, коррекция и люкс-уход.",
    price: "80 BYN",
    bookingUrl: "https://dikidi.net/1954760?p=2.pi-ssm-si&o=7&s=22567136",
    featured: true,
  },
] as const;

const courseTopics = [
  {
    title: "Осветление — химия",
    topics: "Виды продуктов · химический процесс · ошибки и их исправление",
    result:
      "Поймёте, как работает осветление волосков бровей, и перестанете допускать ошибки, из-за которых результат не получается.",
  },
  {
    title: "Чем работать?",
    topics: "Пудра и дилютер · отличия · выбор продукта под исходник",
    result:
      "Научитесь различать продукты и выбирать подходящий под исходник и запрос клиента.",
  },
  {
    title: "Состояние бровей",
    topics:
      "Технология процедуры · сохранение качества волосков · восстановление после неудачи",
    result:
      "Получите чёткую структуру работы, техники сохранения качества волосков и подборку уходовых средств.",
  },
  {
    title: "Дилютер",
    topics:
      "Демонстрация на модели · анализ исходника · время выдержки · остановка реакции",
    result:
      "Научитесь работать с кремовым осветлителем, подбирать время выдержки и грамотно останавливать реакцию.",
  },
  {
    title: "Пудра",
    topics:
      "Демонстрация осветления бровей на модели · логика действий · анализ исходника · остановка реакции",
    result:
      "Разберётесь в работе с порошковыми осветлителями и выборе времени выдержки.",
  },
  {
    title: "Перманент",
    topics:
      "Демонстрация на модели · контроль процесса · натуральная техника перекрытия",
    result:
      "Увидите осветление на перманенте и освоите технику перекрытия для блондинок.",
  },
  {
    title: "Тотал блонд",
    topics:
      "Полное осветление бровей · чистый белоснежный оттенок · подбор продуктов",
    result:
      "Научитесь создавать чистый оттенок без желтизны для яркого креативного окрашивания.",
  },
  {
    title: "Окрашивание без затемнения",
    topics:
      "Окрашивание пористых волосков бровей после осветления · частые ошибки",
    result:
      "Освоите технику натурального или графичного окрашивания без затемнения бровей.",
  },
] as const;

const courseFaq = [
  {
    question: "Что я получу после курса?",
    answer:
      "Научитесь работать в актуальных техниках осветления, подбирать время выдержки, нейтрализовать желтизну, окрашивать без затемнения и доводить результат до идеала.",
  },
  {
    question: "Есть ли обратная связь?",
    answer:
      "Можно связаться со мной по любому вопросу: я рассмотрю вашу работу, укажу на возможные ошибки и дам совет. Отвечаю в ближайшее рабочее время.",
  },
] as const;

const baseCourseFaq = [
  {
    question: "Сейчас большая конкуренция, стоит ли обучаться?",
    answer:
      "Конкуренции бояться не стоит: в обучении есть модуль по продвижению и поиску клиентов. Способы рабочие и не требуют много времени.",
  },
  {
    question: "А вдруг клиенту не понравится моя работа?",
    answer:
      "Большой акцент сделан на практику: вы начинаете работать самостоятельно уже со второй моделью. Я нахожусь рядом, помогу увидеть и исправить ошибки.",
  },
  {
    question: "Как быстро окупится обучение?",
    answer:
      "Ориентир — около месяца (18 рабочих дней), если уделять работе с одним клиентом примерно час в день. Результат зависит от вашей практики и продвижения.",
  },
] as const;

const baseCourseBenefits = [
  "станете уверенным в себе мастером, научитесь работать в самых актуальных техниках, подбирать форму по типу лица анализируя любые исходники, в том числе и сложные, не будете бояться конкуренции",
  "сможете закрывать любой запрос клиента, работать в самых актуальных и востребованных техниках, научитесь работать с красителями, выполнять любые процедуры грамотно и конечно работать без страха",
  "готовое портфолио, посты и рилсы, научитесь вести инсту и будете знать, как продавать свои услуги",
] as const;

const baseCourseModules = [
  {
    title: "Профессия и старт",
    items: [
      "Профессия бровиста: преимущества и возможности заработка",
      "Форматы работы: найм или работа на себя, официальное оформление",
      "Рабочее место мастера: где заказать материалы и на чём можно сэкономить",
      "Дезинфекция и стерилизация: все этапы обработки",
    ],
  },
  {
    title: "Кожа, форма и коррекция",
    items: [
      "Типы и состояния кожи, pH",
      "Подготовка кожи и её влияние на стойкость окрашивания",
      "Строение волосков бровей",
      "Коррекция воском и пинцетом, прореживание и правила аккуратной работы",
      "Построение формы с учётом анатомии и типа лица",
      "Сложные брови: асимметрия, перещипы и возрастная кожа",
    ],
  },
  {
    title: "Колористика и окрашивание",
    items: [
      "Колористика от А до Я: УГТ и ЦН",
      "Процесс окрашивания бровей, цветотипы и подбор оттенка",
      "Оксиды: виды, проценты, функции и влияние на отпечаток",
      "Стойкость окрашивания и способы её увеличить",
      "Красители, продукты Bronsun и работа с прямыми пигментами",
      "Осветление бровей: продукты, техника, остановка реакции и оценка результата",
    ],
  },
  {
    title: "Ламинирование бровей",
    items: [
      "Ламинирование как химический процесс и контроль процедуры",
      "Пошаговая техника и противопоказания",
      "Виды составов и их особенности",
      "Выдержка: тайминг, типы волосков и факторы влияния",
      "Окрашивание после ламинирования без затемнения волосков",
      "Разбор ошибок: как избежать повреждения и заломов",
    ],
  },
  {
    title: "Продвижение и клиенты",
    items: [
      "STYLE: урок по продвижению и поиску клиентов",
      "STYLE PRO: закрытый Telegram-канал по продвижению",
      "STYLE PRO: упаковка аккаунта, ведение страницы и смысловой контент",
      "STYLE PRO: Reels и контент, который помогает получать записи",
      "STYLE PRO: сторис — идеи, разбор ошибок и что транслировать",
      "STYLE PRO: работа с клиентами и моделями, коммуникация и поиск клиентов",
    ],
  },
] as const;

const baseCourseTariffs = [
  {
    name: "STYLE",
    price: "450 BYN",
    demoModels: "1 показательная модель",
    practice: "4 отработки на моделях",
    extras: [
      "1 день теории и 2 дня практики",
      "Бессрочная связь с наставником",
      "Методичка для повторения материала",
      "Печатный сертификат и авторские приёмы",
    ],
  },
  {
    name: "STYLE PRO",
    price: "600 BYN",
    demoModels: "2 показательные модели",
    practice: "6 отработок на моделях",
    extras: [
      "1 день теории и 2 дня практики",
      "Бессрочная связь с наставником",
      "Закрытый Telegram-канал по продвижению",
      "Уроки по продвижению и поиску клиентов",
      "Методичка, печатный сертификат и авторские приёмы",
    ],
  },
] as const;

const baseCourseReviews = [
  "Хочу выразить тебе огромную благодарность за столь ёмкий курс и, что главное, без воды! Всегда страшно обжечься, когда пробуешь для себя что-то новое, страшно выбрать не того преподавателя… Но, выбрав тебя, вообще ни разу не пожалела! Столько информации, столько разных фишек, интересных моментов… Это просто ВАУ. Когда ехала на обучение, думала, что выйду с пустой головой, зря потрачу деньги, что в целом не понравится процедура и подача, но нет! Я вышла заряженная с огромным желанием дальше развиваться, с желанием поскорее начать работу ☺️ Ты чудесный преподаватель, чудесная девушка, мне было суперкомфортно с тобой работать! Спасибо огромное за знания, за уверенность, за терпение! Ни разу не пожалела, что выбрала именно тебя 🥹❤️",
  "Хочу тебе ещё раз сказать огромное спасибо! Получила удовольствие от прохождения курса. Это было очень продуктивное обучение. Спасибо за знания, положительный опыт и возможность обрести новую профессию. С тобой я поняла, что такое качественное обучение: ты преподаёшь не только грамотно, но и интересно 💓",
  "Дашуль, хочу оставить отзыв после обучения. СПАСИБО ТЕБЕ БОЛЬШОЕ, что учла каждую малейшую деталь своей работы, даже не дала мне шанса задать вопрос. Ответ появлялся до возникновения вопроса. Это чудесно. Очень доступным языком всё объясняешь, проверяешь усвоенный материал — это мега круто, спасибо. Мне всё очень понравилось, но хочется ещё пару разочков встретиться для отработки 💪🏻 Ты мега комфортная и классная и как мастер, и как человек. Очень здорово, что ты останешься со мной на связи, не бросишь одну в море бьюти 😆❤️",
] as const;

const blondeCourseReviews = [
  "Дария, привет!\nНе могу не написать слова благодарности 🤭\n\nПосле твоего повышения квалификации я наконец-то начала работать не боясь сложных исходников. И я перестала думать, какие брови придут следующие, так как теперь я умею делать ВСЁ.\n\nДо встречи с тобой я вообще не знала, что брови осветляют, а когда начала выкладывать работы с осветлением, клиентов резко стало больше.\n\nСама я бы точно не разобралась в этой услуге, там столько мелких важных моментов, о которых в моменте даже не думаешь… Но я очень рада, что прошла его именно у тебя. Сколько обучений ни проходила, никто так понятно не объясняет, как ты. Чётко, понятно, русским языком 👌🏻\n\nСпасибо большое за эти бесценные знания и опыт!!!!!!!",
] as const;

// Add student work image paths here; the gallery appears automatically once photos are supplied.
const studentWorkImages: { src: string; alt: string }[] = [
  {
    src: "/images/student-works/student-work-01.jpg",
    alt: "Работа ученицы курса Brow Stylist",
  },
  {
    src: "/images/student-works/student-work-02.jpg",
    alt: "Работа ученицы курса Brow Stylist",
  },
  {
    src: "/images/student-works/student-work-03.jpg",
    alt: "Работа ученицы курса Brow Stylist",
  },
  {
    src: "/images/student-works/student-work-04.jpg",
    alt: "Работа ученицы курса Brow Stylist",
  },
  {
    src: "/images/student-works/student-work-05.jpg",
    alt: "Работа ученицы курса Brow Stylist",
  },
  {
    src: "/images/student-works/student-work-06.jpg",
    alt: "Работа ученицы курса Brow Stylist",
  },
];

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
      "Форма может содержать имя, телефон и ник в Telegram. Сейчас данные никуда не отправляются и не сохраняются.",
      "Перед запуском сайта этот раздел будет дополнен сведениями об операторе персональных данных, целях и сроках обработки, а также способом отозвать согласие.",
    ],
  },
} as const;

type LegalKey = keyof typeof legalContent;

const phoneCountries = [
  {
    code: "BY",
    flag: "🇧🇾",
    name: "Беларусь",
    dial: "+375",
    mask: "## ###-##-##",
  },
  {
    code: "RU",
    flag: "🇷🇺",
    name: "Россия",
    dial: "+7",
    mask: "(###) ###-##-##",
  },
  {
    code: "UA",
    flag: "🇺🇦",
    name: "Украина",
    dial: "+380",
    mask: "(##) ###-##-##",
  },
  { code: "PL", flag: "🇵🇱", name: "Польша", dial: "+48", mask: "### ### ###" },
  { code: "LT", flag: "🇱🇹", name: "Литва", dial: "+370", mask: "(6##) #####" },
  { code: "LV", flag: "🇱🇻", name: "Латвия", dial: "+371", mask: "## ### ###" },
  {
    code: "DE",
    flag: "🇩🇪",
    name: "Германия",
    dial: "+49",
    mask: "#### ########",
  },
  {
    code: "GB",
    flag: "🇬🇧",
    name: "Великобритания",
    dial: "+44",
    mask: "#### ### ####",
  },
  { code: "US", flag: "🇺🇸", name: "США", dial: "+1", mask: "(###) ###-####" },
  {
    code: "CA",
    flag: "🇨🇦",
    name: "Канада",
    dial: "+1",
    mask: "(###) ###-####",
  },
  {
    code: "KZ",
    flag: "🇰🇿",
    name: "Казахстан",
    dial: "+7",
    mask: "(###) ###-##-##",
  },
  {
    code: "GE",
    flag: "🇬🇪",
    name: "Грузия",
    dial: "+995",
    mask: "(###) ###-###",
  },
  { code: "AM", flag: "🇦🇲", name: "Армения", dial: "+374", mask: "## ###-###" },
  {
    code: "MD",
    flag: "🇲🇩",
    name: "Молдова",
    dial: "+373",
    mask: "(###) ##-###",
  },
  {
    code: "FR",
    flag: "🇫🇷",
    name: "Франция",
    dial: "+33",
    mask: "# ## ## ## ##",
  },
  { code: "IT", flag: "🇮🇹", name: "Италия", dial: "+39", mask: "### ### ####" },
  { code: "ES", flag: "🇪🇸", name: "Испания", dial: "+34", mask: "### ### ###" },
  {
    code: "TR",
    flag: "🇹🇷",
    name: "Турция",
    dial: "+90",
    mask: "(###) ###-##-##",
  },
  {
    code: "IL",
    flag: "🇮🇱",
    name: "Израиль",
    dial: "+972",
    mask: "##-###-####",
  },
  { code: "AE", flag: "🇦🇪", name: "ОАЭ", dial: "+971", mask: "## ### ####" },
  { code: "IN", flag: "🇮🇳", name: "Индия", dial: "+91", mask: "#####-#####" },
  { code: "CN", flag: "🇨🇳", name: "Китай", dial: "+86", mask: "### #### ####" },
  { code: "JP", flag: "🇯🇵", name: "Япония", dial: "+81", mask: "##-####-####" },
  {
    code: "PT",
    flag: "🇵🇹",
    name: "Португалия",
    dial: "+351",
    mask: "### ### ###",
  },
  {
    code: "NL",
    flag: "🇳🇱",
    name: "Нидерланды",
    dial: "+31",
    mask: "# ########",
  },
  {
    code: "BE",
    flag: "🇧🇪",
    name: "Бельгия",
    dial: "+32",
    mask: "### ## ## ##",
  },
  {
    code: "CH",
    flag: "🇨🇭",
    name: "Швейцария",
    dial: "+41",
    mask: "## ### ## ##",
  },
  { code: "AT", flag: "🇦🇹", name: "Австрия", dial: "+43", mask: "### ######" },
  { code: "CZ", flag: "🇨🇿", name: "Чехия", dial: "+420", mask: "### ### ###" },
  {
    code: "SK",
    flag: "🇸🇰",
    name: "Словакия",
    dial: "+421",
    mask: "### ### ###",
  },
  { code: "EE", flag: "🇪🇪", name: "Эстония", dial: "+372", mask: "#### ####" },
  {
    code: "FI",
    flag: "🇫🇮",
    name: "Финляндия",
    dial: "+358",
    mask: "## ### ####",
  },
  { code: "SE", flag: "🇸🇪", name: "Швеция", dial: "+46", mask: "## ### ####" },
  { code: "NO", flag: "🇳🇴", name: "Норвегия", dial: "+47", mask: "### ## ###" },
  { code: "DK", flag: "🇩🇰", name: "Дания", dial: "+45", mask: "## ## ## ##" },
  { code: "GR", flag: "🇬🇷", name: "Греция", dial: "+30", mask: "### ### ####" },
  { code: "RO", flag: "🇷🇴", name: "Румыния", dial: "+40", mask: "### ### ###" },
  {
    code: "BG",
    flag: "🇧🇬",
    name: "Болгария",
    dial: "+359",
    mask: "## ### ####",
  },
  {
    code: "HR",
    flag: "🇭🇷",
    name: "Хорватия",
    dial: "+385",
    mask: "## ### ####",
  },
  {
    code: "SI",
    flag: "🇸🇮",
    name: "Словения",
    dial: "+386",
    mask: "## ### ###",
  },
  { code: "RS", flag: "🇷🇸", name: "Сербия", dial: "+381", mask: "## ### ####" },
  {
    code: "AZ",
    flag: "🇦🇿",
    name: "Азербайджан",
    dial: "+994",
    mask: "## ### ## ##",
  },
  {
    code: "UZ",
    flag: "🇺🇿",
    name: "Узбекистан",
    dial: "+998",
    mask: "## ### ####",
  },
  {
    code: "KG",
    flag: "🇰🇬",
    name: "Кыргызстан",
    dial: "+996",
    mask: "### ### ###",
  },
  {
    code: "TJ",
    flag: "🇹🇯",
    name: "Таджикистан",
    dial: "+992",
    mask: "## ### ####",
  },
  {
    code: "KR",
    flag: "🇰🇷",
    name: "Южная Корея",
    dial: "+82",
    mask: "##-####-####",
  },
  { code: "TH", flag: "🇹🇭", name: "Таиланд", dial: "+66", mask: "## ### ####" },
  {
    code: "VN",
    flag: "🇻🇳",
    name: "Вьетнам",
    dial: "+84",
    mask: "## #### ####",
  },
  {
    code: "ID",
    flag: "🇮🇩",
    name: "Индонезия",
    dial: "+62",
    mask: "###-####-####",
  },
  {
    code: "PH",
    flag: "🇵🇭",
    name: "Филиппины",
    dial: "+63",
    mask: "### ### ####",
  },
  {
    code: "AU",
    flag: "🇦🇺",
    name: "Австралия",
    dial: "+61",
    mask: "### ### ###",
  },
  {
    code: "NZ",
    flag: "🇳🇿",
    name: "Новая Зеландия",
    dial: "+64",
    mask: "## ### ####",
  },
  {
    code: "BR",
    flag: "🇧🇷",
    name: "Бразилия",
    dial: "+55",
    mask: "## #####-####",
  },
  {
    code: "MX",
    flag: "🇲🇽",
    name: "Мексика",
    dial: "+52",
    mask: "## #### ####",
  },
  {
    code: "AR",
    flag: "🇦🇷",
    name: "Аргентина",
    dial: "+54",
    mask: "## ####-####",
  },
  { code: "ZA", flag: "🇿🇦", name: "ЮАР", dial: "+27", mask: "## ### ####" },
  { code: "EG", flag: "🇪🇬", name: "Египет", dial: "+20", mask: "## #### ####" },
  {
    code: "SA",
    flag: "🇸🇦",
    name: "Саудовская Аравия",
    dial: "+966",
    mask: "## ### ####",
  },
  {
    code: "NG",
    flag: "🇳🇬",
    name: "Нигерия",
    dial: "+234",
    mask: "### ### ####",
  },
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
  if (
    timeZoneCountry &&
    phoneCountries.some((item) => item.code === timeZoneCountry)
  )
    return timeZoneCountry;
  const languageTags = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];
  const region = languageTags
    .map((language) => {
      try {
        return new Intl.Locale(language).region;
      } catch {
        return language.match(/-([A-Za-z]{2})(?:-|$)/)?.[1]?.toUpperCase();
      }
    })
    .find(
      (candidate) =>
        candidate && phoneCountries.some((item) => item.code === candidate),
    );
  return region ?? "BY";
}

function formatPhoneNumber(rawValue: string, mask: string) {
  const digits = rawValue
    .replace(/\D/g, "")
    .slice(0, (mask.match(/#/g) ?? []).length);
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
  const localeCountryCode = useSyncExternalStore(
    subscribeToNothing,
    getLocaleCountryCode,
    () => "BY",
  );
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(
    null,
  );
  const countryCode = selectedCountryCode ?? localeCountryCode;
  const [phone, setPhone] = useState("");
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);
  const [activeCountryIndex, setActiveCountryIndex] = useState(0);
  const countryPickerRef = useRef<HTMLDivElement>(null);
  const country =
    phoneCountries.find((item) => item.code === countryCode) ??
    phoneCountries[0];

  useEffect(() => {
    if (!countryMenuOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        !countryPickerRef.current?.contains(event.target)
      )
        setCountryMenuOpen(false);
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
  const handleCountryKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
  ) => {
    const currentIndex = Math.max(
      0,
      phoneCountries.findIndex((item) => item.code === countryCode),
    );
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!countryMenuOpen) {
        setActiveCountryIndex(currentIndex);
        setCountryMenuOpen(true);
      } else {
        setActiveCountryIndex(
          (index) =>
            (index +
              (event.key === "ArrowDown" ? 1 : -1) +
              phoneCountries.length) %
            phoneCountries.length,
        );
      }
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setCountryMenuOpen(true);
      setActiveCountryIndex(
        event.key === "Home" ? 0 : phoneCountries.length - 1,
      );
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (countryMenuOpen)
        selectCountry(phoneCountries[activeCountryIndex].code);
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
          aria-activedescendant={
            countryMenuOpen
              ? `phone-country-option-${phoneCountries[activeCountryIndex].code}`
              : undefined
          }
          aria-haspopup="listbox"
          onClick={() => {
            setActiveCountryIndex(
              Math.max(
                0,
                phoneCountries.findIndex((item) => item.code === countryCode),
              ),
            );
            setCountryMenuOpen((current) => !current);
          }}
          onKeyDown={handleCountryKeyDown}
        >
          <span>{country.flag}</span>
          <span>{country.dial}</span>
          <span className="phone-country-chevron" aria-hidden="true" />
        </button>
        {countryMenuOpen && (
          <div
            className="phone-country-menu"
            id="phone-country-options"
            role="listbox"
            aria-label="Выберите страну"
          >
            {phoneCountries.map((item) => (
              <div
                key={item.code}
                id={`phone-country-option-${item.code}`}
                role="option"
                aria-selected={item.code === countryCode}
                className={`phone-country-option${item.code === countryCode ? " is-selected" : ""}${phoneCountries[activeCountryIndex].code === item.code ? " is-active" : ""}`}
                onMouseEnter={() =>
                  setActiveCountryIndex(
                    phoneCountries.findIndex(
                      (countryOption) => countryOption.code === item.code,
                    ),
                  )
                }
                onClick={() => selectCountry(item.code)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") selectCountry(item.code);
                }}
              >
                <span>{item.flag}</span>
                <span>{item.name}</span>
                <span>{item.dial}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <input
        name="phoneNational"
        type="tel"
        value={phone}
        onChange={(event) =>
          setPhone(formatPhoneNumber(event.target.value, country.mask))
        }
        placeholder={country.mask.replace(/#/g, "_")}
        autoComplete="tel-national"
        inputMode="tel"
        aria-label="Номер телефона"
        required
      />
      <input
        type="hidden"
        name="phone"
        value={`${country.dial}${phone.replace(/\D/g, "")}`}
      />
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeLegal, setActiveLegal] = useState<LegalKey | null>(null);
  const [activeCourse, setActiveCourse] = useState<"blonde" | "base" | null>(
    null,
  );
  const [openCourseFaq, setOpenCourseFaq] = useState<number | null>(null);
  const [openBaseModule, setOpenBaseModule] = useState<number | null>(0);
  const [studentPhotoIndex, setStudentPhotoIndex] = useState(0);
  const [studentGalleryOpen, setStudentGalleryOpen] = useState(false);
  const [studentReviewIndex, setStudentReviewIndex] = useState(0);
  const studentWorkTouchRef = useRef<{ x: number; y: number } | null>(null);
  const studentReviewTouchRef = useRef<{ x: number; y: number } | null>(null);
  const suppressStudentWorkClickRef = useRef(false);
  const courseReviews =
    activeCourse === "blonde" ? blondeCourseReviews : baseCourseReviews;

  const startStudentWorkSwipe = (event: ReactTouchEvent<HTMLElement>) => {
    const touch = event.touches[0];
    studentWorkTouchRef.current = { x: touch.clientX, y: touch.clientY };
  };
  const endStudentWorkSwipe = (event: ReactTouchEvent<HTMLElement>) => {
    const start = studentWorkTouchRef.current;
    const touch = event.changedTouches[0];
    studentWorkTouchRef.current = null;
    if (
      !start ||
      studentWorkImages.length < 2 ||
      Math.abs(touch.clientX - start.x) < 45 ||
      Math.abs(touch.clientX - start.x) < Math.abs(touch.clientY - start.y)
    )
      return;
    setStudentPhotoIndex(
      (index) =>
        (index +
          (touch.clientX < start.x ? 1 : -1) +
          studentWorkImages.length) %
        studentWorkImages.length,
    );
    suppressStudentWorkClickRef.current = true;
    window.setTimeout(() => {
      suppressStudentWorkClickRef.current = false;
    }, 450);
  };
  const startStudentReviewSwipe = (event: ReactTouchEvent<HTMLElement>) => {
    const touch = event.touches[0];
    studentReviewTouchRef.current = { x: touch.clientX, y: touch.clientY };
  };
  const endStudentReviewSwipe = (event: ReactTouchEvent<HTMLElement>) => {
    const start = studentReviewTouchRef.current;
    const touch = event.changedTouches[0];
    studentReviewTouchRef.current = null;
    if (
      !start ||
      courseReviews.length < 2 ||
      Math.abs(touch.clientX - start.x) < 45 ||
      Math.abs(touch.clientX - start.x) < Math.abs(touch.clientY - start.y)
    )
      return;
    setStudentReviewIndex(
      (index) =>
        (index + (touch.clientX < start.x ? 1 : -1) + courseReviews.length) %
        courseReviews.length,
    );
  };
  const [formSent, setFormSent] = useState(false);
  const [phoneFieldKey, setPhoneFieldKey] = useState(0);
  const [activePortfolioIndex, setActivePortfolioIndex] = useState<
    number | null
  >(null);
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
        const marker =
          document.querySelector(".site-header")?.getBoundingClientRect()
            .bottom ?? 82;
        const sections = navigation
          .map(([, id]) => document.getElementById(id))
          .filter(
            (section): section is HTMLElement => section instanceof HTMLElement,
          );
        const current = [...sections]
          .reverse()
          .find(
            (section) => section.getBoundingClientRect().top <= marker + 24,
          );
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
  const showPreviousPortfolioItem = () =>
    setActivePortfolioIndex((index) =>
      index === null
        ? null
        : (index - 1 + portfolioItems.length) % portfolioItems.length,
    );
  const showNextPortfolioItem = () =>
    setActivePortfolioIndex((index) =>
      index === null ? null : (index + 1) % portfolioItems.length,
    );
  const movePortfolio = useCallback(
    (direction: -1 | 1) => {
      const track = portfolioTrackRef.current;
      if (!track) return;
      const cards = Array.from(track.children) as HTMLElement[];
      const viewport = track.parentElement;
      if (!viewport || cards.length === 0) return;
      const gap = parseFloat(getComputedStyle(track).columnGap || "0");
      const visibleCount = Math.max(
        1,
        Math.floor((viewport.clientWidth + gap) / (cards[0].offsetWidth + gap)),
      );
      const maxIndex = Math.min(
        portfolioItems.length,
        Math.max(0, cards.length - visibleCount),
      );
      const nextIndex = Math.max(
        0,
        Math.min(maxIndex, portfolioIndex + direction),
      );
      track.style.transform = `translate3d(-${cards[nextIndex].offsetLeft - cards[0].offsetLeft}px, 0, 0)`;
      setPortfolioMaxIndex(maxIndex);
      setPortfolioVisibleCount(visibleCount);
      setPortfolioIndex(nextIndex);
    },
    [portfolioIndex],
  );

  const handlePortfolioTouchStart = (
    event: ReactTouchEvent<HTMLDivElement>,
  ) => {
    const touch = event.touches[0];
    portfolioTouchRef.current = { x: touch.clientX, y: touch.clientY };
  };
  const handlePortfolioTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    const start = portfolioTouchRef.current;
    const touch = event.changedTouches[0];
    portfolioTouchRef.current = null;
    if (
      !start ||
      Math.abs(touch.clientX - start.x) < 45 ||
      Math.abs(touch.clientX - start.x) < Math.abs(touch.clientY - start.y)
    )
      return;
    movePortfolio(touch.clientX < start.x ? 1 : -1);
    suppressPortfolioClickRef.current = true;
    window.setTimeout(() => {
      suppressPortfolioClickRef.current = false;
    }, 450);
  };
  const handleLightboxTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    const start = portfolioTouchRef.current;
    const touch = event.changedTouches[0];
    portfolioTouchRef.current = null;
    if (
      !start ||
      Math.abs(touch.clientX - start.x) < 45 ||
      Math.abs(touch.clientX - start.x) < Math.abs(touch.clientY - start.y)
    )
      return;
    if (touch.clientX < start.x) showNextPortfolioItem();
    else showPreviousPortfolioItem();
  };
  const handlePortfolioTransitionEnd = (
    event: ReactTransitionEvent<HTMLDivElement>,
  ) => {
    if (
      event.propertyName !== "transform" ||
      portfolioIndex < portfolioItems.length
    )
      return;
    const track = event.currentTarget;
    track.style.transitionDuration = "0s";
    track.style.transform = "translate3d(0, 0, 0)";
    setPortfolioIndex(0);
    requestAnimationFrame(() =>
      track.style.removeProperty("transition-duration"),
    );
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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const revealItems = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!("IntersectionObserver" in window) || revealItems.length === 0) return;

    document.documentElement.classList.add("has-scroll-reveal");
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          currentObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -36px 0px" },
    );

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
      if (event.key === "ArrowLeft")
        setActivePortfolioIndex((index) =>
          index === null
            ? null
            : (index - 1 + portfolioItems.length) % portfolioItems.length,
        );
      if (event.key === "ArrowRight")
        setActivePortfolioIndex((index) =>
          index === null ? null : (index + 1) % portfolioItems.length,
        );
    };
    document.body.classList.add("portfolio-lightbox-open");
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.classList.remove("portfolio-lightbox-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePortfolioIndex]);

  useEffect(() => {
    if (
      activePortfolioIndex !== null ||
      portfolioHovered ||
      portfolioFocused ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const intervalId = window.setInterval(() => {
      if (document.hidden || portfolioIndex >= portfolioItems.length) return;
      movePortfolio(1);
    }, 4200);
    return () => window.clearInterval(intervalId);
  }, [
    activePortfolioIndex,
    movePortfolio,
    portfolioFocused,
    portfolioHovered,
    portfolioIndex,
  ]);

  useEffect(() => {
    const updatePortfolioBounds = () => {
      const track = portfolioTrackRef.current;
      const viewport = track?.parentElement;
      const firstCard = track?.children[0] as HTMLElement | undefined;
      if (!track || !viewport || !firstCard) return;
      const gap = parseFloat(getComputedStyle(track).columnGap || "0");
      const visibleCount = Math.max(
        1,
        Math.floor(
          (viewport.clientWidth + gap) / (firstCard.offsetWidth + gap),
        ),
      );
      setPortfolioMaxIndex(
        Math.min(
          portfolioItems.length,
          Math.max(0, track.children.length - visibleCount),
        ),
      );
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
        <a
          className="brand"
          href="#home"
          aria-label="Daria Savich — на главную"
        >
          <span className="brand-name">Daria Savich</span>
          <span className="brand-caption">Мастер-бровист · Преподаватель</span>
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
            <a
              key={id}
              href={`#${id}`}
              className={activeSection === id ? "is-active" : undefined}
              aria-current={activeSection === id ? "location" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </a>
          ))}
          <div className="mobile-socials">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram aria-hidden="true" />
            </a>
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
            >
              <FaTelegramPlane aria-hidden="true" />
            </a>
          </div>
        </nav>
        <div className="header-socials">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <FaInstagram aria-hidden="true" />
            <span>Instagram</span>
          </a>
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
          >
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
        </div>

        <div className="hero-content">
          <h1 id="hero-title">Обучаю самой прибыльной нише в beauty сфере</h1>
          <p className="hero-promise">Доведу до результата за руку</p>
          <ol className="hero-proof" aria-label="Путь к результату">
            <li>
              <span>Авторский курс</span>
              <FaArrowRight aria-hidden="true" />
              <span>Cильные инструменты в обучении</span>
            </li>
            <li>
              <span>Сильные инструменты в обучении</span>
              <FaArrowRight aria-hidden="true" />
              <span>Твердый эксперт</span>
            </li>
            <li>
              <span>Твердый эксперт</span>
              <FaArrowRight aria-hidden="true" />
              <span>Качественные работы с долгой ноской</span>
            </li>
          </ol>
          <div className="hero-actions">
            <a
              className="button button-burgundy"
              href="#course"
            >
              Выбрать курс <FaArrowRight aria-hidden="true" />
            </a>
            <a
              className="button button-outline"
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Выбрать услугу <FaArrowRight aria-hidden="true" />
            </a>
          </div>
        </div>
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
        </div>
        <div className="about-copy" data-reveal>
          <p className="eyebrow eyebrow-burgundy">
            Обо мне <span />
          </p>
          <h2 id="about-title">
            Привет,
            <br />я Дария Савич
          </h2>
          <p>
            Я действующий мастер-бровист и ламимейкер с опытом более 4 лет,
            преподаватель авторских курсов с продуманными программами и
            официальный амбассадор международного бренда{" "}
            <a
              href="https://bronsunpro.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              BRONSUN
            </a>
            .
          </p>
          <p>
            Я постоянно учусь и слежу за новыми техниками в индустрии и
            способами продвижения. Более 3 000 $ я вложила в профессиональные
            знания — и продолжаю инвестировать в своё развитие, чтобы делиться с
            клиентами и учениками актуальным опытом.
          </p>
          <a className="text-link text-link-burgundy" href="#contacts">
            Познакомиться ближе <FaArrowRight aria-hidden="true" />
          </a>
        </div>
      </section>

      <section
        className="course-catalog"
        id="course"
        aria-labelledby="course-title"
      >
        <div className="course-catalog-heading" data-reveal>
          <p className="eyebrow eyebrow-burgundy">
            Обучение <span aria-hidden="true" />
          </p>
          <h2 id="course-title">
            Знания, которые
            <br />
            меняют уровень
          </h2>
          <p>
            Авторские программы для уверенного старта и профессионального роста
            в brow-индустрии.
          </p>
        </div>
        <div className="course-catalog-grid">
          <article className="course-card course-card-blonde" data-reveal>
            <div className="course-card-image">
              <Image
                src="/images/course-blonde-brow.jpg"
                alt="Светлая бровь и голубой глаз блондинки"
                fill
                unoptimized
                sizes="(max-width: 760px) 100vw, 50vw"
                className="cover-image"
              />
            </div>
            <div className="course-card-content">
              <p className="eyebrow eyebrow-gold">
                Повышение квалификации · Онлайн
              </p>
              <h3>
                Blonde
                <br />
                Formula
              </h3>
              <p className="course-card-subtitle">
                Осветление бровей от А до Я
              </p>
              <p className="course-card-description">
                Техники, химия и системная практика для чистого результата без
                желтизны и ошибок.
              </p>
              <div className="course-card-meta">
                <span>8 видеоуроков</span>
                <span>Доступ навсегда</span>
              </div>
              <div className="course-card-footer">
                <button
                  className="course-card-price course-card-buy"
                  type="button"
                >
                  Забронировать место · 90 BYN / 2490 RUB
                </button>
                <button
                  className="course-card-open"
                  type="button"
                  onClick={() => setActiveCourse("blonde")}
                >
                  О курсе <FaArrowRight aria-hidden="true" />
                </button>
              </div>
            </div>
          </article>
          <article className="course-card course-card-base" data-reveal>
            <div className="course-card-image">
              <Image
                src="/images/portfolio-brows.jpg"
                alt="Профессионально оформленные брови"
                fill
                unoptimized
                sizes="(max-width: 760px) 100vw, 50vw"
                className="cover-image"
              />
            </div>
            <div className="course-card-content">
              <p className="eyebrow eyebrow-gold">Базовый курс · Для старта</p>
              <h3>
                Brow
                <br />
                Stylist
              </h3>
              <p className="course-card-subtitle">
                Самый важный курс в начале карьеры
              </p>
              <p className="course-card-description">
                От уверенной работы с бровями до готового портфолио и понимания,
                как находить клиентов.
              </p>
              <div className="course-card-meta">
                <span>Теория и практика</span>
                <span>Поддержка наставника</span>
              </div>
              <div className="course-card-footer">
                <a
                  className="course-card-price course-card-buy"
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Подобрать тариф
                </a>
                <button
                  className="course-card-open"
                  type="button"
                  onClick={() => setActiveCourse("base")}
                >
                  О курсе <FaArrowRight aria-hidden="true" />
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section
        className="services section-light"
        id="services"
        aria-labelledby="services-title"
      >
        <div className="section-heading" data-reveal>
          <div>
            <p className="eyebrow eyebrow-burgundy">
              Услуги <span />
            </p>
            <h2 id="services-title">
              Качественные работы с долгой ноской в авторских и актуальных
              техниках
            </h2>
          </div>
        </div>
        <div className="service-group" data-reveal>
          <div className="service-group-heading">
            <h3>Отдельные услуги</h3>
          </div>
          <div className="service-list">
            {services.map((service) => (
              <a
                className="service-row service-row-link"
                key={service.number}
                href={"bookingUrl" in service ? service.bookingUrl : bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Записаться: ${service.name}`}
              >
                <span className="service-number">{service.number}</span>
                <div className="service-main">
                  <h4>{service.name}</h4>
                  <p>{service.detail}</p>
                </div>
                <div className="service-price">
                  <span>{service.price}</span>
                </div>
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
              <a
                href={complex.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`complex-card${"featured" in complex ? " complex-card-featured" : ""}`}
                key={complex.number}
                aria-label={`Записаться: ${complex.name}`}
              >
                <div className="complex-card-top">
                  <span>
                    {"featured" in complex
                      ? "Премиальный комплекс"
                      : "Готовый комплекс"}
                  </span>
                  <span>{complex.price}</span>
                </div>
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

      <section
        className="portfolio section-light"
        id="portfolio"
        aria-labelledby="portfolio-title"
      >
        <div className="section-heading portfolio-heading">
          <div>
            <p className="eyebrow eyebrow-burgundy">
              Портфолио <span />
            </p>
            <h2 id="portfolio-title">
              Результат, который
              <br className="mobile-break" /> видно
            </h2>
          </div>
        </div>
        <div
          className="portfolio-slider"
          onMouseEnter={() => setPortfolioHovered(true)}
          onMouseLeave={() => setPortfolioHovered(false)}
          onFocusCapture={() => setPortfolioFocused(true)}
          onBlurCapture={(event) => {
            if (
              !event.currentTarget.contains(event.relatedTarget as Node | null)
            )
              setPortfolioFocused(false);
          }}
          onTouchStart={handlePortfolioTouchStart}
          onTouchEnd={handlePortfolioTouchEnd}
        >
          <div
            className="portfolio-grid"
            ref={portfolioTrackRef}
            onTransitionEnd={handlePortfolioTransitionEnd}
          >
            {portfolioSlides.map((item, index) => (
              <button
                className="portfolio-item"
                type="button"
                onClick={() => {
                  if (suppressPortfolioClickRef.current) {
                    suppressPortfolioClickRef.current = false;
                    return;
                  }
                  setActivePortfolioIndex(index % portfolioItems.length);
                }}
                key={`${item.image}-${index}`}
                aria-label={`Открыть фото ${(index % portfolioItems.length) + 1}`}
              >
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
          <div
            className="portfolio-slider-controls"
            aria-label="Управление слайдером"
          >
            <button
              type="button"
              onClick={() => movePortfolio(-1)}
              disabled={portfolioIndex === 0}
              aria-label="Предыдущие работы"
            >
              <FaChevronLeft aria-hidden="true" />
            </button>
            <span className="portfolio-slider-progress" aria-hidden="true">
              <span
                style={{
                  transform: `scaleX(${Math.min(1, (portfolioIndex + portfolioVisibleCount) / portfolioItems.length)})`,
                }}
              />
            </span>
            <button
              type="button"
              onClick={() => movePortfolio(1)}
              disabled={portfolioIndex >= portfolioMaxIndex}
              aria-label="Следующие работы"
            >
              <FaChevronRight aria-hidden="true" />
            </button>
          </div>
        </div>
        {activePortfolioIndex !== null && (
          <div
            className="portfolio-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Просмотр фотографий портфолио"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closePortfolio();
            }}
            onTouchStart={handlePortfolioTouchStart}
            onTouchEnd={handleLightboxTouchEnd}
          >
            <button
              className="portfolio-lightbox-close"
              type="button"
              onClick={closePortfolio}
              aria-label="Закрыть просмотр"
            >
              <FaTimes aria-hidden="true" />
            </button>
            <button
              className="portfolio-lightbox-arrow portfolio-lightbox-previous"
              type="button"
              onClick={showPreviousPortfolioItem}
              aria-label="Предыдущее фото"
            >
              <FaChevronLeft aria-hidden="true" />
            </button>
            <figure className="portfolio-lightbox-content">
              <div className="portfolio-lightbox-image-wrap">
                <Image
                  key={activePortfolioIndex}
                  src={portfolioItems[activePortfolioIndex].image}
                  alt={portfolioItems[activePortfolioIndex].alt}
                  fill
                  unoptimized
                  sizes="100vw"
                  className="portfolio-lightbox-image"
                />
              </div>
            </figure>
            <button
              className="portfolio-lightbox-arrow portfolio-lightbox-next"
              type="button"
              onClick={showNextPortfolioItem}
              aria-label="Следующее фото"
            >
              <FaChevronRight aria-hidden="true" />
            </button>
          </div>
        )}
      </section>

      <section
        className="reviews section-light"
        id="reviews"
        aria-labelledby="reviews-title"
      >
        <div className="section-heading" data-reveal>
          <div>
            <p className="eyebrow eyebrow-burgundy">
              Отзывы <span />
            </p>
            <h2 id="reviews-title">Тёплые слова</h2>
          </div>
        </div>
        <div className="review-grid">
          {reviews.map((review) => (
            <figure className="review" data-reveal key={review.author}>
              <div className="review-stars" aria-label="5 из 5">
                {[0, 1, 2, 3, 4].map((star) => (
                  <FaStar key={star} aria-hidden="true" />
                ))}
              </div>
              <blockquote>{review.text}</blockquote>
              <figcaption>{review.author}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section
        className="contact section-dark"
        id="contacts"
        aria-labelledby="contact-title"
      >
        <div className="contact-intro" data-reveal>
          <p className="eyebrow eyebrow-gold">Будем на связи</p>
          <h2 id="contact-title">Нужна помощь?</h2>
          <p className="contact-description">
            Задайте свой вопрос, с радостью отвечу и проконсультирую в удобном для Вас формате
          </p>
          <div className="contact-methods">
            <a className="contact-method" href="tel:+375297887992">
              <span className="contact-method-icon">
                <FaPhone aria-hidden="true" />
              </span>
              <span>
                <small>Позвонить</small>
                <strong>+375 (29) 788 79 92</strong>
              </span>
              <FaArrowRight
                className="contact-method-arrow"
                aria-hidden="true"
              />
            </a>
            <a
              className="contact-method"
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="contact-method-icon">
                <FaTelegramPlane aria-hidden="true" />
              </span>
              <span>
                <small>Написать в Telegram</small>
                <strong>@dariiisav</strong>
              </span>
              <FaArrowRight
                className="contact-method-arrow"
                aria-hidden="true"
              />
            </a>
            <a
              className="contact-method"
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="contact-method-icon">
                <FaInstagram aria-hidden="true" />
              </span>
              <span>
                <small>Следить за работами</small>
                <strong>Instagram</strong>
              </span>
              <FaArrowRight
                className="contact-method-arrow"
                aria-hidden="true"
              />
            </a>
          </div>
          <p className="contact-hours">
            <span /> Режим работы · 10:00–19:30
          </p>
        </div>
        <form className="contact-form" data-reveal onSubmit={submitDemoForm}>
          <h3 className="contact-form-intro">Заказать консультацию</h3>
          <label>
            Имя
            <input
              name="name"
              type="text"
              placeholder="Как к вам обращаться"
              autoComplete="name"
              required
            />
          </label>
          <label>
            Номер телефона
            <PhoneField key={phoneFieldKey} />
          </label>
          <label>
            Ник в Telegram
            <input
              name="telegram"
              type="text"
              placeholder="@username"
              autoComplete="off"
            />
          </label>
          <div className="contact-consent">
            <input
              id="personal-data-consent"
              name="consent"
              type="checkbox"
              value="accepted"
              required
            />
            <div>
              <label htmlFor="personal-data-consent">
                Согласен с условиями обработки персональных данных
              </label>
              <button type="button" onClick={() => setActiveLegal("privacy")}>
                Политика конфиденциальности
              </button>
            </div>
          </div>
          <button className="button button-gold" type="submit">
            Отправить <FaArrowRight aria-hidden="true" />
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
              <span className="brand-caption">
                Мастер-бровист · Преподаватель
              </span>
            </a>
            <p>Свяжитесь со мной, чтобы обсудить процедуру или обучение.</p>
          </div>
          <div className="company-details">
            <h2>Контакты</h2>
            <div className="footer-contact-links">
              <a href="tel:+375297887992">
                <FaPhone aria-hidden="true" /> +375 (29) 788 79 92
              </a>
              <a href="mailto:daruwell2007@gmail.com">
                <FaEnvelope aria-hidden="true" /> daruwell2007@gmail.com
              </a>
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
              >
                <FaTelegramPlane aria-hidden="true" /> Telegram
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <FaInstagram aria-hidden="true" /> Instagram
              </a>
            </div>
            <p>Режим работы: 10:00–19:30</p>
          </div>
          <div className="company-details company-legal-details">
            <h2>Юридические данные</h2>
            <p>ИП Савич Дария Викторовна</p>
            <p>
              Юридический адрес: Беларусь, Брестская область, г. Барановичи, ул.
              Домейко, дом 6, кв. 17
            </p>
            <p>
              Свидетельство о государственной регистрации ИП: № 291937817 от
              09.09.2026
            </p>
            <p>Орган, выдавший свидетельство: Барановичский горисполком</p>
            <p>УНП: 291937817</p>
            <p>Расчетный счет: BY28POIS30130188864001933001</p>
            <p>ОАО «Паритетбанк» · БИК: POISBY2X</p>
          </div>
          <nav className="footer-legal" aria-label="Правовая информация">
            <button type="button" onClick={() => setActiveLegal("delivery")}>
              Порядок оказания услуг
            </button>
            <button type="button" onClick={() => setActiveLegal("returns")}>
              Возврат и отмена
            </button>
            <button type="button" onClick={() => setActiveLegal("payment")}>
              Оплата и безопасность
            </button>
            <button type="button" onClick={() => setActiveLegal("privacy")}>
              Конфиденциальность
            </button>
          </nav>
        </div>
        <div className="payment-strip">
          <div className="payment-copy">
            <span>Способы оплаты</span>
          </div>
          <div
            className="payment-logos"
            role="group"
            aria-label="Доступные способы оплаты"
          >
            {[
              { src: "/images/payment/visa.png", alt: "Visa", width: 240 },
              {
                src: "/images/payment/visa-secure.png",
                alt: "Visa Secure",
                width: 180,
              },
              {
                src: "/images/payment/mastercard-id-check.png",
                alt: "Mastercard ID Check",
                width: 335,
              },
              {
                src: "/images/payment/mastercard.png",
                alt: "Mastercard",
                width: 160,
              },
              {
                src: "/images/payment/belkart-internet.png",
                alt: "Белкарт ИнтернетПароль",
                width: 370,
              },
              {
                src: "/images/payment/belkart.png",
                alt: "Белкарт",
                width: 185,
              },
              {
                src: "/images/payment/apple-pay.png",
                alt: "Apple Pay",
                width: 200,
              },
              {
                src: "/images/payment/samsung-pay.png",
                alt: "Samsung Pay",
                width: 400,
              },
            ].map((logo) => (
              <Image
                key={logo.src}
                src={logo.src}
                alt={logo.alt}
                width={logo.width}
                height={200}
                className="payment-logo"
              />
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Daria Savich. Все права защищены.</span>
          <a href="#home">
            Наверх <FaArrowRight aria-hidden="true" />
          </a>
        </div>
      </footer>

      {activeLegal && (
        <div
          className="dialog-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveLegal(null);
          }}
        >
          <section
            className="legal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-title"
          >
            <button
              className="dialog-close"
              type="button"
              onClick={() => setActiveLegal(null)}
              aria-label="Закрыть"
            >
              <FaTimes aria-hidden="true" />
            </button>
            <p className="eyebrow eyebrow-burgundy">Демо-информация</p>
            <h2 id="legal-title">{legalContent[activeLegal].title}</h2>
            {legalContent[activeLegal].paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <button
              className="button button-burgundy"
              type="button"
              onClick={() => setActiveLegal(null)}
            >
              Понятно
            </button>
          </section>
        </div>
      )}

      {activeCourse && (
        <div className="course-fullscreen">
          <section
            className="course-fullscreen-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="course-dialog-title"
          >
            <button
              className="course-fullscreen-close"
              type="button"
              onClick={() => {
                setActiveCourse(null);
                setStudentGalleryOpen(false);
              }}
              aria-label="Закрыть подробности курса"
            >
              <FaTimes aria-hidden="true" />
            </button>
            <header
              className={`course-detail-hero ${activeCourse === "blonde" ? "detail-blonde" : "detail-base"}`}
            >
              <p className="eyebrow eyebrow-gold">
                {activeCourse === "blonde"
                  ? "Повышение квалификации · Онлайн"
                  : "Базовый курс · Для старта"}
              </p>
              <h2 id="course-dialog-title">
                {activeCourse === "blonde" ? "Blonde Formula" : "Brow Stylist"}
              </h2>
              <p>
                {activeCourse === "blonde"
                  ? "Осветление бровей от А до Я"
                  : "Самый важный курс на старте карьеры"}
              </p>
            </header>
            <div className="course-detail-body">
              {activeCourse === "blonde" ? (
                <>
                  <p className="course-detail-intro">
                    Внедрите в свою работу мои техники и советы — и смотрите,
                    как растут ваша экспертность и клиентская база. Внутри
                    видеоуроки с теорией и практикой, а также файлы с
                    конспектами.
                  </p>
                  <section className="course-detail-section">
                    <p className="eyebrow eyebrow-burgundy">
                      Программа · 8 уроков
                    </p>
                    <ol className="course-dialog-lessons">
                      {courseTopics.map((lesson, index) => (
                        <li key={lesson.title}>
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          <div>
                            <h3>{lesson.title}</h3>
                            <p className="course-dialog-topics">
                              {lesson.topics}
                            </p>
                            <p>{lesson.result}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </section>
                  <section className="course-detail-section">
                    <h3>Кому подойдёт</h3>
                    <ul>
                      <li>
                        Начинающим мастерам, которые ещё не знакомы с
                        осветлением бровей
                      </li>
                      <li>
                        Практикующим мастерам, которым нужны новые актуальные
                        техники
                      </li>
                      <li>Креативным мастерам</li>
                    </ul>
                  </section>
                  <section className="course-detail-section course-dialog-faq">
                    <h3>Частые вопросы</h3>
                    {courseFaq.map((item, index) => (
                      <div
                        className="course-modal-faq-item"
                        key={item.question}
                      >
                        <button
                          type="button"
                          aria-expanded={openCourseFaq === index}
                          onClick={() =>
                            setOpenCourseFaq((current) =>
                              current === index ? null : index,
                            )
                          }
                        >
                          {item.question}
                          <span aria-hidden="true">+</span>
                        </button>
                        <div
                          className={`course-modal-faq-answer${openCourseFaq === index ? " is-open" : ""}`}
                          style={{
                            maxHeight:
                              openCourseFaq === index
                                ? "var(--faq-answer-height)"
                                : "0px",
                          }}
                          ref={(element) => {
                            if (element)
                              element.style.setProperty(
                                "--faq-answer-height",
                                `${element.scrollHeight}px`,
                              );
                          }}
                        >
                          <p>{item.answer}</p>
                        </div>
                      </div>
                    ))}
                  </section>
                  <p className="course-dialog-access">
                    Доступ к урокам навсегда. Информация обновляется: платите
                    один раз и оставайтесь в курсе актуальных техник.
                  </p>
                </>
              ) : (
                <>
                  <p className="course-detail-intro">
                    Курс для тех, кто хочет попробовать себя в новой сфере,
                    начать своё дело в beauty, любит саморазвитие или хочет
                    уверенно вернуться к профессии после неудачного обучения.
                  </p>
                  <section className="course-detail-section base-course-benefits-section">
                    <p className="eyebrow eyebrow-burgundy">
                      Результат обучения
                    </p>
                    <h3>Что вы получите</h3>
                    <ul className="base-course-benefits">
                      {baseCourseBenefits.map((item, index) => (
                        <li key={item}>
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          <p>{item}</p>
                        </li>
                      ))}
                    </ul>
                    <p className="base-course-benefits-note">
                      Имея у себя все эти знания и информацию вы легко сможете
                      продвигаться, набирать клиентскую базу, растить из себя
                      эксперта и конечно приумножать свой доход всё больше и
                      больше
                    </p>
                  </section>
                  <section className="course-detail-section base-course-program">
                    <p className="eyebrow eyebrow-burgundy">
                      Программа обучения
                    </p>
                    <h3>5 модулей от основ до продвижения</h3>
                    {baseCourseModules.map((module, index) => (
                      <div className="base-course-module" key={module.title}>
                        <button
                          type="button"
                          aria-expanded={openBaseModule === index}
                          onClick={() =>
                            setOpenBaseModule((current) =>
                              current === index ? null : index,
                            )
                          }
                        >
                          <span>
                            Модуль {String(index + 1).padStart(2, "0")}
                          </span>
                          <strong>{module.title}</strong>
                          <i aria-hidden="true">+</i>
                        </button>
                        <div
                          className={`base-course-module-content${openBaseModule === index ? " is-open" : ""}`}
                          style={{
                            maxHeight:
                              openBaseModule === index
                                ? "var(--faq-answer-height)"
                                : "0px",
                          }}
                          ref={(element) => {
                            if (element)
                              element.style.setProperty(
                                "--faq-answer-height",
                                `${element.scrollHeight}px`,
                              );
                          }}
                        >
                          <ul>
                            {module.items.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </section>
                  <section className="course-detail-section base-course-tariffs">
                    <p className="eyebrow eyebrow-burgundy">Выберите формат</p>
                    <h3>Тарифы</h3>
                    <div className="base-course-tariff-grid">
                      {baseCourseTariffs.map((tariff) => (
                        <article
                          className="base-course-tariff"
                          key={tariff.name}
                        >
                          <p className="eyebrow eyebrow-burgundy">
                            {tariff.name}
                          </p>
                          <h4>{tariff.price}</h4>
                          <p className="base-course-tariff-schedule">
                            1 день теории · 2 дня практики
                          </p>
                          <ul>
                            <li>{tariff.demoModels}</li>
                            <li>{tariff.practice}</li>
                            {tariff.extras.slice(1).map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                          <a
                            className="button button-burgundy"
                            href={courseBookingTelegramUrl(tariff.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Забронировать {tariff.name}{" "}
                            <FaArrowRight aria-hidden="true" />
                          </a>
                        </article>
                      ))}
                    </div>
                  </section>
                  <section className="course-detail-section course-dialog-faq">
                    <h3>Частые вопросы</h3>
                    {baseCourseFaq.map((item, index) => (
                      <div
                        className="course-modal-faq-item"
                        key={item.question}
                      >
                        <button
                          type="button"
                          aria-expanded={openCourseFaq === index}
                          onClick={() =>
                            setOpenCourseFaq((current) =>
                              current === index ? null : index,
                            )
                          }
                        >
                          {item.question}
                          <span aria-hidden="true">+</span>
                        </button>
                        <div
                          className={`course-modal-faq-answer${openCourseFaq === index ? " is-open" : ""}`}
                          style={{
                            maxHeight:
                              openCourseFaq === index
                                ? "var(--faq-answer-height)"
                                : "0px",
                          }}
                          ref={(element) => {
                            if (element)
                              element.style.setProperty(
                                "--faq-answer-height",
                                `${element.scrollHeight}px`,
                              );
                          }}
                        >
                          <p>{item.answer}</p>
                        </div>
                      </div>
                    ))}
                  </section>
                </>
              )}
              <section className="course-detail-section course-student-gallery">
                <p className="eyebrow eyebrow-burgundy">Результаты обучения</p>
                <div className="student-proof-grid">
                  {activeCourse === "base" && studentWorkImages.length > 0 && (
                    <div className="student-proof-block">
                      <h3>Работы учениц</h3>
                      <p>Галерея работ</p>
                      <button
                        className="student-photo-slide"
                        type="button"
                        onClick={() => {
                          if (suppressStudentWorkClickRef.current) {
                            suppressStudentWorkClickRef.current = false;
                            return;
                          }
                          setStudentGalleryOpen(true);
                        }}
                        onTouchStart={startStudentWorkSwipe}
                        onTouchEnd={endStudentWorkSwipe}
                        aria-label="Открыть галерею работ учениц"
                      >
                        <Image
                          key={studentPhotoIndex}
                          src={
                            studentWorkImages[
                              studentPhotoIndex % studentWorkImages.length
                            ].src
                          }
                          alt={
                            studentWorkImages[
                              studentPhotoIndex % studentWorkImages.length
                            ].alt
                          }
                          fill
                          unoptimized
                          sizes="(max-width: 768px) 100vw, 42vw"
                        />
                      </button>
                      <div className="student-carousel-controls">
                        <button
                          type="button"
                          aria-label="Предыдущая работа"
                          onClick={() =>
                            setStudentPhotoIndex(
                              (index) =>
                                (index - 1 + studentWorkImages.length) %
                                studentWorkImages.length,
                            )
                          }
                          disabled={studentWorkImages.length < 2}
                        >
                          <FaChevronLeft />
                        </button>
                        <span>
                          {(studentPhotoIndex % studentWorkImages.length) + 1} /{" "}
                          {studentWorkImages.length}
                        </span>
                        <button
                          type="button"
                          aria-label="Следующая работа"
                          onClick={() =>
                            setStudentPhotoIndex(
                              (index) => (index + 1) % studentWorkImages.length,
                            )
                          }
                          disabled={studentWorkImages.length < 2}
                        >
                          <FaChevronRight />
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="student-proof-block">
                    <h3>Отзывы учениц</h3>
                    <p>
                      {activeCourse === "blonde"
                        ? "BLONDE FORMULA"
                        : "BROW STYLIST"}
                    </p>
                    <article
                      className="student-review-slide"
                      key={`${activeCourse}-${studentReviewIndex}`}
                      onTouchStart={startStudentReviewSwipe}
                      onTouchEnd={endStudentReviewSwipe}
                      aria-live="polite"
                    >
                      <span className="student-review-mark" aria-hidden="true">
                        “
                      </span>
                      <blockquote>
                        {
                          courseReviews[
                            studentReviewIndex % courseReviews.length
                          ]
                        }
                      </blockquote>
                      <small>
                        Отзыв {(studentReviewIndex % courseReviews.length) + 1}{" "}
                        из {courseReviews.length}
                      </small>
                    </article>
                    <div className="student-carousel-controls">
                      <button
                        type="button"
                        aria-label="Предыдущий отзыв"
                        disabled={courseReviews.length < 2}
                        onClick={() =>
                          setStudentReviewIndex(
                            (index) =>
                              (index - 1 + courseReviews.length) %
                              courseReviews.length,
                          )
                        }
                      >
                        <FaChevronLeft />
                      </button>
                      <span>
                        {(studentReviewIndex % courseReviews.length) + 1} /{" "}
                        {courseReviews.length}
                      </span>
                      <button
                        type="button"
                        aria-label="Следующий отзыв"
                        disabled={courseReviews.length < 2}
                        onClick={() =>
                          setStudentReviewIndex(
                            (index) => (index + 1) % courseReviews.length,
                          )
                        }
                      >
                        <FaChevronRight />
                      </button>
                    </div>
                  </div>
                </div>
              </section>
              <section className="course-detail-cta">
                <div>
                  <p className="eyebrow eyebrow-gold">Остались вопросы?</p>
                  <h3>Подберу курс и формат для вас</h3>
                  <p>
                    Напишите мне — обсудим обучение и отвечу на ваши вопросы.
                  </p>
                </div>
                <a
                  className="button button-gold"
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Получить консультацию <FaTelegramPlane aria-hidden="true" />
                </a>
              </section>
              {activeCourse === "blonde" && (
                <a
                  className="button button-burgundy course-detail-book"
                  href="#contacts"
                  onClick={() => {
                    setActiveCourse(null);
                  }}
                >
                  Забронировать место · 90 BYN / 2490 RUB{" "}
                  <FaArrowRight aria-hidden="true" />
                </a>
              )}
            </div>
          </section>
          {studentGalleryOpen &&
            activeCourse === "base" &&
            studentWorkImages.length > 0 && (
              <div
                className="student-gallery-lightbox"
                role="dialog"
                aria-modal="true"
                aria-label="Галерея работ учениц"
                onTouchStart={startStudentWorkSwipe}
                onTouchEnd={endStudentWorkSwipe}
              >
                <button
                  className="student-gallery-close"
                  type="button"
                  aria-label="Закрыть галерею"
                  onClick={() => setStudentGalleryOpen(false)}
                >
                  <FaTimes />
                </button>
                <button
                  className="portfolio-lightbox-arrow portfolio-lightbox-previous"
                  type="button"
                  aria-label="Предыдущая работа"
                  onClick={() =>
                    setStudentPhotoIndex(
                      (index) =>
                        (index - 1 + studentWorkImages.length) %
                        studentWorkImages.length,
                    )
                  }
                  disabled={studentWorkImages.length < 2}
                >
                  <FaChevronLeft />
                </button>
                <div className="student-gallery-empty">
                  <Image
                    key={studentPhotoIndex}
                    src={
                      studentWorkImages[
                        studentPhotoIndex % studentWorkImages.length
                      ].src
                    }
                    alt={
                      studentWorkImages[
                        studentPhotoIndex % studentWorkImages.length
                      ].alt
                    }
                    fill
                    unoptimized
                    sizes="90vw"
                  />
                </div>
                <button
                  className="portfolio-lightbox-arrow portfolio-lightbox-next"
                  type="button"
                  aria-label="Следующая работа"
                  onClick={() =>
                    setStudentPhotoIndex(
                      (index) => (index + 1) % studentWorkImages.length,
                    )
                  }
                  disabled={studentWorkImages.length < 2}
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
        </div>
      )}
    </main>
  );
}
