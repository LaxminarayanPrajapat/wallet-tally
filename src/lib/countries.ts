export type Country = {
  name: string;
  code: string;
  currency: {
    name: string;
    symbol: string;
  };
};

export const countries: Country[] = [
  { name: 'United States', code: 'US', currency: { name: 'US Dollar', symbol: '$' } },
  { name: 'United Kingdom', code: 'GB', currency: { name: 'British Pound', symbol: '£' } },
  { name: 'India', code: 'IN', currency: { name: 'Indian Rupee', symbol: '₹' } },
  { name: 'Germany', code: 'DE', currency: { name: 'Euro', symbol: '€' } },
  { name: 'France', code: 'FR', currency: { name: 'Euro', symbol: '€' } },
  { name: 'Italy', code: 'IT', currency: { name: 'Euro', symbol: '€' } },
  { name: 'Spain', code: 'ES', currency: { name: 'Euro', symbol: '€' } },
  { name: 'Netherlands', code: 'NL', currency: { name: 'Euro', symbol: '€' } },
  { name: 'Japan', code: 'JP', currency: { name: 'Japanese Yen', symbol: '¥' } },
  { name: 'Canada', code: 'CA', currency: { name: 'Canadian Dollar', symbol: '$' } },
  { name: 'Australia', code: 'AU', currency: { name: 'Australian Dollar', symbol: '$' } },
  { name: 'New Zealand', code: 'NZ', currency: { name: 'New Zealand Dollar', symbol: '$' } },
  { name: 'Singapore', code: 'SG', currency: { name: 'Singapore Dollar', symbol: '$' } },
  { name: 'United Arab Emirates', code: 'AE', currency: { name: 'UAE Dirham', symbol: 'د.إ' } },
  { name: 'Saudi Arabia', code: 'SA', currency: { name: 'Saudi Riyal', symbol: 'SR' } },
  { name: 'South Africa', code: 'ZA', currency: { name: 'South African Rand', symbol: 'R' } },
  { name: 'Brazil', code: 'BR', currency: { name: 'Brazilian Real', symbol: 'R$' } },
  { name: 'Mexico', code: 'MX', currency: { name: 'Mexican Peso', symbol: '$' } },
  { name: 'Argentina', code: 'AR', currency: { name: 'Argentine Peso', symbol: '$' } },
  { name: 'Chile', code: 'CL', currency: { name: 'Chilean Peso', symbol: '$' } },
  { name: 'Colombia', code: 'CO', currency: { name: 'Colombian Peso', symbol: '$' } },
  { name: 'China', code: 'CN', currency: { name: 'Chinese Yuan', symbol: '¥' } },
  { name: 'South Korea', code: 'KR', currency: { name: 'South Korean Won', symbol: '₩' } },
  { name: 'Turkey', code: 'TR', currency: { name: 'Turkish Lira', symbol: '₺' } },
  { name: 'Russia', code: 'RU', currency: { name: 'Russian Ruble', symbol: '₽' } },
  { name: 'Switzerland', code: 'CH', currency: { name: 'Swiss Franc', symbol: 'CHF' } },
  { name: 'Sweden', code: 'SE', currency: { name: 'Swedish Krona', symbol: 'kr' } },
  { name: 'Norway', code: 'NO', currency: { name: 'Norwegian Krone', symbol: 'kr' } },
  { name: 'Thailand', code: 'TH', currency: { name: 'Thai Baht', symbol: '฿' } },
  { name: 'Malaysia', code: 'MY', currency: { name: 'Malaysian Ringgit', symbol: 'RM' } },
  { name: 'Indonesia', code: 'ID', currency: { name: 'Indonesian Rupiah', symbol: 'Rp' } },
  { name: 'Vietnam', code: 'VN', currency: { name: 'Vietnamese Dong', symbol: '₫' } },
  { name: 'Philippines', code: 'PH', currency: { name: 'Philippine Peso', symbol: '₱' } },
  { name: 'Israel', code: 'IL', currency: { name: 'Israeli New Shekel', symbol: '₪' } },
  { name: 'Pakistan', code: 'PK', currency: { name: 'Pakistani Rupee', symbol: '₨' } },
  { name: 'Bangladesh', code: 'BD', currency: { name: 'Bangladeshi Taka', symbol: '৳' } },
  { name: 'Egypt', code: 'EG', currency: { name: 'Egyptian Pound', symbol: 'E£' } },
  { name: 'Nigeria', code: 'NG', currency: { name: 'Nigerian Naira', symbol: '₦' } },
  { name: 'Kenya', code: 'KE', currency: { name: 'Kenyan Shilling', symbol: 'KSh' } },
];
