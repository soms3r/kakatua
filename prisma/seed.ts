// Kakatua Database Seed Script (prisma/seed.ts)
// Populates system bots + 11 country ambassador Culture Cards with detailed content.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── System Bot Emails (immutable) ────────────────────────────────────────────
const SYSTEM_EMAILS = [
  'guide@kakatua.app',
  'buddy@kakatua.app',
  'dhaka@kakatua.app',
];

// ─── Country Ambassador Data ──────────────────────────────────────────────────

interface CountrySeed {
  email: string;
  name: string;
  countrySlug: string;
  nativeLanguages: string[];
  learningLanguages: string[];
  interests: string[];
  timezoneOffset: number;
  card: {
    traditions: string;
    food: string;
    history: string;
    funFact: string;
  };
  detailed: {
    languageInfo: { primaryLanguage: string; majorDialects: string[]; keyPhrases: string[] };
    culturalRituals: { festivalName: string; description: string }[];
    culinaryNarrative: { dishName: string; historicalOrigin: string; culturalSignificance: string }[];
    historicalContext: string;
    socialEtiquette: string[];
  };
}

const COUNTRIES: CountrySeed[] = [
  // ── 1. Bangladesh ────────────────────────────────────────────────────────
  {
    email: 'bangladesh@kakatua.app',
    name: 'Bangladesh',
    countrySlug: 'bangladesh',
    nativeLanguages: ['Bengali'],
    learningLanguages: ['English'],
    interests: ['Language Movement', 'River Culture', 'Textiles'],
    timezoneOffset: 6,
    card: {
      traditions: "Pohela Boishakh, the Bengali New Year, transforms streets into rivers of colour — Mangal Shobhajatra processions carry papier-mâché masks of tigers and boats, celebrating the triumph of hope over darkness.",
      food: "Hilsa fish curry is not merely a dish — it is an emotion. Slow-simmered with mustard oil and turmeric, each flake carries the memory of monsoon rivers and family gatherings.",
      history: "Born from the Language Movement of 1952, Bangladesh is a nation that fought for the right to speak its mother tongue — a sacrifice now commemorated globally as International Mother Language Day.",
      funFact: "The Sundarbans, shared with India, is the world's largest mangrove forest and home to the Royal Bengal Tiger.",
    },
    detailed: {
      languageInfo: {
        primaryLanguage: "Bengali (Bangla)",
        majorDialects: ["Chittagonian", "Sylheti", "Rohingya", "Rangpuri", "Noakhailla"],
        keyPhrases: ["Aadab (Hello)", "Dhonnobad (Thank you)", "Ami bhalo achi (I am well)", "Apnake bhalobashi (I love you)", "Ki khobor? (How are you?)"],
      },
      culturalRituals: [
        { festivalName: "Pohela Boishakh", description: "The Bengali New Year on 14th April is a jubilant explosion of art, music, and food. The Mangal Shobhajatra procession in Dhaka features giant papier-mâché masks, drum circles, and dancers — a UNESCO-recognised Intangible Cultural Heritage." },
        { festivalName: "Ekushey February", description: "On 21st February, Bangladesh remembers the Language Movement martyrs who gave their lives in 1952 for the right to speak Bangla. The Shaheed Minar monument stands draped in flowers — a solemn reminder that language is identity." },
        { festivalName: "Bishwa Ijtema", description: "The second-largest Islamic congregation in the world, held on the banks of the Turag River in Tongra. Millions gather for prayers, sermons, and communal meals — a gathering of quiet devotion." },
      ],
      culinaryNarrative: [
        { dishName: "Hilsa (Ilish) Bhapa", historicalOrigin: "Steamed Hilsa in mustard paste has been a Bengali delicacy for centuries, mentioned in medieval texts as a dish of the river-delta aristocracy.", culturalSignificance: "Hilsa is so beloved it transcends politics — when Bangladesh and India negotiate, Hilsa exports are always on the table. It is the fish of monsoons, of homecoming, of mothers who know exactly how you like it." },
        { dishName: "Pitha", historicalOrigin: "Rice cakes filled with jaggery and coconut trace their roots to the harvest celebrations of rural Bengal, where winter brought families together around clay stoves.", culturalSignificance: "Pitha-making is a ritual of togetherness. Grandmothers teach granddaughters the precise wrist-flick that creates the perfect Patishapta — each fold a quiet inheritance." },
        { dishName: "Biryani (Kacchi)", historicalOrigin: "Dhaka's Kacchi Biryani, with its layers of marinated mutton and saffron rice, arrived with Mughal nobility and evolved in the kitchens of Old Dhaka's Wari district.", culturalSignificance: "No wedding in Bangladesh is complete without Kacchi Biryani. It is celebration made edible — each grain of rice a golden testament to generosity." },
      ],
      historicalContext: "Bangladesh's story is one of resilience etched in river silt. From the ancient Pundra and Vanga kingdoms to the Bengal Sultanate, from British colonial rule to the trauma of the 1971 Liberation War — every chapter is written in blood and poetry. The Language Movement of 1952, when students gave their lives for the right to speak Bangla, planted the seed of a nation. Today, Dhaka pulses with the energy of 22 million souls, where rickshaw art adorns every corner and the Padma Bridge stands as a monument to self-reliance.",
      socialEtiquette: [
        "Always remove your shoes before entering someone's home — it is a sign of respect and cleanliness.",
        "Accepting food or tea when offered is important; declining may be seen as impolite.",
        "Use your right hand for eating and passing objects — the left hand is considered unclean.",
        "Elders are addressed with 'Apni' (formal you) — using the informal 'tumi' with elders is disrespectful.",
        "When visiting a mosque, dress modestly and remove footwear at the entrance.",
        "Bengalis value hospitality immensely — expect to be fed more than you can eat.",
      ],
    },
  },

  // ── 2. Japan ─────────────────────────────────────────────────────────────
  {
    email: 'japan@kakatua.app',
    name: 'Japan',
    countrySlug: 'japan',
    nativeLanguages: ['Japanese'],
    learningLanguages: ['English'],
    interests: ['Tea Ceremony', 'Calligraphy', 'Technology'],
    timezoneOffset: 9,
    card: {
      traditions: "The tea ceremony (Chanoyu) is a meditation in motion — every gesture, from the folding of the silk cloth to the whisking of matcha, is a choreography of mindfulness passed through 500 years of practice.",
      food: "Sushi began as street food in Edo-period Tokyo — hand-pressed rice topped with fresh fish from the Sumida River. Today it is an art form where a master's knife tells stories older than memory.",
      history: "From the Jomon period's cord-marked pottery to the samurai code of Bushido, Japan has woven innovation and tradition into a single, unbroken thread spanning millennia.",
      funFact: "There are more vending machines in Japan than people in New Zealand — over 5 million dispensing everything from hot corn soup to fresh flowers.",
    },
    detailed: {
      languageInfo: {
        primaryLanguage: "Japanese",
        majorDialects: ["Kansai-ben (Osaka)", "Tohoku-ben", "Hakata-ben (Fukuoka)", "Okinawan", "Kagoshima-ben"],
        keyPhrases: ["Konnichiwa (Hello)", "Arigatou gozaimasu (Thank you very much)", "Sumimasen (Excuse me)", "Oishii (Delicious)", "Itadakimasu (I humbly receive — said before eating)"],
      },
      culturalRituals: [
        { festivalName: "Hanami (Cherry Blossom Viewing)", description: "Every spring, Japan pauses beneath clouds of pink blossoms. Families spread blue tarps under sakura trees, sharing bento boxes and sake as petals drift like snow — a beautiful reminder of mono no aware, the bittersweet awareness of impermanence." },
        { festivalName: "Obon", description: "In August, lanterns guide ancestral spirits home. Families clean graves, perform Bon Odori dances, and float paper lanterns on rivers — a three-day reunion between the living and the departed." },
        { festivalName: "Shogatsu (New Year)", description: "Japan's most important holiday. Temples ring their bells 108 times to banish worldly desires, families eat ozoni soup and mochi, and children receive otoshidama — small envelopes of money as blessings." },
      ],
      culinaryNarrative: [
        { dishName: "Sushi (Edomae-zushi)", historicalOrigin: "Originating in 1820s Tokyo, Hanaya Yohei created nigiri-zushi as a fast food for busy labourers — vinegar rice topped with fresh fish from Tokyo Bay.", culturalSignificance: "Sushi embodies the Japanese principle of 'less is more.' A master sushi chef trains for decades to achieve the perfect balance of rice, fish, and wasabi — each piece a meditation on simplicity." },
        { dishName: "Ramen", historicalOrigin: "Chinese immigrants brought wheat noodles to Yokohama's Chinatown in the late 19th century. Japanese cooks transformed them into countless regional styles.", culturalSignificance: "Ramen shops are temples of personal expression. Each chef guards their broth recipe like a family secret — the tonkotsu of Kyushu, the miso of Sapporo, the shoyu of Tokyo." },
        { dishName: "Kaiseki", historicalOrigin: "Born from the simple meals served before tea ceremonies in 16th-century Kyoto, kaiseki evolved into Japan's haute cuisine — a multi-course symphony of seasonal ingredients.", culturalSignificance: "Kaiseki is edible poetry. Each dish reflects the season: spring brings bamboo shoots, summer offers ayu fish, autumn presents persimmons, winter warms with hot pot." },
      ],
      historicalContext: "Japan's history is a dialogue between isolation and reinvention. From the Jomon people's ancient pottery (among the world's oldest) to the refined court culture of the Heian period, from the samurai's feudal codes to the explosive modernization of the Meiji Restoration — Japan has repeatedly reinvented itself while preserving its soul. The devastation of World War II gave way to an economic miracle that made Japanese innovation synonymous with excellence. Today, ancient temples stand beside bullet train stations, and robot butlers serve tea in the same gesture perfected by grandmothers.",
      socialEtiquette: [
        "Bow when greeting — the deeper the bow, the greater the respect. A 15-degree nod suffices for casual meetings; 30 degrees for formal occasions.",
        "Never tip at restaurants — it can be considered insulting, as excellent service is a point of professional pride.",
        "Remove shoes when entering homes, temples, and some restaurants. Slippers are usually provided.",
        "Do not blow your nose in public — step away or use the restroom. Sneezing quietly is preferred.",
        "Pour drinks for others before yourself — it is a gesture of care and community.",
        "Speak softly on trains and buses — phone calls on public transport are considered rude.",
      ],
    },
  },

  // ── 3. India ─────────────────────────────────────────────────────────────
  {
    email: 'india@kakatua.app',
    name: 'India',
    countrySlug: 'india',
    nativeLanguages: ['Hindi', 'Bengali', 'Tamil', 'Telugu', 'Marathi'],
    learningLanguages: ['English'],
    interests: ['Classical Dance', 'Spice Routes', 'Bollywood'],
    timezoneOffset: 5.5,
    card: {
      traditions: "Diwali transforms the subcontinent into a galaxy of oil lamps — every doorway a constellation, every family prayer a thread in the ancient tapestry of light conquering darkness.",
      food: "Each region of India is a universe of flavour. The slow-cooked biryani of Hyderabad, the dosa crispness of Tamil Nadu, the butter chicken of Punjab — a continent of cuisine compressed into one nation.",
      history: "From the Indus Valley's urban planning to the Mughal Empire's architectural poetry, from Gandhi's salt march to the IT revolution — India's story spans 5,000 unbroken years of civilisation.",
      funFact: "India has 22 official languages and over 19,500 mother tongues — making it the most linguistically diverse nation on Earth.",
    },
    detailed: {
      languageInfo: {
        primaryLanguage: "Hindi (official), with 21 other scheduled languages",
        majorDialects: ["Bhojpuri", "Rajasthani", "Awadhi", "Haryanvi", "Chhattisgarhi", "Bengali", "Tamil", "Telugu", "Kannada", "Malayalam"],
        keyPhrases: ["Namaste (Hello)", "Dhanyavaad (Thank you)", "Aap kaise hain? (How are you?),", "Mujhe samajh nahi aaya (I don't understand)", "Chai pi lo (Have some tea)"],
      },
      culturalRituals: [
        { festivalName: "Diwali", description: "The Festival of Lights commemorates Lord Rama's return to Ayodhya after defeating Ravana. Homes glow with thousands of diyas (oil lamps), fireworks paint the night, and families share sweets — a five-day celebration of good over evil." },
        { festivalName: "Holi", description: "The festival of colours erupts every March as social hierarchies dissolve in clouds of powdered pigment. Streets become rivers of pink, blue, and gold — strangers become friends, and joy is the only currency." },
        { festivalName: "Navratri / Durga Puja", description: "Nine nights of dance (Garba in Gujarat, Dandiya in Maharashtra) culminate in Dussehra, celebrating the Goddess Durga's triumph over the demon Mahishasura. In Bengal, Durga Puja transforms entire neighbourhoods into open-air art galleries." },
      ],
      culinaryNarrative: [
        { dishName: "Hyderabadi Biryani", historicalOrigin: "Created in the kitchens of the Nizams of Hyderabad, this layered rice dish married Mughal Persian technique with Deccani spice — slow-cooked in a sealed pot (dum) for hours.", culturalSignificance: "Hyderabadi Biryani is diplomacy on a plate — the perfect marriage of saffron, caramelised onions, and marinated meat. Every family claims their recipe is the true one." },
        { dishName: "Masala Dosa", historicalOrigin: "Originating in Udupi, Karnataka, the dosa's crispy rice-and-lentil crepe dates back centuries — mentioned in Sangam literature as 'doshaka.'", culturalSignificance: "The dosa is India's great equaliser — eaten at roadside stalls and five-star hotels alike. Each region has its own version: Rava Dosa in the South, Masala Dosa with spiced potato, Paper Dosa stretched thin as silk." },
        { dishName: "Butter Chicken", historicalOrigin: "Invented in the 1950s at Delhi's Moti Mahal restaurant by Kundan Lal Gujral, who tandoor-roasted chicken and simmered it in a creamy tomato gravy.", culturalSignificance: "Butter Chicken is comfort distilled — its velvety sauce cradling tandoori-spiced chicken has made it one of the world's most beloved dishes, a symbol of Indian culinary warmth." },
      ],
      historicalContext: "India's civilisation stretches back to the Indus Valley's planned cities of 3300 BCE. The Vedas gave the world philosophy, mathematics gave the world zero, and the spice trade connected East and West for millennia. The Mughal Empire built the Taj Mahal — a monument to love in white marble. British colonialism lasted 200 years but could not extinguish a culture of 1.4 billion souls. Today, India is a kaleidoscope — ancient temples beside tech campuses, classical ragas alongside Bollywood beats, poverty and prosperity existing in the same breath.",
      socialEtiquette: [
        "Greet with 'Namaste' and a slight bow with palms pressed together — it is universally respectful across India's diverse religions.",
        "Remove shoes before entering temples, gurudwaras, and many homes.",
        "Eat with your right hand — the left hand is traditionally associated with personal hygiene.",
        "Accept chai when offered — refusing tea can be seen as rejecting hospitality.",
        "Dress modestly when visiting religious sites — shoulders and knees should be covered.",
        "Never touch someone's feet unless they are significantly elder — it is a profound gesture of respect.",
        "Head wobbling (the famous Indian head shake) can mean yes, maybe, or I'm listening — context is everything.",
      ],
    },
  },

  // ── 4. Thailand ──────────────────────────────────────────────────────────
  {
    email: 'thailand@kakatua.app',
    name: 'Thailand',
    countrySlug: 'thailand',
    nativeLanguages: ['Thai'],
    learningLanguages: ['English'],
    interests: ['Temple Art', 'Muay Thai', 'Street Food'],
    timezoneOffset: 7,
    card: {
      traditions: "Songkran, the Thai New Year, turns the entire nation into a joyful water fight — but beneath the splashing lies a profound tradition of washing away the old and blessing the new.",
      food: "Thai cuisine is a balancing act of five flavours — sweet, sour, salty, bitter, and spicy — each dish a carefully orchestrated symphony where no single note dominates.",
      history: "Thailand, formerly Siam, is the only Southeast Asian nation never colonised by a European power — a testament to diplomatic brilliance and fierce independence.",
      funFact: "Thailand has over 40,000 Buddhist temples (wats) — more temples per capita than almost any country on Earth.",
    },
    detailed: {
      languageInfo: {
        primaryLanguage: "Thai (Central Thai)",
        majorDialects: ["Isan (Northeastern)", "Northern Thai (Lanna)", "Southern Thai", "Phasa Khmer (in border regions)"],
        keyPhrases: ["Sawasdee ka/krap (Hello)", "Khob khun ka/krap (Thank you)", "Arroi mak (Very delicious)", "Tao rai? (How much?)", "Chai/Mai chai (Yes/No)"],
      },
      culturalRituals: [
        { festivalName: "Songkran", description: "Thai New Year in mid-April is celebrated with water fights that drench entire cities — but the tradition began as gently pouring scented water over elders' hands as a blessing. Temples host sand pagodas, and families reunite for merit-making." },
        { festivalName: "Loy Krathong", description: "On the full moon of November, Thailand releases thousands of banana-leaf boats (krathongs) onto rivers, each carrying a candle, incense, and flowers — a floating prayer of gratitude to the water goddess." },
        { festivalName: "Yi Peng (Sky Lanterns)", description: "Simultaneous with Loy Krathong in Chiang Mai, thousands of paper lanterns (khom loi) rise into the night sky — each one a released worry, a prayer carried upward by warm air and hope." },
      ],
      culinaryNarrative: [
        { dishName: "Pad Thai", historicalOrigin: "Created in the 1930s by Prime Minister Plaek Phibunsongkhram as part of a nation-building campaign — stir-fried noodles were promoted to reduce rice consumption and foster Thai identity.", culturalSignificance: "Pad Thai is Thailand's culinary ambassador to the world — a tangle of sweet, sour, and umami that embodies the Thai principle of balance. Every street vendor has their own secret." },
        { dishName: "Tom Yum Goong", historicalOrigin: "A hot-and-sour soup that has been a staple of Thai cuisine for centuries, using lemongrass, galangal, and kaffir lime — ingredients from the very forests that blanket the kingdom.", culturalSignificance: "Tom Yum Goong is Thailand in a bowl — fiery, fragrant, and unapologetically bold. Its aroma alone can make a homesick Thai weep with longing." },
        { dishName: "Som Tum (Green Papaya Salad)", historicalOrigin: "Originating in the Isan region, this pounded salad arrived in Bangkok with northeastern migrants and conquered the capital with its crunch.", culturalSignificance: "Som Tum is democracy on a plate — eaten by street food vendors and businesspeople alike. The mortar and pestle's rhythm is the heartbeat of Thai street food culture." },
      ],
      historicalContext: "Thailand's story is one of graceful survival. The Sukhothai Kingdom (1238) is considered the cradle of Thai civilisation, giving rise to the Thai alphabet, Theravada Buddhism, and the concept of the 'gentle person.' The Chakri Dynasty, founded in 1782, established Bangkok as the capital and navigated colonial pressures with diplomatic brilliance — playing Britain and France against each other to preserve sovereignty. King Chulalongkorn's modernisation reforms and the 1932 revolution that created a constitutional monarchy shaped the Thailand we know today — a kingdom of golden temples, vibrant markets, and smiles that have earned it the name 'Land of Smiles.'",
      socialEtiquette: [
        "The Thai greeting is the 'wai' — pressing palms together at chest level and bowing slightly. The higher the hands and lower the bow, the greater the respect.",
        "Never touch anyone's head — the head is considered the most sacred part of the body.",
        "Do not point your feet at people or sacred images — feet are considered the lowest part of the body.",
        "Remove shoes before entering temples and many shops and homes.",
        "Do not publically criticise the Thai royal family — lèse-majesté laws are strictly enforced.",
        "Smile through discomfort — the famous Thai smile can mean anything from joy to embarrassment to polite disagreement.",
      ],
    },
  },

  // ── 5. South Korea ───────────────────────────────────────────────────────
  {
    email: 'south-korea@kakatua.app',
    name: 'South Korea',
    countrySlug: 'south-korea',
    nativeLanguages: ['Korean'],
    learningLanguages: ['English'],
    interests: ['K-Pop', 'Hanbok', 'Technology'],
    timezoneOffset: 9,
    card: {
      traditions: "Chuseok, the Korean harvest moon festival, sees families return to ancestral homes for songpyeon — crescent-shaped rice cakes steamed over pine needles — while honouring three generations of forebears.",
      food: "Kimchi is not just a side dish — it is a philosophy of transformation. Cabbage fermented with chili, garlic, and love becomes something greater than its parts, just as Korea itself has transformed through centuries.",
      history: "From the Goryeo dynasty that gave us celadon pottery and the name 'Korea' to the Joseon era's Confucian scholarship, from the Korean War's devastation to the K-wave's global triumph — Korea's story is one of relentless reinvention.",
      funFact: "South Korea has the fastest internet in the world and the highest robot density in manufacturing — yet traditional hanbok dresses still grace every coming-of-age ceremony.",
    },
    detailed: {
      languageInfo: {
        primaryLanguage: "Korean",
        majorDialects: ["Gyeongsang (Busan)", "Jeolla (Gwangju)", "Gangwon", "Chungcheong", "Hamgyong (North)"],
        keyPhrases: ["Annyeonghaseyo (Hello)", "Gamsahamnida (Thank you)", "Jwesonghamnida (I'm sorry)", "Mashisseoyo (Delicious)", "Eolmayeyo? (How much?)"],
      },
      culturalRituals: [
        { festivalName: "Chuseok", description: "Korea's Thanksgiving — a three-day harvest festival where families gather, prepare songpyeon (pine-needle steamed rice cakes), and perform charye, a memorial service honouring ancestors with freshly harvested food." },
        { festivalName: "Seollal (Lunar New Year)", description: "Koreans gain a year on New Year's Day. Families wear hanbok, perform sebae (deep bows to elders), play yutnori (a board game), and eat tteokguk (rice cake soup) — one bowl, one year older." },
        { festivalName: "Boryeong Mud Festival", description: "Each July, Boryeong's beaches become a playground of mud — mud wrestling, mud sliding, mud painting. What began as a cosmetics promotion has become one of Asia's wildest festivals." },
      ],
      culinaryNarrative: [
        { dishName: "Kimchi", historicalOrigin: "Fermented vegetables date back over 2,000 years in Korea, with early versions lacking chili (which arrived from the Americas in the 16th century). The modern form crystallised during the Joseon Dynasty.", culturalSignificance: "Kimjang — the communal kimchi-making tradition — is a UNESCO Intangible Cultural Heritage. Families and neighbours gather in late autumn to prepare enough kimchi to last the winter, sharing recipes and stories." },
        { dishName: "Bibimbap", historicalOrigin: "A Jeonju specialty that originated as a way to use leftover side dishes — mixed rice topped with seasoned vegetables, egg, and gochujang.", culturalSignificance: "Bibimbap means 'mixed rice' — a metaphor for Korean society itself. Each ingredient retains its identity while contributing to a harmonious whole, especially beautiful in the stone-pot (dolsot) version where rice crisps at the edges." },
        { dishName: "Galbi (BBQ Ribs)", historicalOrigin: "Grilled beef short ribs marinated in soy, pear juice, and sesame — a dish that has been a celebration food since the Joseon Dynasty's cattle-rearing traditions.", culturalSignificance: "Korean BBQ is a social ritual. The grill sits at the center of the table, and the act of grilling and wrapping meat in lettuce with garlic and ssamjang is an act of care — you feed others before yourself." },
      ],
      historicalContext: "Korea's 5,000-year history is a tapestry of dynasties, invasions, and resilience. The Three Kingdoms period gave rise to Goguryeo's monumental tomb paintings and Silla's golden crowns. The Joseon Dynasty (1392-1897) fostered Confucian scholarship, created the Hangul alphabet — one of the world's most scientific writing systems — and built palaces of breathtaking beauty. Japanese occupation (1910-1945), the Korean War (1950-53), and decades of military rule preceded the democratisation movement of the 1980s. Today, South Korea's 'Miracle on the Han River' has made it a global powerhouse in technology, entertainment, and culture — the K-wave that began with K-pop now encompasses K-drama, K-beauty, and K-food.",
      socialEtiquette: [
        "Pour drinks for elders with both hands or supporting your pouring arm with the other — it shows deep respect.",
        "Never pour your own drink — always check your companions' glasses and refill them.",
        "Accept business cards with both hands and read them carefully before putting them down.",
        "The two-handed handshake is standard — support your right hand with your left when shaking with someone senior.",
        "Remove shoes before entering homes and some restaurants — indoor slippers are usually provided.",
        "Avoid writing names in red ink — it is associated with death in Korean culture.",
      ],
    },
  },

  // ── 6. Brazil ────────────────────────────────────────────────────────────
  {
    email: 'brazil@kakatua.app',
    name: 'Brazil',
    countrySlug: 'brazil',
    nativeLanguages: ['Portuguese'],
    learningLanguages: ['English', 'Spanish'],
    interests: ['Samba', 'Football', 'Amazon'],
    timezoneOffset: -3,
    card: {
      traditions: "Carnival is not merely a festival — it is a nation's soul exploding into the streets. Samba schools rehearse all year for their two-hour parade, each float a cathedral of feathers and rhythm.",
      food: "Feijoada, a black bean stew with pork, was born in the kitchens of enslaved Africans who transformed scraps into one of the world's great comfort dishes — a history of resilience simmered in every pot.",
      history: "Brazil's story is written in Portuguese, sung in samba, and stained by the largest forced migration in human history — yet it has forged one of the most vibrant multicultural societies on Earth.",
      funFact: "The Amazon rainforest produces 20% of the world's oxygen and contains 10% of all species on the planet — Brazil is its guardian.",
    },
    detailed: {
      languageInfo: {
        primaryLanguage: "Brazilian Portuguese",
        majorDialects: ["Carioca (Rio)", "Paulista (São Paulo)", "Nordestino (Northeastern)", "Mineiro (Minas Gerais)", "Gaúcho (Rio Grande do Sul)"],
        keyPhrases: ["Olá (Hello)", "Obrigado/a (Thank you)", "Por favor (Please)", "Desculpa (Sorry)", "Saudade (Deep longing for something absent)"],
      },
      culturalRituals: [
        { festivalName: "Carnival", description: "The world's largest street party — 40 million Brazilians take to the streets over five days. Samba schools parade in the Sambódromo, each competing with elaborate floats, percussion, and thousands of dancers in costumes that defy imagination." },
        { festivalName: "Festa Junina", description: "June festivals celebrating Saint John fill Brazil's towns with bonfires, quadrilha dances (folk square dances), and bonfires. Couples dress as rural peasants and dance through the night — a nostalgic tribute to Brazilian countryside culture." },
        { festivalName: "Reveillon (New Year)", description: "Brazilians flood Copacabana Beach in white clothing, offering flowers to Yemanjá, the ocean goddess. Seven waves, seven wishes — a syncretic blend of Catholic and Afro-Brazilian Candomblé traditions." },
      ],
      culinaryNarrative: [
        { dishName: "Feijoada", historicalOrigin: "Born in the colonial era, feijoada was created by enslaved Africans using the leftover pork parts discarded by plantation owners — transforming scraps into treasure.", culturalSignificance: "Feijoada is Brazil's national dish and its most honest meal — a reminder that beauty can emerge from hardship. Served with rice, farofa, and orange slices on Saturdays, it is a weekly ritual of togetherness." },
        { dishName: "Açaí Bowl", historicalOrigin: "The açaí palm is native to the Amazon, where the indigenous Tupi people have eaten its purple berries for centuries — calling it 'food that makes you strong.'", culturalSignificance: "From the Amazon to the world — the açaí bowl has become a global health food, but in Brazil it is simply breakfast: frozen açaí pulp blended with guaraná, topped with granola and banana." },
        { dishName: "Pão de Queijo", historicalOrigin: "Originating in Minas Gerais in the 18th century, these cheese bread balls use cassava starch (not wheat) — a legacy of indigenous ingredient knowledge.", culturalSignificance: "Pão de queijo is Brazil's edible hug — warm, chewy, and irresistible. Every grandmother has her own recipe, and the debate over the perfect ratio of cheese to starch is eternal." },
      ],
      historicalContext: "Brazil's history begins with the Tupí and Guaraní peoples, who named the land. Portuguese colonisation in 1500 brought 400 years of empire, slavery, and syncretism. The largest forced migration in history — over 4 million enslaved Africans — shaped Brazilian culture indelibly: samba, capoeira, Candomblé, and feijoada all carry African DNA. Independence in 1822, the abolition of slavery in 1888, the proclamation of the republic in 1889, and the military dictatorship (1964-1985) each left their mark. Today, Brazil is a continental nation of 215 million — where Amazonian tribes, colonial churches, and futuristic cities coexist in a kaleidoscope of colour, rhythm, and resilience.",
      socialEtiquette: [
        "Greetings involve a kiss on each cheek (in most regions) — even between men and women who have just met.",
        "Physical touch is common — Brazilians stand close, touch arms, and embrace freely.",
        "Being 10-30 minutes late is socially acceptable — 'Brazilian time' is a cultural norm, not rudeness.",
        "Never refuse food or drink — acceptance is a sign of friendship and respect.",
        "Football is a religion — never insult a Brazilian team unless you want to start a very passionate debate.",
        "The 'OK' hand gesture (thumb and index finger forming a circle) is considered vulgar in Brazil.",
      ],
    },
  },

  // ── 7. Germany ───────────────────────────────────────────────────────────
  {
    email: 'germany@kakatua.app',
    name: 'Germany',
    countrySlug: 'germany',
    nativeLanguages: ['German'],
    learningLanguages: ['English', 'French'],
    interests: ['Classical Music', 'Engineering', 'Philosophy'],
    timezoneOffset: 1,
    card: {
      traditions: "Oktoberfest is a 200-year-old tradition where 6 million litres of beer flow alongside brass bands, lederhosen, and pretzels the size of your face — a celebration of Gemütlichkeit (cosy togetherness).",
      food: "German bread culture is UNESCO-listed — over 3,200 varieties from dense Pumpernickel to crusty Bauernbrot. Each region's bakery tells the story of its soil and seasons.",
      history: "From the Holy Roman Empire to Martin Luther's Reformation, from Beethoven's symphonies to the Berlin Wall's fall — Germany's history is a dialogue between fragmentation and unity.",
      funFact: "Germany has over 1,500 different beer brands and 1,300 breweries — more per capita than almost any country.",
    },
    detailed: {
      languageInfo: {
        primaryLanguage: "German (Hochdeutsch)",
        majorDialects: ["Bavarian", "Swabian", "Saxon", "Low German (Plattdeutsch)", "Alemannic (Swiss German)"],
        keyPhrases: ["Guten Tag (Hello)", "Danke (Thank you)", "Entschuldigung (Excuse me)", "Lecker (Delicious)", "Prost! (Cheers!)"],
      },
      culturalRituals: [
        { festivalName: "Oktoberfest", description: "Munich's 16-day beer festival attracts 6 million visitors annually. Bavarian bands play oompah music, waitresses carry 10-litre beer steins, and families share pretzels and Weisswurst under enormous tent canopies." },
        { festivalName: "Weihnachtsmärkte (Christmas Markets)", description: "From late November, Germany's towns transform into winter wonderlands. Nuremberg's Christkindlesmarkt, Dresden's Striezelmarkt, and Cologne's markets sell Glühwein, Lebkuchen, and handcrafted ornaments — some markets are 600 years old." },
        { festivalName: "Karneval / Fasching", description: "Before Lent, Germany's Rhineland erupts in colourful chaos. Cologne's Karneval features masked jesters, satirical floats mocking politicians, and days of street dancing — Germany letting its hair down." },
      ],
      culinaryNarrative: [
        { dishName: "Brezel (Pretzel)", historicalOrigin: "The pretzel's twisted shape may date to medieval monks, who created it as a reward for children who learned their prayers — the shape mimicking arms crossed in prayer.", culturalSignificance: "The Brezel is Germany's edible handshake — offered at every bakery, beer garden, and Brotzeit (bread time). Its crusty exterior and soft interior mirror the German character itself." },
        { dishName: "Sauerbraten", historicalOrigin: "A pot roast marinated for days in vinegar, wine, and spices — a method that likely dates to the Roman era's preservation techniques.", culturalSignificance: "Sauerbraten is patience made edible. The multi-day marination transforms tough meat into something tender and complex — a metaphor for German thoroughness." },
        { dishName: "Döner Kebab", historicalOrigin: "Brought to Berlin by Turkish guest workers (Gastarbeiter) in the 1960s, the Döner was reinvented as a fast-food sandwich in Berlin — now Germany's most popular street food.", culturalSignificance: "The Döner Kebab is Germany's great immigrant success story — a Turkish tradition that became a German icon, symbolising the cultural fusion that defines modern Germany." },
      ],
      historicalContext: "Germany's history is a journey through darkness and light. The Holy Roman Empire, the Reformation, the Enlightenment, and the unification of 1871 created a nation of philosophers, composers, and engineers. The horrors of the Nazi regime and World War II left scars that Germany has confronted with remarkable honesty — the Holocaust Memorial, the Stasi Museum, and the phrase 'Nie wieder' (never again) stand as solemn commitments. The Berlin Wall's fall in 1989 reunified a divided nation, and today Germany is Europe's economic powerhouse — a country that has learned from its darkest chapters and dedicated itself to peace, precision, and precision-engineered sausages.",
      socialEtiquette: [
        "Shake hands firmly when greeting — Germans value directness and sincerity in first impressions.",
        "Punctuality is sacred — being even 5 minutes late is considered disrespectful.",
        "Recycle meticulously — Germany's Pfand system and waste sorting are points of national pride.",
        "Use 'Sie' (formal you) with strangers and elders — switching to 'du' (informal) requires invitation.",
        "Don't cross the street on a red light, even if no cars are coming — Germans respect rules as social contracts.",
        "Sunday is rest day — most shops close, and loud activities are frowned upon (even vacuuming is taboo).",
      ],
    },
  },

  // ── 8. USA ───────────────────────────────────────────────────────────────
  {
    email: 'usa@kakatua.app',
    name: 'United States',
    countrySlug: 'usa',
    nativeLanguages: ['English'],
    learningLanguages: ['Spanish'],
    interests: ['Jazz', 'Innovation', 'National Parks'],
    timezoneOffset: -5,
    card: {
      traditions: "Thanksgiving is America's most intimate holiday — families gather around tables groaning with turkey, cranberry sauce, and gratitude, each dish a thread in the fabric of immigrant memory.",
      food: "American cuisine is a collage of the world — gumbo from West Africa, pizza from Naples, tacos from Mexico, chop suey from China — all transformed by the American experiment into something entirely new.",
      history: "From indigenous civilisations that built mounds taller than the pyramids to the Declaration of Independence's radical promise — America's story is an ongoing argument about freedom.",
      funFact: "The US has no official language at the federal level — over 350 languages are spoken across the country.",
    },
    detailed: {
      languageInfo: {
        primaryLanguage: "American English",
        majorDialects: ["Southern", "New York", "Midwestern (General American)", "African American Vernacular English (AAVE)", "Chicano English"],
        keyPhrases: ["Howdy! (Hello — Southern)", "Thank you!", "Excuse me", "Awesome! (Great)", "How's it going? (How are you?)"],
      },
      culturalRituals: [
        { festivalName: "Thanksgiving", description: "Fourth Thursday in November — the most travelled day in America. Families reunite for turkey, stuffing, and pie, sharing what they're grateful for. Rooted in 1621, it has evolved into a secular celebration of family and abundance." },
        { festivalName: "Fourth of July (Independence Day)", description: "Fireworks, barbecues, and parades celebrate the 1776 Declaration of Independence. The National Mall in Washington D.C. hosts one of the world's most spectacular fireworks displays." },
        { festivalName: "Mardi Gras", description: "New Orleans' legendary pre-Lenten celebration — weeks of parades with elaborately decorated floats, jazz brass bands, and the tossing of beads and doubloons. Bourbon Street becomes a river of purple, green, and gold." },
      ],
      culinaryNarrative: [
        { dishName: "Gumbo", historicalOrigin: "Born in Louisiana from the collision of West African, French, Spanish, Choctaw, and Creole traditions — gumbo's name comes from the West African word for okra.", culturalSignificance: "Gumbo is America in a pot — a dish that could only exist where cultures collide. Every family has a secret roux recipe, and debates over whether it should include tomatoes or filé powder are eternal." },
        { dishName: "Hamburger", historicalOrigin: "Whether it was invented in Hamburg, Germany, or at Louis' Lunch in New Haven, Connecticut (1900), the hamburger became America's signature food during the industrial age.", culturalSignificance: "The hamburger is American democracy on a bun — affordable, adaptable, and endlessly customisable. From White Castle sliders to Wagyu creations, it is the dish that fed a nation." },
        { dishName: "BBQ (varies by region)", historicalOrigin: "American barbecue traces to indigenous smoking techniques, African American pit masters, and Spanish colonization — each region developed its own: Texas brisket, Carolina pulled pork, Kansas City ribs.", culturalSignificance: "BBQ is America's most regional food and its most communal. A proper smoke takes 12-18 hours, and the pit master's patience is a form of love — feeding a crowd slowly, with fire and time." },
      ],
      historicalContext: "The United States is a nation built on contradictory promises — liberty and slavery, opportunity and exclusion, the frontier and the reservation. Indigenous civilisations thrived for millennia before European colonisation. The Declaration of Independence (1776), the Constitution (1787), and the Bill of Rights (1791) created a framework for freedom that has been expanding ever since — through the Civil War, Reconstruction, the Civil Rights Movement, and beyond. America's greatest export may be its culture: jazz, Hollywood, hip-hop, Silicon Valley — each a product of the immigrant experience. Today, the US remains a nation in progress, arguing loudly about what freedom means, which is perhaps the most American thing of all.",
      socialEtiquette: [
        "Tipping 15-20% at restaurants is mandatory — servers depend on tips as a significant portion of their income.",
        "Small talk is expected — 'How are you?' is a greeting, not a genuine question. 'Good, thanks!' is the expected response.",
        "Personal space is important — Americans prefer about an arm's length of distance in conversations.",
        "Eye contact conveys confidence and honesty — avoiding it may be interpreted as evasiveness.",
        "Punctuality is valued — arriving on time means exactly on time, not 10 minutes later.",
        "Handshakes are firm and accompanied by direct eye contact — a weak handshake may be interpreted negatively.",
      ],
    },
  },

  // ── 9. United Kingdom ────────────────────────────────────────────────────
  {
    email: 'uk@kakatua.app',
    name: 'United Kingdom',
    countrySlug: 'uk',
    nativeLanguages: ['English'],
    learningLanguages: ['Welsh', 'Scottish Gaelic'],
    interests: ['Literature', 'Pub Culture', 'Royal Heritage'],
    timezoneOffset: 0,
    card: {
      traditions: "Afternoon tea is Britain's most civilised invention — tiered stands of finger sandwiches, scones with clotted cream, and a pot of Earl Grey that has been steeping since the Empire.",
      food: "The full English breakfast — eggs, bacon, sausages, beans, toast, mushrooms, and a cup of builder's tea — is not merely a meal but a declaration of intent for the day ahead.",
      history: "From Stonehenge to the Magna Carta, from Shakespeare's Globe to the NHS — Britain's story is one of outsized influence on language, law, and literature.",
      funFact: "The UK has more museums per capita than any country on Earth — over 2,500, and most are free.",
    },
    detailed: {
      languageInfo: {
        primaryLanguage: "British English",
        majorDialects: ["Received Pronunciation (RP)", "Cockney", "Scouse (Liverpool)", "Geordie (Newcastle)", "Welsh English", "Scottish English"],
        keyPhrases: ["Cheers! (Thanks)", "Sorry! (Used constantly, even when not at fault)", "Brilliant! (Great)", "Fancy a cuppa? (Would you like tea?)", "Chuffed to bits (Very pleased)"],
      },
      culturalRituals: [
        { festivalName: "Guy Fawkes Night (Bonfire Night)", description: "Every 5th November, bonfires burn and fireworks crack across Britain, commemorating the failed Gunpowder Plot of 1605. An effigy of Guy Fawkes is burned on the fire — 'Remember, remember, the fifth of November.'" },
        { festivalName: "Royal Ascot", description: "The pinnacle of British horse racing and fashion — five days in June where hats reach architectural heights, champagne flows, and the Royal Family arrives in horse-drawn carriages." },
        { festivalName: "Notting Hill Carnival", description: "Europe's largest street festival — two days of Caribbean music, elaborate costumes, and jerk chicken that transforms West London into a riot of colour and soca rhythms." },
      ],
      culinaryNarrative: [
        { dishName: "Fish and Chips", historicalOrigin: "Brought to Britain by Jewish immigrants from Portugal and Spain, the battered fish was united with chips (fried potatoes) in the 1860s — becoming the working-class meal of the Industrial Revolution.", culturalSignificance: "Fish and chips sustained Britain through two World Wars — it was one of the few foods not rationed. Wrapped in paper and eaten from the newspaper (now proper wrapping), it remains the nation's comfort food." },
        { dishName: "Sunday Roast", historicalOrigin: "A tradition dating to the 1500s, when families would slow-roast meat on Sundays after church — a practice tied to the medieval 'Sunday dinner' custom.", culturalSignificance: "The Sunday Roast is Britain's weekly family reunion — roast beef or lamb, crispy potatoes, Yorkshire pudding, and gravy. It is the meal around which British families gather and the pub tradition was born." },
        { dishName: "Full English Breakfast", historicalOrigin: "Its roots lie in the Victorian gentlemen's clubs, where a substantial breakfast was considered essential for a day of business. The 'fry-up' evolved through the 20th century.", culturalSignificance: "The Full English is a civil engineering project on a plate — beans, eggs, sausages, bacon, mushrooms, toast, and a pot of strong tea. It is both hangover cure and morning ritual." },
      ],
      historicalContext: "The United Kingdom — England, Scotland, Wales, and Northern Ireland — has shaped the modern world in ways both grand and troubling. From the Magna Carta (1215) to the parliamentary democracy that inspired constitutions worldwide, from the Industrial Revolution that remade human civilisation to the British Empire that colonised a quarter of the globe, from Shakespeare to the Beatles, from the NHS to the Premier League. The UK's cultural exports — the English language, common law, football, cricket, tea-drinking — have become universal. Brexit, Scottish independence debates, and the evolving monarchy ensure that the UK's story remains unfinished and fiercely debated.",
      socialEtiquette: [
        "Queuing is sacred — cutting in line is perhaps the greatest social sin in Britain.",
        "Saying 'sorry' is reflexive — Britons apologise for everything, including when someone else steps on their foot.",
        "Understatement is an art form — 'not bad' means excellent, 'quite good' means very good, and 'interesting' means terrible.",
        "Pub etiquette: buy rounds for the group, don't linger at the bar after being served, and always say 'cheers' when receiving a drink.",
        "Discussing money is considered vulgar — asking someone's salary is deeply inappropriate.",
        "The stiff upper lip is fading, but emotional restraint is still valued in public spaces.",
      ],
    },
  },

  // ── 10. Australia ────────────────────────────────────────────────────────
  {
    email: 'australia@kakatua.app',
    name: 'Australia',
    countrySlug: 'australia',
    nativeLanguages: ['English'],
    learningLanguages: ['Indigenous Languages'],
    interests: ['Surfing', 'Aboriginal Art', 'Outback'],
    timezoneOffset: 10,
    card: {
      traditions: "Anzac Day dawn services bring the nation to silent attention — at 4:28am, Australians honour their war dead with wreaths, stories, and the haunting strains of the Last Post.",
      food: "The meat pie is Australia's culinary national anthem — flaky pastry filled with seasoned beef and gravy, eaten at football matches and road-side bakeries from Darwin to Hobart.",
      history: "Australia's story spans 65,000 years of Aboriginal civilisation, followed by British colonisation, gold rushes, federation, and a modern multicultural transformation.",
      funFact: "Australia has more kangaroos than people — approximately 50 million roos versus 26 million humans.",
    },
    detailed: {
      languageInfo: {
        primaryLanguage: "Australian English",
        majorDialects: ["Broad Australian (Steve Irwin)", "General Australian (most common)", "Cultivated Australian (close to RP)", "Australian Kriol (Aboriginal English)"],
        keyPhrases: ["G'day! (Hello)", "No worries (It's fine/You're welcome)", "Arvo (Afternoon)", "Barbie (Barbecue)", "Fair dinkum? (Really/Seriously?)"],
      },
      culturalRituals: [
        { festivalName: "ANZAC Day", description: "April 25th — Australia and New Zealand honour their soldiers with dawn services, marches, and the two-up gambling game (legal only on this day). The Last Post echoes through silence, and red poppies bloom on lapels." },
        { festivalName: "Australia Day", description: "January 26th — celebrating the 1788 arrival of the First Fleet, but increasingly a day of reflection and debate about its meaning for Aboriginal and Torres Strait Islander peoples, who call it 'Invasion Day.'" },
        { festivalName: "Vivid Sydney", description: "Each May-June, Sydney's harbour becomes a canvas for the world's largest light festival — the Opera House, Harbour Bridge, and city buildings transformed by projections, music, and ideas." },
      ],
      culinaryNarrative: [
        { dishName: "Meat Pie", historicalOrigin: "Brought by British settlers and evolved into a uniquely Australian icon — the classic version features minced beef in gravy, encased in golden puff pastry.", culturalSignificance: "The meat pie is eaten with hands, usually at a football match or road-side bakery. It is deliberately unpretentious — Australia's egalitarianism made edible." },
        { dishName: "Tim Tams", historicalOrigin: "Created by the Arnott's biscuit company in 1964, named after a horse that won the 1958 Kentucky Derby.", culturalSignificance: "The 'Tim Tam Slam' — biting opposite corners and using the biscuit as a straw to sip tea or coffee — is a national ritual. Tim Tams are Australia's diplomatic gift to the world." },
        { dishName: "Barramundi", historicalOrigin: "The name comes from the Aboriginal language 'baramundi' meaning 'large-scaled river fish' — a species that has been eaten by First Nations people for thousands of years.", culturalSignificance: "Barramundi represents the meeting of ancient Aboriginal food knowledge and modern Australian cuisine — a fish that connects 65,000 years of tradition to today's plates." },
      ],
      historicalContext: "Australia's story begins 65,000 years ago with Aboriginal and Torres Strait Islander peoples — the world's oldest continuous civilisation, who developed sophisticated land management, astronomy, and storytelling traditions. British colonisation in 1788 brought devastation to Indigenous communities, a trauma that Australia continues to confront through the Stolen Generations apology, land rights movements, and the ongoing journey toward reconciliation. The gold rushes of the 1850s, the ANZAC legend of Gallipoli, the post-WWII immigration boom, and the cultural renaissance of recent decades have shaped a nation of 26 million — multicultural, irreverent, and deeply connected to its extraordinary landscape.",
      socialEtiquette: [
        "The 'barbie' (barbecue) is a national institution — if invited, bring beer, salads, or meat, and prepare for hours of conversation.",
        "Tall poppy syndrome is real — boasting or showing off is frowned upon; humility is valued.",
        "Aussies shorten everything — afternoon becomes 'arvo,' McDonald's becomes 'Macca's,' and 'G'day' is always appropriate.",
        "Sun safety is serious — slip, slop, slap (shirt, sunscreen, hat) is drilled into every Australian from childhood.",
        "Aboriginal and Torres Strait Islander cultures should be approached with respect — learn about the Traditional Owners of the land you're on.",
        "The Australian 'no worries' attitude is genuine — it means 'it's fine,' 'you're welcome,' and 'don't stress' all at once.",
      ],
    },
  },

  // ── 11. Pakistan ──────────────────────────────────────────────────────────
  {
    email: 'pakistan@kakatua.app',
    name: 'Pakistan',
    countrySlug: 'pakistan',
    nativeLanguages: ['Urdu', 'Punjabi', 'Sindhi', 'Pashto', 'Balochi'],
    learningLanguages: ['English'],
    interests: ['Mughal Architecture', 'Sufi Music', 'Mountain Culture'],
    timezoneOffset: 5,
    card: {
      traditions: "Basant, the ancient kite-flying festival, once painted Lahore's skies gold — thousands of paper fighters duelling in the spring breeze, each fallen kite a celebration of winter's end.",
      food: "Nihari, slow-cooked overnight in copper pots, is Pakistan's love letter to patience — a rich, spiced stew that has fuelled Mughal courts and modern family gatherings alike.",
      history: "From the Indus Valley Civilisation's Mohenjo-daro to the Mughal Empire's architectural masterpieces, from the 1947 partition to the Karakoram's highway of resilience — Pakistan's story is ancient and unfolding.",
      funFact: "Pakistan is home to five of the world's fourteen peaks over 8,000 metres — including K2, the second-highest mountain on Earth.",
    },
    detailed: {
      languageInfo: {
        primaryLanguage: "Urdu (national), with English as official",
        majorDialects: ["Punjabi (Lahori)", "Sindhi", "Pashto", "Balochi", "Saraiki", "Kashmiri"],
        keyPhrases: ["Assalam-o-Alaikum (Peace be upon you — Hello)", "Shukriya (Thank you)", "Kya haal hai? (How are you?)", "Mazedaar! (Delicious!)", "Chalo! (Let's go!)"],
      },
      culturalRituals: [
        { festivalName: "Eid-ul-Fitr", description: "The end of Ramadan's month-long fast is celebrated with dawn prayers, new clothes, feasts of sheer khurma (vermicelli pudding), and Eidi — money gifted by elders to children. Streets fill with the scent of biryani and the sound of celebration." },
        { festivalName: "Basant (Lahore)", description: "Once the crown jewel of Lahore's spring, Basant saw the Walled City draped in yellow as thousands flew kites from rooftops. Though currently restricted, it remains a symbol of Lahore's joyful spirit and cultural defiance." },
        { festivalName: "Ursh (Sufi Festivals)", description: "At Sufi shrines across Pakistan — Data Darbar in Lahore, Shah Abdul Latif Bhittai's in Sindh — qawwali devotional music fills the night as thousands gather for all-night sessions of spiritual ecstasy, dancing, and devotion." },
      ],
      culinaryNarrative: [
        { dishName: "Nihari", historicalOrigin: "Born in the royal kitchens of the Mughal Empire, Nihari was traditionally a dawn meal for labourers — slow-cooked overnight so the meat would be fork-tender by morning.", culturalSignificance: "Nihari is Pakistan's most beloved comfort food — a rich, slow-cooked stew of beef or lamb shanks in a spiced flour gravy. In Lahore's Food Street, Nihari shops have been serving the same recipe for generations." },
        { dishName: "Biryani (Karachi-style)", historicalOrigin: "While biryani arrived with the Mughals, Karachi's version absorbed influences from its diverse population — Sindhi, Memoni, and Hyderabadi traditions each adding their own spice.", culturalSignificance: "Karachi's biryani is a city in a pot — layered, complex, and unapologetically bold. Every neighbourhood claims the best biryani shop, and the debate is as spicy as the dish itself." },
        { dishName: "Chapli Kebab", historicalOrigin: "A flat, crispy minced-meat kebab from Peshawar's Qissa Khwani Bazaar (Storytellers' Market), seasoned with pomegranate seeds and coriander.", culturalSignificance: "Chapli kebabs are Peshawar's edible heritage — made fresh on the spot, eaten with naan and a cup of green tea. Each bite carries the flavours of the Khyber Pass and the tribal traditions of the frontier." },
      ],
      historicalContext: "Pakistan's history stretches back to the Indus Valley Civilisation (3300-1300 BCE), whose cities of Mohenjo-daro and Harappa had sophisticated urban planning, drainage systems, and a yet-undeciphered script. The region witnessed Gandharan Buddhist art, the Maurya Empire, Islamic conquests, and the magnificent Mughal Empire — whose architectural legacy includes the Badshahi Mosque and the Shah Jahan's Lahore Fort. The 1947 partition created a nation of extraordinary diversity — Punjabi, Sindhi, Pashtun, Baloch, and Kashmiri peoples united under a new flag. Today, Pakistan is a nation of 240 million, where ancient Sufi traditions coexist with modern tech startups, and the Karakoram Highway — the world's highest paved road — connects it to China.",
      socialEtiquette: [
        "The greeting 'Assalam-o-Alaikum' (Peace be upon you) is universal — reply with 'Walaikum Assalam' (And upon you be peace).",
        "Hospitality is paramount — guests are offered tea, sweets, and the best seat. Refusing food may offend.",
        "Use your right hand for eating, greeting, and passing objects — the left hand is considered inappropriate.",
        "Elders are deeply respected — use 'Ji' (sir/ma'am) after names: 'Abbas Ji,' 'Amma Ji.'",
        "Remove shoes before entering homes and mosques — it is both practical and respectful.",
        "When visiting someone's home, bring a small gift — sweets, fruit, or dessert. Never arrive empty-handed.",
      ],
    },
  },
];

