// Liste des pays africains et de l'espace Schengen
export interface Country {
  code: string;
  name: string;
  phoneCode: string;
}

export const countries: Country[] = [
  // Pays africains
  { code: 'DZ', name: 'Algérie', phoneCode: '+213' },
  { code: 'AO', name: 'Angola', phoneCode: '+244' },
  { code: 'BJ', name: 'Bénin', phoneCode: '+229' },
  { code: 'BW', name: 'Botswana', phoneCode: '+267' },
  { code: 'BF', name: 'Burkina Faso', phoneCode: '+226' },
  { code: 'BI', name: 'Burundi', phoneCode: '+257' },
  { code: 'CM', name: 'Cameroun', phoneCode: '+237' },
  { code: 'CV', name: 'Cap-Vert', phoneCode: '+238' },
  { code: 'CF', name: 'République centrafricaine', phoneCode: '+236' },
  { code: 'TD', name: 'Tchad', phoneCode: '+235' },
  { code: 'KM', name: 'Comores', phoneCode: '+269' },
  { code: 'CG', name: 'République du Congo', phoneCode: '+242' },
  { code: 'CD', name: 'République démocratique du Congo', phoneCode: '+243' },
  { code: 'CI', name: 'Côte d\'Ivoire', phoneCode: '+225' },
  { code: 'DJ', name: 'Djibouti', phoneCode: '+253' },
  { code: 'EG', name: 'Égypte', phoneCode: '+20' },
  { code: 'GQ', name: 'Guinée équatoriale', phoneCode: '+240' },
  { code: 'ER', name: 'Érythrée', phoneCode: '+291' },
  { code: 'ET', name: 'Éthiopie', phoneCode: '+251' },
  { code: 'GA', name: 'Gabon', phoneCode: '+241' },
  { code: 'GM', name: 'Gambie', phoneCode: '+220' },
  { code: 'GH', name: 'Ghana', phoneCode: '+233' },
  { code: 'GN', name: 'Guinée', phoneCode: '+224' },
  { code: 'GW', name: 'Guinée-Bissau', phoneCode: '+245' },
  { code: 'KE', name: 'Kenya', phoneCode: '+254' },
  { code: 'LS', name: 'Lesotho', phoneCode: '+266' },
  { code: 'LR', name: 'Libéria', phoneCode: '+231' },
  { code: 'LY', name: 'Libye', phoneCode: '+218' },
  { code: 'MG', name: 'Madagascar', phoneCode: '+261' },
  { code: 'MW', name: 'Malawi', phoneCode: '+265' },
  { code: 'ML', name: 'Mali', phoneCode: '+223' },
  { code: 'MR', name: 'Mauritanie', phoneCode: '+222' },
  { code: 'MU', name: 'Maurice', phoneCode: '+230' },
  { code: 'MA', name: 'Maroc', phoneCode: '+212' },
  { code: 'MZ', name: 'Mozambique', phoneCode: '+258' },
  { code: 'NA', name: 'Namibie', phoneCode: '+264' },
  { code: 'NE', name: 'Niger', phoneCode: '+227' },
  { code: 'NG', name: 'Nigeria', phoneCode: '+234' },
  { code: 'RW', name: 'Rwanda', phoneCode: '+250' },
  { code: 'ST', name: 'Sao Tomé-et-Principe', phoneCode: '+239' },
  { code: 'SN', name: 'Sénégal', phoneCode: '+221' },
  { code: 'SC', name: 'Seychelles', phoneCode: '+248' },
  { code: 'SL', name: 'Sierra Leone', phoneCode: '+232' },
  { code: 'SO', name: 'Somalie', phoneCode: '+252' },
  { code: 'ZA', name: 'Afrique du Sud', phoneCode: '+27' },
  { code: 'SS', name: 'Soudan du Sud', phoneCode: '+211' },
  { code: 'SD', name: 'Soudan', phoneCode: '+249' },
  { code: 'SZ', name: 'Eswatini', phoneCode: '+268' },
  { code: 'TZ', name: 'Tanzanie', phoneCode: '+255' },
  { code: 'TG', name: 'Togo', phoneCode: '+228' },
  { code: 'TN', name: 'Tunisie', phoneCode: '+216' },
  { code: 'UG', name: 'Ouganda', phoneCode: '+256' },
  { code: 'ZM', name: 'Zambie', phoneCode: '+260' },
  { code: 'ZW', name: 'Zimbabwe', phoneCode: '+263' },
  // Pays de l'espace Schengen
  { code: 'AT', name: 'Autriche', phoneCode: '+43' },
  { code: 'BE', name: 'Belgique', phoneCode: '+32' },
  { code: 'CZ', name: 'République tchèque', phoneCode: '+420' },
  { code: 'DK', name: 'Danemark', phoneCode: '+45' },
  { code: 'EE', name: 'Estonie', phoneCode: '+372' },
  { code: 'FI', name: 'Finlande', phoneCode: '+358' },
  { code: 'FR', name: 'France', phoneCode: '+33' },
  { code: 'DE', name: 'Allemagne', phoneCode: '+49' },
  { code: 'GR', name: 'Grèce', phoneCode: '+30' },
  { code: 'HU', name: 'Hongrie', phoneCode: '+36' },
  { code: 'IS', name: 'Islande', phoneCode: '+354' },
  { code: 'IT', name: 'Italie', phoneCode: '+39' },
  { code: 'LV', name: 'Lettonie', phoneCode: '+371' },
  { code: 'LI', name: 'Liechtenstein', phoneCode: '+423' },
  { code: 'LT', name: 'Lituanie', phoneCode: '+370' },
  { code: 'LU', name: 'Luxembourg', phoneCode: '+352' },
  { code: 'MT', name: 'Malte', phoneCode: '+356' },
  { code: 'NL', name: 'Pays-Bas', phoneCode: '+31' },
  { code: 'NO', name: 'Norvège', phoneCode: '+47' },
  { code: 'PL', name: 'Pologne', phoneCode: '+48' },
  { code: 'PT', name: 'Portugal', phoneCode: '+351' },
  { code: 'SK', name: 'Slovaquie', phoneCode: '+421' },
  { code: 'SI', name: 'Slovénie', phoneCode: '+386' },
  { code: 'ES', name: 'Espagne', phoneCode: '+34' },
  { code: 'SE', name: 'Suède', phoneCode: '+46' },
  { code: 'CH', name: 'Suisse', phoneCode: '+41' }
].sort((a, b) => a.name.localeCompare(b.name, 'fr'));

// Fonction utilitaire pour trouver un pays par code
export const findCountryByCode = (code: string): Country | undefined => {
  return countries.find(country => country.code === code);
};

// Fonction utilitaire pour trouver un pays par nom
export const findCountryByName = (name: string): Country | undefined => {
  return countries.find(country => country.name === name);
}; 