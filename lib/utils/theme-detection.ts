import { toHijri } from "hijri-converter";
import type { ThemeKey } from "./carousel-themes";

const getWesternEasterDate = (year: number): { month: number; day: number } => {
  // Gregorian computus (Meeus/Jones/Butcher)
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3=March, 4=April
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
};

/**
 * Get the current theme based on the date
 * Supports manual override via environment variable for testing
 * 
 * @param manualOverride - Optional manual theme override for testing
 * @returns The current theme key
 */
export const getCurrentTheme = (manualOverride?: ThemeKey): ThemeKey => {
  // Allow manual override (useful for testing or admin control)
  if (manualOverride) {
    return manualOverride;
  }

  // Check for environment variable override (useful for testing)
  const envOverride = process.env.NEXT_PUBLIC_CAROUSEL_THEME as ThemeKey | undefined;
  if (envOverride && envOverride !== "default") {
    return envOverride;
  }

  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const date = now.getDate(); // 1-31
  const year = now.getFullYear();

  // New Year: January 1-7
  if (month === 1 && date <= 7) {
    return "newyear";
  }

  // Valentine's Day: February 1-14
  if (month === 2 && date <= 14) {
    return "valentines";
  }

  // Islamic calendar dates: Use hijri-converter to get accurate dates
  // Convert once and check for Ramadan and Eid
  try {
    const hijriDate = toHijri(year, month, date);
    const hijriMonth = hijriDate.hm; // Hijri month (1-12)
    const hijriDay = hijriDate.hd; // Hijri day
    
    // Ramadan: 9th month of Islamic calendar (approximately March-April in Gregorian)
    // Show theme for the entire month of Ramadan
    if (hijriMonth === 9) {
      return "ramadan";
    }
    
    // Eid al-Fitr: 1st-3rd of Shawwal (10th month)
    if (hijriMonth === 10 && hijriDay <= 3) {
      return "eid";
    }
    
    // Eid al-Adha: 10th-13th of Dhu al-Hijjah (12th month)
    if (hijriMonth === 12 && hijriDay >= 10 && hijriDay <= 13) {
      return "eid";
    }
  } catch (error) {
    // Fallback if hijri conversion fails
    console.warn("Failed to convert to Hijri date:", error);
  }

  // Easter: +/- 7 days around Western Easter Sunday
  // (Placed after Hijri checks so Ramadan/Eid take precedence if they overlap.)
  const easter = getWesternEasterDate(year);
  const todayUtc = Date.UTC(year, month - 1, date);
  const easterUtc = Date.UTC(year, easter.month - 1, easter.day);
  const diffDays = Math.floor((todayUtc - easterUtc) / (1000 * 60 * 60 * 24));
  if (diffDays >= -7 && diffDays <= 7) {
    return "easter";
  }

  // Thanksgiving: 4th Thursday of November (US)
  // Calculate 4th Thursday
  if (month === 11) {
    const firstDay = new Date(year, 10, 1).getDay(); // Day of week for Nov 1 (0 = Sunday)
    const firstThursday = firstDay <= 4 ? 1 + (4 - firstDay) : 1 + (11 - firstDay);
    const fourthThursday = firstThursday + 21;
    
    // Show theme from 4th Thursday to end of November
    if (date >= fourthThursday) {
      return "thanksgiving";
    }
  }

  // Christmas: December 1-31
  if (month === 12) {
    return "christmas";
  }

  return "default";
};

/**
 * Get all available theme keys
 */
export const getAvailableThemes = (): ThemeKey[] => {
  return [
    "default",
    "christmas",
    "valentines",
    "eid",
    "easter",
    "ramadan",
    "newyear",
    "thanksgiving",
  ];
};