// ─── Master Data Catalog (languages & interests) ──────────────────────────────

const LANGUAGES = [
  { code: 'en', name: 'English', flagEmoji: '🇬🇧' },
  { code: 'bn', name: 'Bengali', flagEmoji: '🇧🇩' },
  { code: 'ja', name: 'Japanese', flagEmoji: '🇯🇵' },
  { code: 'hi', name: 'Hindi', flagEmoji: '🇮🇳' },
  { code: 'th', name: 'Thai', flagEmoji: '🇹🇭' },
  { code: 'ko', name: 'Korean', flagEmoji: '🇰🇷' },
  { code: 'pt', name: 'Portuguese', flagEmoji: '🇧🇷' },
  { code: 'de', name: 'German', flagEmoji: '🇩🇪' },
  { code: 'es', name: 'Spanish', flagEmoji: '🇪🇸' },
  { code: 'fr', name: 'French', flagEmoji: '🇫🇷' },
  { code: 'ar', name: 'Arabic', flagEmoji: '🇸🇦' },
  { code: 'ur', name: 'Urdu', flagEmoji: '🇵🇰' },
  { code: 'zh', name: 'Mandarin Chinese', flagEmoji: '🇨🇳' },
  { code: 'ru', name: 'Russian', flagEmoji: '🇷🇺' },
  { code: 'it', name: 'Italian', flagEmoji: '🇮🇹' },
  { code: 'id', name: 'Indonesian', flagEmoji: '🇮🇩' },
];

