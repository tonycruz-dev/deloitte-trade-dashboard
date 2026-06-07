const countryTranslationKeys = {
  China: "countries.china",
  India: "countries.india",
  Turkey: "countries.turkey",
  Germany: "countries.germany",
  "Saudi Arabia": "countries.saudiArabia",
  "United States": "countries.unitedStates",
  Brazil: "countries.brazil",
  "South Africa": "countries.southAfrica",
  Japan: "countries.japan",
  Australia: "countries.australia",
  France: "countries.france",
  "United Arab Emirates": "countries.unitedArabEmirates",
} as const;

export function getCountryTranslationKey(country: string) {
  return (
    countryTranslationKeys[country as keyof typeof countryTranslationKeys] ??
    country
  );
}
