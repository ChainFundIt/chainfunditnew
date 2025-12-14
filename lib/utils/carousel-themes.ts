// Theme configurations for different festivities
export interface ThemeFeature {
  title: string;
  desc: string;
  bgClass: string;
  textColor: string;
}

export interface ThemeConfig {
  mainHeading: string;
  mainDescription: string;
  carouselSlides?: Array<{
    heading: string;
    description: string;
  }>;
  images: string[];
  features: ThemeFeature[];
}

const themeConfigs: Record<string, ThemeConfig> = {
  default: {
    mainHeading: "Maximise your fundraising efforts",
    mainDescription: "We'll handle the grueling campaign management, so you can do what matters most - getting donations",
    images: [
      "/images/currencies.png",
      "/images/teamwork.png",
      "/images/secure.png",
    ],
    features: [
      {
        title: "Multi-currency is our thing",
        desc: "Raise donations anywhere, in your preferred currency. Explore our Crypto options and raise more donations",
        bgClass: "bg-brand-green-dark",
        textColor: "text-white",
      },
      {
        title: "Chained campaigns",
        desc: "Our influencer network drives traffic to your campaigns to push your closer to your goal even faster",
        bgClass: "bg-brand-green-light",
        textColor: "text-white",
      },
      {
        title: "Secure payments",
        desc: "Industry-standard safety measures secure funds raised and your payouts",
        bgClass: "bg-brand-green-light",
        textColor: "text-white",
      },
    ],
  },
  Christmas: {
    mainHeading: "Turn Holiday Cheer into Real Impact",
    mainDescription: "Your generosity this Christmas can light up lives. Support campaigns promising to bring warmth, care, and hope to communities in dire need.",
    carouselSlides: [
      {
        heading: "Turn Holiday Cheer into Real Impact",
        description:
          "Your generosity this Christmas can light up lives. Support campaigns promising to bring warmth, care, and hope to communities in dire need.",
      },
      {
        heading: "Season of Giving, Season of Change",
        description:
          "Make the holiday meaningful by contributing toward causes that bring smiles, support families, and create lasting joy.",
      },
    ],
    images: [
      "/images/christmas-donation-1.jpg",
      "/images/christmas-donation-2.jpg",
      "/images/secure.png",
    ],
    features: [
      {
        title: "Raise Funds, Support Dreams this Season.",
        desc: "Share the spirit of Christmas by supporting causes that matter. Every donation brings joy and hope to those in need during this festive season",
        bgClass: "bg-brand-green-dark",
        textColor: "text-white",
      },
      {
        title: "Spread Joy Through Giving",
        desc: "This Christmas, let's come together to make a difference. Your generous donations help create lasting impact and spread the true meaning of the season",
        bgClass: "bg-brand-green-light",
        textColor: "text-white",
      },
      {
        title: "Secure payments",
        desc: "Industry-standard safety measures secure funds raised and your payouts",
        bgClass: "bg-brand-green-light",
        textColor: "text-white",
      },
    ],
  },
  Valentine: {
    mainHeading: "Love That Makes a Difference",
    mainDescription: "The best way to celebrate the spirit of love is by uplifting someone else. Your gesture of support can make a huge impact in someone’s life.",
    carouselSlides: [
      {
        heading: "Love That Makes a Difference",
        description:
          "The best way to celebrate the spirit of love is by uplifting someone else. Your gesture of support can make a huge impact in someone’s life.",
      },
      {
        heading: "Turn Love into Impact",
        description:
          "This Valentine’s Day, let your love transcend words. Show your support for people, communities, and dreams that need care.",
      },
    ],
    images: [
      "/images/valentines-donation-1.jpg",
      "/images/valentines-donation-2.jpg",
      "/images/secure.png",
    ],
    features: [
      {
        title: "Share Love, Support Causes",
        desc: "This Valentine's Day, show your love by supporting meaningful causes. Every donation is an act of love that creates lasting impact",
        bgClass: "bg-brand-green-dark",
        textColor: "text-white",
      },
      {
        title: "Love in Action",
        desc: "Spread love and compassion through giving. Your generous donations help turn love into tangible support for those who need it most",
        bgClass: "bg-brand-green-light",
        textColor: "text-white",
      },
      {
        title: "Secure payments",
        desc: "Industry-standard safety measures secure funds raised and your payouts",
        bgClass: "bg-brand-green-light",
        textColor: "text-white",
      },
    ],
  },
  Eid: {
    mainHeading: "The Eid Joy Multiplies when Shared",
    mainDescription: "The spirit of Eid can be multiplied by contributing to such campaigns that are aimed at providing care, education.",
    carouselSlides: [
      {
        heading: "The Eid Joy Multiplies when Shared",
        description:
          "The spirit of Eid can be multiplied by contributing to such campaigns that are aimed at providing care, education.",
      },
      {
        heading: "From Gratitude to Generosity This Eid",
        description:
          "The spirit of Eid should thus be honored by giving back to the communities that need the most assistance.",
      },
    ],
    images: [
      "/images/eid-donation-1.jpg",
      "/images/eid-donation-2.jpg",
      "/images/secure.png",
    ],
    features: [
      {
        title: "Eid Mubarak | Give with Generosity",
        desc: "Celebrate Eid by sharing your blessings with others. Your donations bring joy and support to communities during this blessed time",
        bgClass: "bg-brand-green-dark",
        textColor: "text-white",
      },
      {
        title: "Blessings Through Giving",
        desc: "This Eid, let's come together in the spirit of generosity. Your contributions help spread happiness and support those in need",
        bgClass: "bg-brand-green-light",
        textColor: "text-white",
      },
      {
        title: "Secure payments",
        desc: "Industry-standard safety measures secure funds raised and your payouts",
        bgClass: "bg-brand-green-light",
        textColor: "text-white",
      },
    ],
  },
  Easter: {
    mainHeading: "Easter Giving That Creates Change",
    mainDescription:
      "Make Easter meaningful by supporting projects that help create growth, compassion, and lasting impact.",
    carouselSlides: [
      {
        heading: "Easter Giving That Creates Change",
        description:
          "Make Easter meaningful by supporting projects that help create growth, compassion, and lasting impact.",
      },
      {
        heading: "Spread Hope This Easter Season",
        description:
          "Celebrate Easter by helping others rise toward brighter futures with impactful campaigns.",
      },
    ],
    images: ["/images/easter-1.jpg", "/images/easter-2.jpg", "/images/currencies.png"],
    features: [
      {
        title: "Give with compassion",
        desc: "Support campaigns that provide care and essentials to communities in need.",
        bgClass: "bg-brand-green-dark",
        textColor: "text-white",
      },
      {
        title: "Plant seeds of hope",
        desc: "Help fund projects that build brighter futures through education and opportunity.",
        bgClass: "bg-brand-green-light",
        textColor: "text-white",
      },
      {
        title: "Secure payments",
        desc: "Industry-standard safety measures secure funds raised and your payouts",
        bgClass: "bg-brand-green-light",
        textColor: "text-white",
      },
    ],
  },
  Ramadan: {
    mainHeading: "Amplify Your Impact This Ramadan",
    mainDescription: "Ramadan stands to inspire compassion and reflection. Support campaigns that ease hardship and uplift life during the blessed month.",
    carouselSlides: [
      {
        heading: "Amplify Your Impact This Ramadan",
        description:
          "Ramadan stands to inspire compassion and reflection. Support campaigns that ease hardship and uplift life during the blessed month.",
      },
      {
        heading: "Compassion That Lasts Beyond Ramadan",
        description:
          "Your generosity today can create long-term change. Support meaningful causes while earning spiritual rewards.",
      },
    ],
    images: [
      "/images/ramadan-donation-1.jpg",
      "/images/ramadan-donation-2.jpg",
      "/images/secure.png",
    ],
    features: [
      {
        title: "Ramadan Kareem | Give with Sincerity",
        desc: "This holy month, embrace the spirit of giving and compassion. Your donations during Ramadan carry multiplied blessings and support communities in need",
        bgClass: "bg-brand-green-dark",
        textColor: "text-white",
      },
      {
        title: "Charity in the Holy Month",
        desc: "Ramadan is a time of reflection and generosity. Your contributions help spread kindness and provide essential support to those who need it most",
        bgClass: "bg-brand-green-light",
        textColor: "text-white",
      },
      {
        title: "Secure payments",
        desc: "Industry-standard safety measures secure funds raised and your payouts",
        bgClass: "bg-brand-green-light",
        textColor: "text-white",
      },
    ],
  },
  NewYear: {
    mainHeading: "New Year, New Opportunities to Give Back",
    mainDescription: "Start the year strong by supporting ideas and initiatives that empower people and build better futures.",
    carouselSlides: [
      {
        heading: "New Year, New Opportunities to Give Back",
        description:
          "Start the year strong by supporting ideas and initiatives that empower people and build better futures.",
      },
      {
        heading: "Begin the Year with Purpose",
        description:
          "In your first giving of the year, make it matter. Invest in initiatives that ignite change, that inspire progress.",
      },
    ],
    images: [
      "/images/christmas-donation-1.jpg",
      "/images/christmas-donation-2.jpg",
      "/images/secure.png",
    ],
    features: [
      {
        title: "New Year, New Beginnings",
        desc: "Start the new year with purpose and compassion. Your donations help create positive change and support meaningful causes as we begin this new chapter together",
        bgClass: "bg-brand-green-dark",
        textColor: "text-white",
      },
      {
        title: "Make a Resolution to Give",
        desc: "This new year, resolve to make a difference. Your generous contributions help turn resolutions into real impact for communities and causes in need",
        bgClass: "bg-brand-green-light",
        textColor: "text-white",
      },
      {
        title: "Secure payments",
        desc: "Industry-standard safety measures secure funds raised and your payouts",
        bgClass: "bg-brand-green-light",
        textColor: "text-white",
      },
    ],
  },
  Thanksgiving: {
    mainHeading: "Share the Spirit of Thanksgiving",
    mainDescription: "Celebrate abundance by helping others to thrive. Every bit counts to make a society robust and full of empathy.",
    carouselSlides: [
      {
        heading: "Share the Spirit of Thanksgiving",
        description:
          "Celebrate abundance by helping others to thrive. Every bit counts to make a society robust and full of empathy.",
      },
      {
        heading: "Thankful for What We Have, Giving to Those Who Need",
        description:
          "This Thanksgiving, turn gratitude into generosity by supporting impactful community projects.",
      },
    ],
    images: [
      "/images/christmas-donation-1.jpg",
      "/images/christmas-donation-2.jpg",
      "/images/secure.png",
    ],
    features: [
      {
        title: "Give Thanks by Giving Back",
        desc: "This Thanksgiving, express your gratitude by supporting meaningful causes. Every donation is a way to give thanks and create lasting positive impact",
        bgClass: "bg-brand-green-dark",
        textColor: "text-white",
      },
      {
        title: "Gratitude in Action",
        desc: "Show your appreciation by helping others. Your generous donations during this season of thanks help support communities and causes that need it most",
        bgClass: "bg-brand-green-light",
        textColor: "text-white",
      },
      {
        title: "Secure payments",
        desc: "Industry-standard safety measures secure funds raised and your payouts",
        bgClass: "bg-brand-green-light",
        textColor: "text-white",
      },
    ],
  },
};

// Export both display-friendly keys (e.g. "Christmas") and normalized keys used by
// `getCurrentTheme()` / env override (e.g. "christmas") so lookups never break.
export const themes: Record<string, ThemeConfig> = {
  ...themeConfigs,
  christmas: themeConfigs.Christmas,
  valentines: themeConfigs.Valentine,
  eid: themeConfigs.Eid,
  easter: themeConfigs.Easter,
  ramadan: themeConfigs.Ramadan,
  newyear: themeConfigs.NewYear,
  thanksgiving: themeConfigs.Thanksgiving,
};

export type ThemeKey = keyof typeof themes;