const INTERESTS = [
  'Language Learning', 'Travel', 'Food & Cooking', 'Music', 'Movies', 'Books',
  'Photography', 'Technology', 'Gaming', 'Sports', 'Art & Design', 'History',
  'Culture', 'Poetry', 'Fitness & Wellness', 'Nature', 'Entrepreneurship',
  'Dance', 'Chess', 'Climate & Environment', 'Volunteering', 'Meditation', 'Startups',
];

async function linkLanguages(
  userId: string,
  native: string[],
  learning: string[]
) {
  const langs = await prisma.language.findMany({ select: { id: true, name: true } });
  const byName = new Map(langs.map((l) => [l.name.toLowerCase(), l.id]));
  const entries = [];

  for (const name of native) {
    const languageId = byName.get(name.toLowerCase());
    if (languageId) {
      entries.push({ userId, languageId, type: 'NATIVE', proficiency: 'Fluent', isPrimary: true });
    }
  }
  for (const name of learning) {
    const languageId = byName.get(name.toLowerCase());
    if (languageId) {
      entries.push({ userId, languageId, type: 'LEARNING', proficiency: 'Intermediate', isPrimary: false });
    }
  }

  if (entries.length > 0) {
    await prisma.userLanguage.createMany({ data: entries });
  }
}

