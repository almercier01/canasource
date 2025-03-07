import { ProvinceCode } from '../types';

export const CANADIAN_CITIES: Record<ProvinceCode, string[]> = {
  AB: [
    'Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'Medicine Hat', 
    'Grande Prairie', 'Fort McMurray', 'Airdrie', 'Spruce Grove', 'St. Albert'
  ],
  BC: [
    'Vancouver', 'Victoria', 'Surrey', 'Burnaby', 'Richmond', 
    'Kelowna', 'Kamloops', 'Nanaimo', 'Prince George', 'New Westminster'
  ],
  MB: [
    'Winnipeg', 'Brandon', 'Thompson', 'Steinbach', 'Portage la Prairie',
    'Selkirk', 'Dauphin', 'Winkler', 'Morden', 'The Pas'
  ],
  NB: [
    'Saint John', 'Moncton', 'Fredericton', 'Dieppe', 'Miramichi',
    'Edmundston', 'Bathurst', 'Campbellton', 'Oromocto', 'Grand Falls'
  ],
  NL: [
    "St. John's", 'Mount Pearl', 'Corner Brook', 'Paradise', 'Grand Falls-Windsor',
    'Gander', 'Labrador City', 'Stephenville', 'Happy Valley-Goose Bay', 'Torbay'
  ],
  NS: [
    'Halifax', 'Dartmouth', 'Sydney', 'Truro', 'New Glasgow',
    'Glace Bay', 'Bridgewater', 'Kentville', 'Amherst', 'Yarmouth'
  ],
  ON: [
    'Toronto', 'Ottawa', 'Mississauga', 'Hamilton', 'London',
    'Brampton', 'Windsor', 'Kitchener', 'Markham', 'Vaughan'
  ],
  PE: [
    'Charlottetown', 'Summerside', 'Stratford', 'Cornwall', 'Montague',
    'Kensington', 'Souris', 'Alberton', 'Georgetown', 'Tignish'
  ],
  QC: [
    'Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil',
    'Sherbrooke', 'Saguenay', 'Levis', 'Trois-Rivieres', 'Terrebonne'
  ],
  SK: [
    'Saskatoon', 'Regina', 'Prince Albert', 'Moose Jaw', 'Swift Current',
    'Yorkton', 'North Battleford', 'Weyburn', 'Estevan', 'Warman'
  ],
  NT: [
    'Yellowknife', 'Hay River', 'Inuvik', 'Fort Smith', 'Behchoko',
    'Fort Simpson', 'Norman Wells', 'Fort Resolution', 'Fort Liard', 'Tuktoyaktuk'
  ],
  NU: [
    'Iqaluit', 'Rankin Inlet', 'Arviat', 'Baker Lake', 'Cambridge Bay',
    'Igloolik', 'Pond Inlet', 'Pangnirtung', 'Kugluktuk', 'Cape Dorset'
  ],
  YT: [
    'Whitehorse', 'Dawson City', 'Watson Lake', 'Haines Junction', 'Mayo',
    'Carmacks', 'Faro', 'Ross River', 'Teslin', 'Beaver Creek'
  ]
};
