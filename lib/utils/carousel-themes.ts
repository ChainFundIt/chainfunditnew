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
  images: string[];
  features: ThemeFeature[];
}

export const themes: Record<string, ThemeConfig> = {
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
  christmas: {
    mainHeading: "Spread Christmas Joy Through Giving",
    mainDescription: "This festive season, let's come together to support causes that matter. Every donation brings hope and joy to those in need",
    images: [
      "/images/christmas-donation-1.jpg",
      "/images/christmas-donation-2.jpg",
      "/images/secure.png",
    ],
    features: [
      {
        title: "Raise Funds | Support Dreams this Season.",
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
  valentines: {
    mainHeading: "Share Love, Support Causes",
    mainDescription: "This Valentine's Day, show your love by supporting meaningful causes. Every donation is an act of love that creates lasting impact",
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
  eid: {
    mainHeading: "Eid Mubarak | Give with Generosity",
    mainDescription: "Celebrate this blessed time by sharing your blessings with others. Your donations bring joy and support to communities during Eid",
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
  ramadan: {
    mainHeading: "Ramadan Kareem | Give with Sincerity",
    mainDescription: "During this blessed month of Ramadan, let's come together in charity and compassion. Your donations bring blessings and support to those in need",
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
  newyear: {
    mainHeading: "New Year, New Beginnings",
    mainDescription: "Start the new year by making a difference. Your donations help create positive change and support causes that matter as we begin this new chapter",
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
  thanksgiving: {
    mainHeading: "Give Thanks by Giving Back",
    mainDescription: "This Thanksgiving, express gratitude by supporting causes that matter. Every donation is a way to give thanks and make a meaningful difference",
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

export type ThemeKey = keyof typeof themes;