async function linkInterests(userId: string, names: string[]) {
  const interests = await prisma.interest.findMany({ select: { id: true, name: true } });
  const byName = new Map(interests.map((i) => [i.name.toLowerCase(), i.id]));

  const entries = [];
  for (const name of names) {
    const interestId = byName.get(name.toLowerCase());
    if (interestId) entries.push({ userId, interestId });
  }

  if (entries.length > 0) {
    await prisma.userInterest.createMany({ data: entries });
  }
}

// ─── Seed Function ────────────────────────────────────────────────────────────

async function main() {
  console.log('Seeding Kakatua database...\n');

  // 0. Master data catalog (languages & interests)
  console.log('  ── Catalog (languages & interests) ──────────────');
  for (const lang of LANGUAGES) {
    await prisma.language.upsert({ where: { code: lang.code }, create: lang, update: {} });
  }
  for (const name of INTERESTS) {
    await prisma.interest.upsert({ where: { name }, create: { name }, update: {} });
  }
  console.log(`    PASS ${LANGUAGES.length} languages, ${INTERESTS.length} interests`);

  // 1. Clear all existing system bots + country ambassadors
  const allEmails = [...SYSTEM_EMAILS, ...COUNTRIES.map((c) => c.email)];
  const deleted = await prisma.user.deleteMany({
    where: { email: { in: allEmails } },
  });
  if (deleted.count > 0) {
    console.log(`  Cleared ${deleted.count} existing profile(s).`);
  }

  // 2. System Bots ──────────────────────────────────────────────────────────
  console.log('\n  ── System Bots ─────────────────────────────────────');

  const guide = await prisma.user.create({
    data: {
      email: 'guide@kakatua.app',
      name: 'Kakatua Guide',
      isAmbassador: true,
      ambassadorRole: 'GUIDE',
      ambassadorBadge: 'Verified Guide',
      specialtyLanguages: ['English', 'Spanish'],
      isOnline: true,
      password: null,
      nativeLanguages: JSON.stringify(['English']),
      learningLanguages: JSON.stringify(['Spanish']),
      interests: JSON.stringify(['Language Learning', 'Community']),
      timezoneOffset: 0,
      status: 'active',
      profile: {
        create: {
          username: 'guide',
          displayName: 'Kakatua Guide',
          bio: 'Weekly welcome circles where newcomers share a greeting from their mother tongue.',
          country: 'Global',
          nativeLanguage: 'English',
          interfaceLanguage: 'English',
        },
      },
      cultureCard: {
        create: {
          data: JSON.stringify({
            traditions: "Weekly welcome circles where newcomers share a greeting from their mother tongue.",
            food: "Virtual potlucks — everyone brings a recipe from their hometown to the group chat.",
            history: "Founded in 2026 as a safe canopy for language learners worldwide.",
            funFact: "The name 'Kakatua' comes from the Indonesian word for cockatoo — loud, social, and always flocked together.",
          }),
        },
      },
    },
  });
  await linkLanguages(guide.id, ['English'], ['Spanish']);
  await linkInterests(guide.id, ['Language Learning', 'Community']);
  console.log('    PASS Kakatua Guide (GUIDE)');

  const buddy = await prisma.user.create({
    data: {
      email: 'buddy@kakatua.app',
      name: 'Global Buddy',
      isAmbassador: true,
      ambassadorRole: 'MATCHMAKER',
      ambassadorBadge: 'Verified Matchmaker',
      specialtyLanguages: ['Bengali', 'English'],
      isOnline: true,
      password: null,
      nativeLanguages: JSON.stringify(['Bengali']),
      learningLanguages: JSON.stringify(['English']),
      interests: JSON.stringify(['Technology', 'Solar Energy', 'Poetry']),
      timezoneOffset: 6,
      status: 'active',
      profile: {
        create: {
          username: 'buddy',
          displayName: 'Global Buddy',
          bio: 'Evening poetry readings on the rooftop, sharing verses in Bengali and English.',
          country: 'Bangladesh',
          city: 'Dhaka',
          nativeLanguage: 'Bengali',
          interfaceLanguage: 'English',
          timezone: 'Asia/Dhaka',
        },
      },
      cultureCard: {
        create: {
          data: JSON.stringify({
            traditions: "Evening poetry readings on the rooftop, sharing verses in Bengali and English.",
            food: "Pitha-making during winter festivals — rice cakes filled with jaggery and coconut.",
            history: "Dhaka's tech scene has grown rapidly, with startups emerging from co-working spaces across the city.",
            funFact: "Bengali is the sixth most spoken language in the world, with over 230 million native speakers.",
          }),
        },
      },
    },
  });
  await linkLanguages(buddy.id, ['Bengali'], ['English']);
  await linkInterests(buddy.id, ['Technology', 'Poetry']);
  console.log('    PASS Global Buddy (MATCHMAKER)');

  // Dhaka Local — CULTURAL_ADVISOR (also Bangladesh country ambassador)
  const dhaka = await prisma.user.create({
    data: {
      email: 'dhaka@kakatua.app',
      name: 'Dhaka Local',
      isAmbassador: true,
      ambassadorRole: 'CULTURAL_ADVISOR',
      ambassadorBadge: 'Dhaka Cultural Advisor',
      specialtyLanguages: ['Bengali', 'English'],
      isOnline: true,
      password: null,
      nativeLanguages: JSON.stringify(['Bengali']),
      learningLanguages: JSON.stringify(['English']),
      interests: JSON.stringify(['Digital Marketing', 'Dhaka Life', 'Startups']),
      timezoneOffset: 6,
      status: 'active',
      profile: {
        create: {
          username: 'dhaka-local',
          displayName: 'Dhaka Local',
          bio: 'Rickshaw art is a living tradition — every cycle is a canvas of vibrant folk storytelling.',
          country: 'Bangladesh',
          city: 'Dhaka',
          nativeLanguage: 'Bengali',
          interfaceLanguage: 'English',
          timezone: 'Asia/Dhaka',
        },
      },
      cultureCard: {
        create: {
          data: JSON.stringify({
            traditions: "Rickshaw art is a living tradition — every cycle is a canvas of vibrant folk storytelling.",
            food: "Fuchka from street vendors is the heartbeat of Dhaka's evening snack culture.",
            history: "Dhaka is one of the densest and most vibrant cities in South Asia, with a rich Mughal heritage.",
            funFact: "Dhaka's rickshaws produce over 100,000 unique hand-painted artworks every year.",
          }),
        },
      },
    },
  });
  await linkLanguages(dhaka.id, ['Bengali'], ['English']);
  await linkInterests(dhaka.id, ['Startups', 'Culture']);
  console.log('    PASS Dhaka Local (CULTURAL_ADVISOR)');

  // 3. Country Ambassadors ─────────────────────────────────────────────────
  console.log('\n  ── Country Ambassadors (Flock Library) ────────────');

  for (const country of COUNTRIES) {
    const user = await prisma.user.create({
      data: {
        email: country.email,
        name: country.name,
        isAmbassador: true,
        ambassadorRole: 'CULTURAL_ADVISOR',
        ambassadorBadge: `${country.name} Advisor`,
        specialtyLanguages: [...country.nativeLanguages, ...country.learningLanguages],
        isOnline: false,
        countrySlug: country.countrySlug,
        password: null,
        nativeLanguages: JSON.stringify(country.nativeLanguages),
        learningLanguages: JSON.stringify(country.learningLanguages),
        interests: JSON.stringify(country.interests),
        timezoneOffset: country.timezoneOffset,
        status: 'active',
        profile: {
          create: {
            username: country.countrySlug,
            displayName: country.name,
            bio: country.card.history,
            country: country.name,
            nativeLanguage: country.nativeLanguages[0],
            interfaceLanguage: 'English',
          },
        },
        cultureCard: {
          create: {
            data: JSON.stringify(country.card),
            detailedContent: JSON.stringify(country.detailed),
          },
        },
      },
    });
    await linkLanguages(user.id, country.nativeLanguages, country.learningLanguages);
    await linkInterests(user.id, country.interests);
    console.log(`    PASS ${country.name} (${country.countrySlug})`);
  }

  // 4. Integrity verification ──────────────────────────────────────────────
  console.log('\n  ── Integrity Verification ─────────────────────────');
  const all = await prisma.user.findMany({
    where: { email: { in: allEmails } },
    select: { name: true, email: true, isAmbassador: true, ambassadorRole: true, password: true },
  });

  let failures = 0;
  for (const user of all) {
    const ok = user.isAmbassador && user.ambassadorRole && user.password === null;
    console.log(`    ${ok ? 'PASS' : 'FAIL'} ${user.name}: role=${user.ambassadorRole}, password=null`);
    if (!ok) failures++;
  }

  console.log(`\nSeeding complete! ${all.length} profiles created (${failures} failures).`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
