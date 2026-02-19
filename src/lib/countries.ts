export type Country = {
  name: string;
  code: string;
  currency: {
    name: string;
    symbol: string;
  };
};

export const countries: Country[] = [
  { name: 'United States', code: 'US', currency: { name: 'US Dollar', symbol: '$ (USD)' } },
  { name: 'United Kingdom', code: 'GB', currency: { name: 'British Pound', symbol: '£ (GBP)' } },
  { name: 'India', code: 'IN', currency: { name: 'Indian Rupee', symbol: '₹ (INR)' } },
  { name: 'Germany', code: 'DE', currency: { name: 'Euro', symbol: '€ (EUR)' } },
  { name: 'France', code: 'FR', currency: { name: 'Euro', symbol: '€ (EUR)' } },
  { name: 'Italy', code: 'IT', currency: { name: 'Euro', symbol: '€ (EUR)' } },
  { name: 'Spain', code: 'ES', currency: { name: 'Euro', symbol: '€ (EUR)' } },
  { name: 'Netherlands', code: 'NL', currency: { name: 'Euro', symbol: '€ (EUR)' } },
  { name: 'Japan', code: 'JP', currency: { name: 'Japanese Yen', symbol: '¥ (JPY)' } },
  { name: 'Canada', code: 'CA', currency: { name: 'Canadian Dollar', symbol: '$ (CAD)' } },
  { name: 'Australia', code: 'AU', currency: { name: 'Australian Dollar', symbol: '$ (AUD)' } },
  { name: 'New Zealand', code: 'NZ', currency: { name: 'New Zealand Dollar', symbol: '$ (NZD)' } },
  { name: 'Singapore', code: 'SG', currency: { name: 'Singapore Dollar', symbol: '$ (SGD)' } },
  { name: 'United Arab Emirates', code: 'AE', currency: { name: 'UAE Dirham', symbol: 'د.إ (AED)' } },
  { name: 'Saudi Arabia', code: 'SA', currency: { name: 'Saudi Riyal', symbol: 'SR (SAR)' } },
  { name: 'South Africa', code: 'ZA', currency: { name: 'South African Rand', symbol: 'R (ZAR)' } },
  { name: 'Brazil', code: 'BR', currency: { name: 'Brazilian Real', symbol: 'R$ (BRL)' } },
  { name: 'Mexico', code: 'MX', currency: { name: 'Mexican Peso', symbol: '$ (MXN)' } },
  { name: 'Argentina', code: 'AR', currency: { name: 'Argentine Peso', symbol: '$ (ARS)' } },
  { name: 'Chile', code: 'CL', currency: { name: 'Chilean Peso', symbol: '$ (CLP)' } },
  { name: 'Colombia', code: 'CO', currency: { name: 'Colombian Peso', symbol: '$ (COP)' } },
  { name: 'China', code: 'CN', currency: { name: 'Chinese Yuan', symbol: '¥ (CNY)' } },
  { name: 'South Korea', code: 'KR', currency: { name: 'South Korean Won', symbol: '₩ (KRW)' } },
  { name: 'Turkey', code: 'TR', currency: { name: 'Turkish Lira', symbol: '₺ (TRY)' } },
  { name: 'Russia', code: 'RU', currency: { name: 'Russian Ruble', symbol: '₽ (RUB)' } },
  { name: 'Switzerland', code: 'CH', currency: { name: 'Swiss Franc', symbol: 'CHF' } },
  { name: 'Sweden', code: 'SE', currency: { name: 'Swedish Krona', symbol: 'kr (SEK)' } },
  { name: 'Norway', code: 'NO', currency: { name: 'Norwegian Krone', symbol: 'kr (NOK)' } },
  { name: 'Thailand', code: 'TH', currency: { name: 'Thai Baht', symbol: '฿ (THB)' } },
  { name: 'Malaysia', code: 'MY', currency: { name: 'Malaysian Ringgit', symbol: 'RM (MYR)' } },
  { name: 'Indonesia', code: 'ID', currency: { name: 'Indonesian Rupiah', symbol: 'Rp (IDR)' } },
  { name: 'Vietnam', code: 'VN', currency: { name: 'Vietnamese Dong', symbol: '₫ (VND)' } },
  { name: 'Philippines', code: 'PH', currency: { name: 'Philippine Peso', symbol: '₱ (PHP)' } },
  { name: 'Israel', code: 'IL', currency: { name: 'Israeli New Shekel', symbol: '₪ (ILS)' } },
  { name: 'Pakistan', code: 'PK', currency: { name: 'Pakistani Rupee', symbol: '₨ (PKR)' } },
  { name: 'Bangladesh', code: 'BD', currency: { name: 'Bangladeshi Taka', symbol: '৳ (BDT)' } },
  { name: 'Egypt', code: 'EG', currency: { name: 'Egyptian Pound', symbol: 'E£ (EGP)' } },
  { name: 'Nigeria', code: 'NG', currency: { name: 'Nigerian Naira', symbol: '₦ (NGN)' } },
  { name: 'Kenya', code: 'KE', currency: { name: 'Kenyan Shilling', symbol: 'KSh (KES)' } },
];
