export type ZoneConfig = {
	center: [number, number]; // [lat, lon]
	zoom: number;
};

// prettier-ignore
const africaTsMap = new Map<string, ZoneConfig>([
  ["Africa/Abidjan",                    { center: [7.54,   -5.55],  zoom: 6 }], // CI
  ["Africa/Accra",                      { center: [7.95,  -1.03],   zoom: 6 }], // GH
  ["Africa/Addis_Ababa",                { center: [9.15,  40.49],   zoom: 6 }], // ET
  ["Africa/Algiers",                    { center: [28.03,  1.66],   zoom: 5 }], // DZ
  ["Africa/Asmara",                     { center: [15.18, 39.78],   zoom: 6 }], // ER
  ["Africa/Bamako",                     { center: [17.57, -3.99],   zoom: 5 }], // ML
  ["Africa/Bangui",                     { center: [6.61,  20.94],   zoom: 6 }], // CF
  ["Africa/Banjul",                     { center: [13.45, -15.38],  zoom: 7 }], // GM
  ["Africa/Bissau",                     { center: [12.06, -14.89],  zoom: 7 }], // GW
  ["Africa/Blantyre",                   { center: [-13.25, 34.30],  zoom: 7 }], // MW
  ["Africa/Brazzaville",                { center: [-0.23, 15.28],   zoom: 6 }], // CG
  ["Africa/Bujumbura",                  { center: [-3.37, 29.92],   zoom: 8 }], // BI
  ["Africa/Cairo",                      { center: [26.82, 30.80],   zoom: 5 }], // EG
  ["Africa/Casablanca",                 { center: [31.79, -7.09],   zoom: 6 }], // MA
  ["Africa/Ceuta",                      { center: [35.89, -5.31],   zoom: 10 }], // spanische Exklave
  ["Africa/Conakry",                    { center: [10.44, -10.94],  zoom: 6 }], // GN
  ["Africa/Dakar",                      { center: [14.50, -14.45],  zoom: 6 }], // SN
  ["Africa/Dar_es_Salaam",              { center: [-6.37, 34.89],   zoom: 5 }], // TZ
  ["Africa/Djibouti",                   { center: [11.83, 42.59],   zoom: 8 }], // DJ
  ["Africa/Douala",                     { center: [5.65, 12.77],    zoom: 6 }], // CM
  ["Africa/El_Aaiun",                   { center: [24.22, -13.77],  zoom: 6 }], // Westsahara
  ["Africa/Freetown",                   { center: [8.46, -11.78],   zoom: 7 }], // SL
  ["Africa/Gaborone",                   { center: [-22.33, 24.68],  zoom: 6 }], // BW
  ["Africa/Harare",                     { center: [-19.02, 29.15],  zoom: 6 }], // ZW
  ["Africa/Johannesburg",               { center: [-30.56, 22.94],  zoom: 5 }], // ZA
  ["Africa/Juba",                       { center: [7.31, 30.47],    zoom: 6 }], // SS
  ["Africa/Kampala",                    { center: [1.37, 32.30],    zoom: 7 }], // UG
  ["Africa/Khartoum",                   { center: [16.34, 30.22],   zoom: 5 }], // SD
  ["Africa/Kigali",                     { center: [-1.94, 29.88],   zoom: 8 }], // RW
  ["Africa/Kinshasa",                   { center: [-2.88, 23.66],   zoom: 4 }], // CD West
  ["Africa/Lagos",                      { center: [9.08, 8.68],     zoom: 5 }], // NG
  ["Africa/Libreville",                 { center: [-0.80, 11.60],   zoom: 6 }], // GA
  ["Africa/Lome",                       { center: [8.62, 0.82],     zoom: 7 }], // TG
  ["Africa/Luanda",                     { center: [-11.20, 17.87],  zoom: 5 }], // AO
  ["Africa/Lubumbashi",                 { center: [-8.71, 25.24],   zoom: 5 }], // CD Ost
  ["Africa/Lusaka",                     { center: [-13.13, 27.85],  zoom: 6 }], // ZM
  ["Africa/Malabo",                     { center: [1.65, 10.27],    zoom: 8 }], // GQ
  ["Africa/Maputo",                     { center: [-18.66, 35.53],  zoom: 5 }], // MZ
  ["Africa/Maseru",                     { center: [-29.61, 28.23],  zoom: 8 }], // LS
  ["Africa/Mbabane",                    { center: [-26.52, 31.47],  zoom: 8 }], // SZ
  ["Africa/Mogadishu",                  { center: [5.15, 46.20],    zoom: 5 }], // SO
  ["Africa/Monrovia",                   { center: [6.43, -9.43],    zoom: 7 }], // LR
  ["Africa/Nairobi",                    { center: [0.18, 37.86],    zoom: 5 }], // KE
  ["Africa/Ndjamena",                   { center: [15.45, 18.73],   zoom: 5 }], // TD
  ["Africa/Niamey",                     { center: [17.61, 8.08],    zoom: 5 }], // NE
  ["Africa/Nouakchott",                 { center: [20.26, -10.35],  zoom: 5 }], // MR
  ["Africa/Ouagadougou",                { center: [12.24, -1.56],   zoom: 6 }], // BF
  ["Africa/Porto-Novo",                 { center: [9.31, 2.32],     zoom: 7 }], // BJ
  ["Africa/Sao_Tome",                   { center: [0.19, 6.61],     zoom: 9 }], // ST
  ["Africa/Tripoli",                    { center: [27.23, 18.01],   zoom: 5 }], // LY
  ["Africa/Tunis",                      { center: [33.89, 9.56],    zoom: 6 }], // TN
  ["Africa/Windhoek",                   { center: [-22.56, 17.06],  zoom: 5 }], // NA
]);

// prettier-ignore
const americaTsMap = new Map<string, ZoneConfig>([
  // Aleutian / Alaska
  ["America/Adak",                      { center: [51.8833, -176.6333], zoom: 6 }], // Adak, Aleutian Islands, US
  ["America/Anchorage",                 { center: [61.2181, -149.9003], zoom: 6 }], // Anchorage, Alaska, US
  ["America/Juneau",                    { center: [58.3019, -134.4197], zoom: 7 }], // Juneau, Alaska, US
  ["America/Nome",                      { center: [64.5011, -165.4064], zoom: 6 }], // Nome, Alaska, US
  ["America/Sitka",                     { center: [57.0531, -135.3300], zoom: 7 }], // Sitka, Alaska, US
  ["America/Yakutat",                   { center: [59.5469, -139.7272], zoom: 6 }], // Yakutat, Alaska, US
  ["America/Metlakatla",                { center: [55.1310, -131.5784], zoom: 8 }], // Metlakatla, Alaska, US   
  // Caribbean / Antilles
  ["America/Anguilla",                  { center: [18.2140, -63.0578], zoom: 10 }], // Anguilla
  ["America/Antigua",                   { center: [17.1274, -61.8468], zoom: 10 }], // Antigua and Barbuda
  ["America/Aruba",                     { center: [12.5211, -69.9683], zoom: 10 }], // Aruba
  ["America/Barbados",                  { center: [13.0975, -59.6167], zoom: 10 }], // Barbados
  ["America/Cayman",                    { center: [19.3133, -81.2546], zoom: 9 }], // Cayman Islands
  ["America/Curacao",                   { center: [12.1696, -68.9900], zoom: 10 }], // Curaçao
  ["America/Dominica",                  { center: [15.3092, -61.3790], zoom: 10 }], // Dominica
  ["America/Grenada",                   { center: [12.0561, -61.7488], zoom: 10 }], // Grenada
  ["America/Guadeloupe",                { center: [16.2650, -61.5510], zoom: 9 }], // Guadeloupe
  ["America/Martinique",                { center: [14.6415, -61.0242], zoom: 9 }], // Martinique
  ["America/Marigot",                   { center: [18.0703, -63.0844], zoom: 11 }], // Marigot, Saint Martin (FR)
  ["America/Lower_Princes",             { center: [18.0425, -63.0548], zoom: 11 }], // Lower Prince’s Quarter, Sint Maarten
  ["America/Kralendijk",                { center: [12.1440, -68.2655], zoom: 11 }], // Kralendijk, Bonaire
  ["America/Puerto_Rico",               { center: [18.2208, -66.5901], zoom: 8 }], // Puerto Rico
  ["America/Santo_Domingo",             { center: [18.4861, -69.9312], zoom: 9 }], // Dominican Republic
  ["America/St_Barthelemy",             { center: [17.8962, -62.8498], zoom: 11 }], // Saint Barthélemy
  ["America/St_Kitts",                  { center: [17.3026, -62.7177], zoom: 10 }], // Saint Kitts and Nevis
  ["America/St_Lucia",                  { center: [13.9094, -60.9789], zoom: 10 }], // Saint Lucia
  ["America/St_Thomas",                 { center: [18.3381, -64.8941], zoom: 10 }], // St. Thomas, USVI
  ["America/St_Vincent",                { center: [13.1550, -61.2270], zoom: 10 }], // Saint Vincent and the Grenadines
  ["America/Tortola",                   { center: [18.4286, -64.6185], zoom: 11 }], // Tortola, BVI
  ["America/Port_of_Spain",             { center: [10.6667, -61.5167], zoom: 10 }], // Trinidad and Tobago
  ["America/Jamaica",                   { center: [18.1096, -77.2975], zoom: 8 }], // Jamaica
  ["America/Grand_Turk",                { center: [21.4664, -71.1389], zoom: 10 }], // Grand Turk, Turks and Caicos
  // Central America
  ["America/Belize",                    { center: [17.5046, -88.1962], zoom: 8 }], // Belize
  ["America/Costa_Rica",                { center: [9.7489, -83.7534], zoom: 7 }], // Costa Rica
  ["America/El_Salvador",               { center: [13.6929, -89.2182], zoom: 8 }], // San Salvador, El Salvador
  ["America/Guatemala",                 { center: [14.6349, -90.5069], zoom: 8 }], // Guatemala City
  ["America/Managua",                   { center: [12.1364, -86.2514], zoom: 9 }], // Managua, Nicaragua
  ["America/Tegucigalpa",               { center: [14.0723, -87.1921], zoom: 8 }], // Tegucigalpa, Honduras
  ["America/Panama",                    { center: [8.9824, -79.5199], zoom: 8 }], // Panama City
  // Mexico
  ["America/Tijuana",                   { center: [32.5149, -117.0382], zoom: 8 }], // Tijuana, BC, MX
  ["America/Los_Angeles",               { center: [34.0522, -118.2437], zoom: 7 }], // Los Angeles, US
  ["America/Mexico_City",               { center: [19.4326, -99.1332], zoom: 7 }], // Mexico City
  ["America/Mazatlan",                  { center: [23.2494, -106.4111], zoom: 7 }], // Mazatlán, Sinaloa
  ["America/Chihuahua",                 { center: [28.6320, -106.0691], zoom: 7 }], // Chihuahua, MX
  ["America/Ciudad_Juarez",             { center: [31.6904, -106.4245], zoom: 8 }], // Ciudad Juárez, MX
  ["America/Ojinaga",                   { center: [29.5641, -104.4160], zoom: 7 }], // Ojinaga, Chihuahua
  ["America/Hermosillo",                { center: [29.0729, -110.9559], zoom: 7 }], // Hermosillo, Sonora
  ["America/Bahia_Banderas",            { center: [20.8000, -105.2500], zoom: 8 }], // Bahía de Banderas area (Puerto Vallarta region)
  ["America/Cancun",                    { center: [21.1619, -86.8515], zoom: 8 }], // Cancún, Quintana Roo
  ["America/Matamoros",                 { center: [25.8690, -97.5027], zoom: 8 }], // Matamoros, Tamaulipas
  ["America/Merida",                    { center: [20.9674, -89.5926], zoom: 8 }], // Mérida, Yucatán
  ["America/Monterrey",                 { center: [25.6866, -100.3161], zoom: 7 }], // Monterrey, Nuevo León
  // US / Canada mainland (selection matching zones)
  ["America/Chicago",                   { center: [41.8781, -87.6298], zoom: 5 }], // Chicago, US
  ["America/Detroit",                   { center: [42.3314, -83.0458], zoom: 6 }], // Detroit, US
  ["America/Indiana/Indianapolis",      { center: [39.7684, -86.1581], zoom: 7 }], // Indianapolis, IN, US
  ["America/Indiana/Knox",              { center: [41.2956, -86.6250], zoom: 8 }], // Knox, IN, US
  ["America/Indiana/Marengo",           { center: [38.3698, -86.3439], zoom: 8 }], // Marengo, IN, US
  ["America/Indiana/Petersburg",        { center: [38.4914, -87.2786], zoom: 8 }], // Petersburg, IN, US
  ["America/Indiana/Tell_City",         { center: [37.9514, -86.7611], zoom: 8 }], // Tell City, IN, US
  ["America/Indiana/Vevay",             { center: [38.7470, -85.0677], zoom: 9 }], // Vevay, IN, US
  ["America/Indiana/Vincennes",         { center: [38.6773, -87.5286], zoom: 8 }], // Vincennes, IN, US
  ["America/Indiana/Winamac",           { center: [41.0514, -86.6036], zoom: 8 }], // Winamac, IN, US
  ["America/Kentucky/Louisville",       { center: [38.2527, -85.7585], zoom: 7 }], // Louisville, KY, US
  ["America/Kentucky/Monticello",       { center: [36.8298, -84.8491], zoom: 8 }], // Monticello, KY, US
  ["America/New_York",                  { center: [40.7128, -74.0060], zoom: 5 }], // New York City, US
  ["America/Denver",                    { center: [39.7392, -104.9903], zoom: 6 }], // Denver, US
  ["America/Phoenix",                   { center: [33.4484, -112.0740], zoom: 7 }], // Phoenix, US
  ["America/Boise",                     { center: [43.6150, -116.2023], zoom: 7 }], // Boise, US
  ["America/Swift_Current",             { center: [50.2881, -107.7939], zoom: 7 }], // Swift Current, SK, CA
  ["America/Regina",                    { center: [50.4452, -104.6189], zoom: 7 }], // Regina, SK, CA
  ["America/Winnipeg",                  { center: [49.8951, -97.1384], zoom: 6 }], // Winnipeg, MB, CA
  ["America/Toronto",                   { center: [43.6532, -79.3832], zoom: 6 }], // Toronto, ON, CA
  ["America/Vancouver",                 { center: [49.2827, -123.1207], zoom: 6 }], // Vancouver, BC, CA
  ["America/Edmonton",                  { center: [53.5461, -113.4938], zoom: 6 }], // Edmonton, AB, CA
  ["America/Whitehorse",                { center: [60.7212, -135.0568], zoom: 6 }], // Whitehorse, YT, CA
  ["America/Dawson",                    { center: [64.0600, -139.4330], zoom: 6 }], // Dawson City, YT, CA
  ["America/Dawson_Creek",              { center: [55.7590, -120.2350], zoom: 7 }], // Dawson Creek, BC, CA
  ["America/Fort_Nelson",               { center: [58.8053, -122.7002], zoom: 6 }], // Fort Nelson, BC, CA
  ["America/Creston",                   { center: [49.0953, -116.5135], zoom: 8 }], // Creston, BC, CA
  ["America/Rankin_Inlet",              { center: [62.8110, -92.0853], zoom: 5 }], // Rankin Inlet, NU, CA
  ["America/Resolute",                  { center: [74.6973, -94.8290], zoom: 4 }], // Resolute, NU, CA
  ["America/Atikokan",                  { center: [48.7560, -91.6240], zoom: 7 }], // Atikokan, ON, CA
  ["America/Cambridge_Bay",             { center: [69.1171, -105.0590], zoom: 5 }], // Cambridge Bay, NU, CA
  ["America/Inuvik",                    { center: [68.3600, -133.7300], zoom: 5 }], // Inuvik, NT, CA
  ["America/Iqaluit",                   { center: [63.7467, -68.5170], zoom: 6 }], // Iqaluit, NU, CA
  ["America/Glace_Bay",                 { center: [46.1969, -59.9569], zoom: 8 }], // Glace Bay, NS, CA
  ["America/Moncton",                   { center: [46.0878, -64.7782], zoom: 8 }], // Moncton, NB, CA
  ["America/Halifax",                   { center: [44.6488, -63.5752], zoom: 8 }], // Halifax, NS, CA
  ["America/Blanc-Sablon",              { center: [51.4254, -57.1526], zoom: 7 }], // Blanc-Sablon, QC, CA
  ["America/Goose_Bay",                 { center: [53.3017, -60.3267], zoom: 6 }], // Happy Valley-Goose Bay, NL, CA
  ["America/St_Johns",                  { center: [47.5615, -52.7126], zoom: 8 }], // St. John’s, NL, CA    
  // Greenland
  ["America/Nuuk",                      { center: [64.1767, -51.7361], zoom: 5 }], // Nuuk, Greenland
  ["America/Danmarkshavn",              { center: [76.7695, -18.6690], zoom: 5 }], // Danmarkshavn, Greenland
  ["America/Scoresbysund",              { center: [70.4853, -21.9667], zoom: 5 }], // Ittoqqortoormiit / Scoresbysund
  ["America/Thule",                     { center: [76.5312, -68.7032], zoom: 5 }], // Thule / Pituffik, Greenland
  // South America
  ["America/Asuncion",                  { center: [-25.2637, -57.5759], zoom: 7 }], // Asunción, Paraguay
  ["America/La_Paz",                    { center: [-16.4897, -68.1193], zoom: 7 }], // La Paz, Bolivia
  ["America/Lima",                      { center: [-12.0464, -77.0428], zoom: 7 }], // Lima, Peru
  ["America/Bogota",                    { center: [4.7110, -74.0721], zoom: 7 }], // Bogotá, Colombia
  ["America/Guayaquil",                 { center: [-2.1700, -79.9224], zoom: 8 }], // Guayaquil, Ecuador
  ["America/Guyana",                    { center: [6.8013, -58.1551], zoom: 7 }], // Georgetown, Guyana
  ["America/Paramaribo",                { center: [5.8520, -55.2038], zoom: 8 }], // Paramaribo, Suriname
  ["America/Cayenne",                   { center: [4.9224, -52.3135], zoom: 8 }], // Cayenne, French Guiana
  ["America/Caracas",                   { center: [10.4806, -66.9036], zoom: 8 }], // Caracas, Venezuela
  ["America/Santiago",                  { center: [-33.4489, -70.6693], zoom: 7 }], // Santiago, Chile
  ["America/Punta_Arenas",              { center: [-53.1638, -70.9171], zoom: 7 }], // Punta Arenas, Chile
  ["America/Coyhaique",                 { center: [-45.5712, -72.0683], zoom: 7 }], // Coyhaique, Chile
  ["America/Montevideo",                { center: [-34.9011, -56.1645], zoom: 7 }], // Montevideo, Uruguay
  ["America/Sao_Paulo",                 { center: [-23.5505, -46.6333], zoom: 6 }], // São Paulo, Brazil
  ["America/Rio_Branco",                { center: [-9.9747, -67.8099], zoom: 7 }], // Rio Branco, Brazil
  ["America/Eirunepe",                  { center: [-6.6561, -69.8739], zoom: 7 }], // Eirunepé, Brazil
  ["America/Porto_Velho",               { center: [-8.7608, -63.8999], zoom: 7 }], // Porto Velho, Brazil
  ["America/Manaus",                    { center: [-3.1190, -60.0217], zoom: 7 }], // Manaus, Brazil
  ["America/Boa_Vista",                 { center: [2.8197, -60.6714], zoom: 7 }], // Boa Vista, Brazil
  ["America/Belem",                     { center: [-1.4558, -48.4902], zoom: 7 }], // Belém, Brazil
  ["America/Santarem",                  { center: [-2.4385, -54.6996], zoom: 7 }], // Santarém, Brazil
  ["America/Campo_Grande",              { center: [-20.4697, -54.6201], zoom: 7 }], // Campo Grande, Brazil
  ["America/Cuiaba",                    { center: [-15.6010, -56.0974], zoom: 7 }], // Cuiabá, Brazil
  ["America/Bahia",                     { center: [-12.9714, -38.5014], zoom: 7 }], // Salvador, Bahia, Brazil
  ["America/Maceio",                    { center: [-9.6498, -35.7089], zoom: 8 }], // Maceió, Brazil
  ["America/Recife",                    { center: [-8.0476, -34.8770], zoom: 8 }], // Recife, Brazil
  ["America/Noronha",                   { center: [-3.8550, -32.4233], zoom: 9 }], // Fernando de Noronha, Brazil
  ["America/Araguaina",                 { center: [-7.1928, -48.2047], zoom: 8 }], // Araguaína, Brazil
  // Argentina zones
  ["America/Argentina/Buenos_Aires",    { center: [-34.6037, -58.3816], zoom: 6 }], // Buenos Aires
  ["America/Argentina/Catamarca",       { center: [-28.4686, -65.7795], zoom: 7 }], // Catamarca
  ["America/Argentina/Cordoba",         { center: [-31.4201, -64.1888], zoom: 7 }], // Córdoba
  ["America/Argentina/Jujuy",           { center: [-24.1858, -65.2995], zoom: 7 }], // San Salvador de Jujuy
  ["America/Argentina/La_Rioja",        { center: [-29.4131, -66.8558], zoom: 7 }], // La Rioja
  ["America/Argentina/Mendoza",         { center: [-32.8895, -68.8458], zoom: 7 }], // Mendoza
  ["America/Argentina/Rio_Gallegos",    { center: [-51.6230, -69.2168], zoom: 7 }], // Río Gallegos
  ["America/Argentina/Salta",           { center: [-24.7821, -65.4232], zoom: 7 }], // Salta
  ["America/Argentina/San_Juan",        { center: [-31.5375, -68.5364], zoom: 7 }], // San Juan
  ["America/Argentina/San_Luis",        { center: [-33.3017, -66.3378], zoom: 7 }], // San Luis
  ["America/Argentina/Tucuman",         { center: [-26.8083, -65.2176], zoom: 7 }], // San Miguel de Tucumán
  ["America/Argentina/Ushuaia",         { center: [-54.8019, -68.3030], zoom: 7 }], // Ushuaia
  // Other Americas small territories
  ["America/Montserrat",                { center: [16.7425, -62.1874], zoom: 10 }], // Montserrat
  ["America/Nassau",                    { center: [25.0443, -77.3504], zoom: 9 }], // Nassau, Bahamas
  ["America/Guayaquil",                 { center: [-2.1700, -79.9224], zoom: 8 }], // (duplicate kept for tz list completeness)
  ["America/Port-au-Prince",            { center: [18.5944, -72.3074], zoom: 9 }], // Haiti
  // Remaining zones
  ["America/Bahia_Banderas",            { center: [20.8000, -105.2500], zoom: 8 }], // already above, repeated for clarity
  ["America/Scoresbysund",              { center: [70.4853, -21.9667], zoom: 5 }], // already above, repeated for clarity
]);

// prettier-ignore
const arcticTsMap = new Map<string, ZoneConfig>([
  // Antarctica
  ["Antarctica/Casey",                  { center: [-66.2833, 110.5333],  zoom: 5 }], // Casey Station (AU) [web:28]
  ["Antarctica/Davis",                  { center: [-68.5766,  77.9674],  zoom: 5 }], // Davis Station (AU) [web:28]
  ["Antarctica/DumontDUrville",         { center: [-66.6633, 140.0017],  zoom: 5 }], // Dumont d’Urville (FR) [web:30]
  ["Antarctica/Macquarie",              { center: [-54.5000, 158.9500],  zoom: 6 }], // Macquarie Island (AU) [web:34]
  ["Antarctica/Mawson",                 { center: [-67.6027,  62.8738],  zoom: 5 }], // Mawson Station (AU) [web:28]
  ["Antarctica/McMurdo",                { center: [-77.8419, 166.6863],  zoom: 4 }], // McMurdo Station (US) [web:30]
  ["Antarctica/Palmer",                 { center: [-64.7730, -64.0530],  zoom: 6 }], // Palmer Station (US) [web:40]
  ["Antarctica/Rothera",                { center: [-67.5681, -68.1236],  zoom: 6 }], // Rothera Research Station (UK) [web:30]
  ["Antarctica/Syowa",                  { center: [-69.0061,  39.5903],  zoom: 5 }], // Syowa Station (JP) [web:30]
  ["Antarctica/Troll",                  { center: [-72.0110,   2.5350],  zoom: 5 }], // Troll Station (NO) [web:29]
  ["Antarctica/Vostok",                 { center: [-78.4667, 106.8667],  zoom: 4 }], // Vostok Station (RU) [web:28]
  // Arctic
  ["Arctic/Longyearbyen",               { center: [78.2232,  15.6469],   zoom: 6 }], // Longyearbyen, Svalbard [web:31]
]);

// prettier-ignore
const asiaTsMap = new Map<string, ZoneConfig>([
  ["Asia/Aden",                         { center: [15.3694, 44.1910], zoom: 7 }], // Yemen
  ["Asia/Almaty",                       { center: [43.2220, 76.8512], zoom: 7 }], // Kazakhstan
  ["Asia/Amman",                        { center: [31.9566, 35.9457], zoom: 8 }], // Jordan
  ["Asia/Anadyr",                       { center: [64.7337, 177.5089], zoom: 6 }], // Russia
  ["Asia/Aqtau",                        { center: [43.6411, 51.1985], zoom: 7 }], // Kazakhstan
  ["Asia/Aqtobe",                       { center: [50.2839, 57.1660], zoom: 6 }], // Kazakhstan
  ["Asia/Ashgabat",                     { center: [37.9601, 58.3261], zoom: 7 }], // Turkmenistan
  ["Asia/Atyrau",                       { center: [47.0945, 51.9238], zoom: 6 }], // Kazakhstan
  ["Asia/Baghdad",                      { center: [33.3152, 44.3661], zoom: 7 }], // Iraq
  ["Asia/Bahrain",                      { center: [26.0667, 50.5577], zoom: 10 }], // Bahrain
  ["Asia/Baku",                         { center: [40.4093, 49.8671], zoom: 8 }], // Azerbaijan
  ["Asia/Bangkok",                      { center: [13.7563, 100.5018], zoom: 7 }], // Thailand
  ["Asia/Barnaul",                      { center: [53.3481, 83.7798], zoom: 6 }], // Russia
  ["Asia/Beirut",                       { center: [33.8938, 35.5018], zoom: 9 }], // Lebanon
  ["Asia/Bishkek",                      { center: [42.8746, 74.5698], zoom: 7 }], // Kyrgyzstan
  ["Asia/Brunei",                       { center: [4.9031, 114.9398], zoom: 9 }], // Brunei
  ["Asia/Chita",                        { center: [52.0520, 113.4712], zoom: 6 }], // Russia
  ["Asia/Colombo",                      { center: [6.9271, 79.8612], zoom: 8 }], // Sri Lanka
  ["Asia/Damascus",                     { center: [33.5138, 36.2765], zoom: 8 }], // Syria
  ["Asia/Dhaka",                        { center: [23.8103, 90.4125], zoom: 7 }], // Bangladesh
  ["Asia/Dili",                         { center: [-8.5569, 125.5603], zoom: 9 }], // Timor-Leste
  ["Asia/Dubai",                        { center: [25.2048, 55.2708], zoom: 8 }], // UAE
  ["Asia/Dushanbe",                     { center: [38.5598, 68.7870], zoom: 8 }], // Tajikistan
  ["Asia/Famagusta",                    { center: [35.1167, 33.9500], zoom: 10 }], // Cyprus (north-east)
  ["Asia/Gaza",                         { center: [31.5204, 34.4534], zoom: 10 }], // Gaza Strip
  ["Asia/Hebron",                       { center: [31.5326, 35.0998], zoom: 11 }], // West Bank
  ["Asia/Ho_Chi_Minh",                  { center: [10.8231, 106.6297], zoom: 8 }], // Vietnam
  ["Asia/Hong_Kong",                    { center: [22.3193, 114.1694], zoom: 9 }], // Hong Kong SAR
  ["Asia/Hovd",                         { center: [48.0056, 91.6419], zoom: 6 }], // Mongolia (west)
  ["Asia/Irkutsk",                      { center: [52.2850, 104.2890], zoom: 6 }], // Russia
  ["Asia/Jakarta",                      { center: [-6.2088, 106.8456], zoom: 7 }], // Indonesia (Java)
  ["Asia/Jayapura",                     { center: [-2.5916, 140.6690], zoom: 6 }], // Indonesia (Papua)
  ["Asia/Jerusalem",                    { center: [31.7683, 35.2137], zoom: 9 }], // Israel
  ["Asia/Kabul",                        { center: [34.5553, 69.2075], zoom: 7 }], // Afghanistan
  ["Asia/Kamchatka",                    { center: [53.0452, 158.6483], zoom: 5 }], // Russia
  ["Asia/Karachi",                      { center: [24.8607, 67.0011], zoom: 7 }], // Pakistan
  ["Asia/Kathmandu",                    { center: [27.7172, 85.3240], zoom: 8 }], // Nepal
  ["Asia/Khandyga",                     { center: [62.6564, 135.5539], zoom: 5 }], // Russia
  ["Asia/Kolkata",                      { center: [22.5726, 88.3639], zoom: 6 }], // India
  ["Asia/Krasnoyarsk",                  { center: [56.0153, 92.8932], zoom: 5 }], // Russia
  ["Asia/Kuala_Lumpur",                 { center: [3.1390, 101.6869], zoom: 8 }], // Malaysia (peninsula)
  ["Asia/Kuching",                      { center: [1.5533, 110.3592], zoom: 7 }], // Malaysia (Borneo)
  ["Asia/Kuwait",                       { center: [29.3759, 47.9774], zoom: 9 }], // Kuwait
  ["Asia/Macau",                        { center: [22.1987, 113.5439], zoom: 11 }], // Macao SAR
  ["Asia/Magadan",                      { center: [59.5610, 150.8300], zoom: 5 }], // Russia
  ["Asia/Makassar",                     { center: [-5.1477, 119.4327], zoom: 6 }], // Indonesia (Sulawesi)
  ["Asia/Manila",                       { center: [14.5995, 120.9842], zoom: 6 }], // Philippines
  ["Asia/Muscat",                       { center: [23.5880, 58.3829], zoom: 7 }], // Oman
  ["Asia/Nicosia",                      { center: [35.1856, 33.3823], zoom: 9 }], // Cyprus
  ["Asia/Novokuznetsk",                 { center: [53.7576, 87.1361], zoom: 6 }], // Russia
  ["Asia/Novosibirsk",                  { center: [55.0084, 82.9357], zoom: 5 }], // Russia
  ["Asia/Omsk",                         { center: [54.9885, 73.3242], zoom: 6 }], // Russia
  ["Asia/Oral",                         { center: [51.2333, 51.3667], zoom: 7 }], // Kazakhstan
  ["Asia/Phnom_Penh",                   { center: [11.5564, 104.9282], zoom: 8 }], // Cambodia
  ["Asia/Pontianak",                    { center: [-0.0263, 109.3425], zoom: 7 }], // Indonesia (Borneo)
  ["Asia/Pyongyang",                    { center: [39.0392, 125.7625], zoom: 8 }], // North Korea
  ["Asia/Qatar",                        { center: [25.2854, 51.5310], zoom: 9 }], // Qatar
  ["Asia/Qostanay",                     { center: [53.2198, 63.6354], zoom: 6 }], // Kazakhstan
  ["Asia/Qyzylorda",                    { center: [44.8488, 65.4823], zoom: 6 }], // Kazakhstan
  ["Asia/Riyadh",                       { center: [24.7136, 46.6753], zoom: 6 }], // Saudi Arabia
  ["Asia/Sakhalin",                     { center: [49.7210, 143.4480], zoom: 5 }], // Russia (Sakhalin Island)
  ["Asia/Samarkand",                    { center: [39.6270, 66.9749], zoom: 8 }], // Uzbekistan
  ["Asia/Seoul",                        { center: [37.5665, 126.9780], zoom: 8 }], // South Korea
  ["Asia/Shanghai",                     { center: [31.2304, 121.4737], zoom: 6 }], // China
  ["Asia/Singapore",                    { center: [1.3521, 103.8198], zoom: 10 }], // Singapore
  ["Asia/Srednekolymsk",                { center: [67.4500, 153.6833], zoom: 5 }], // Russia
  ["Asia/Taipei",                       { center: [25.0330, 121.5654], zoom: 9 }], // Taiwan
  ["Asia/Tashkent",                     { center: [41.2995, 69.2401], zoom: 7 }], // Uzbekistan
  ["Asia/Tbilisi",                      { center: [41.7151, 44.8271], zoom: 8 }], // Georgia
  ["Asia/Tehran",                       { center: [35.6892, 51.3890], zoom: 6 }], // Iran
  ["Asia/Thimphu",                      { center: [27.4712, 89.6339], zoom: 9 }], // Bhutan
  ["Asia/Tokyo",                        { center: [35.6762, 139.6503], zoom: 7 }], // Japan
  ["Asia/Tomsk",                        { center: [56.4846, 84.9476], zoom: 6 }], // Russia
  ["Asia/Ulaanbaatar",                  { center: [47.8864, 106.9057], zoom: 6 }], // Mongolia
  ["Asia/Urumqi",                       { center: [43.8256, 87.6168], zoom: 6 }], // China (Xinjiang)
  ["Asia/Ust-Nera",                     { center: [64.5667, 143.2000], zoom: 5 }], // Russia
  ["Asia/Vientiane",                    { center: [17.9757, 102.6331], zoom: 8 }], // Laos
  ["Asia/Vladivostok",                  { center: [43.1155, 131.8855], zoom: 6 }], // Russia
  ["Asia/Yakutsk",                      { center: [62.0355, 129.6755], zoom: 5 }], // Russia
  ["Asia/Yangon",                       { center: [16.8409, 96.1735], zoom: 7 }], // Myanmar
  ["Asia/Yekaterinburg",                { center: [56.8389, 60.6057], zoom: 6 }], // Russia
  ["Asia/Yerevan",                      { center: [40.1792, 44.4991], zoom: 8 }], // Armenia
]);

// prettier-ignore
const atlanticTsMap = new Map<string, ZoneConfig>([
  ["Atlantic/Azores",                   { center: [37.7412, 25.6756], zoom: 6 }], // Azores, PT
  ["Atlantic/Bermuda",                  { center: [32.3078, -64.7505], zoom: 8 }], // Bermuda
  ["Atlantic/Canary",                   { center: [28.2916, -16.6291], zoom: 7 }], // Canary Islands, ES
  ["Atlantic/Cape_Verde",               { center: [16.5388, -23.0418], zoom: 6 }], // Cabo Verde
  ["Atlantic/Faroe",                    { center: [62.0079, -6.7900], zoom: 7 }], // Faroe Islands
  ["Atlantic/Madeira",                  { center: [32.7607, -16.9595], zoom: 7 }], // Madeira, PT
  ["Atlantic/Reykjavik",                { center: [64.1466, -21.9426], zoom: 8 }], // Iceland
  ["Atlantic/South_Georgia",            { center: [-54.2833, -36.5000],zoom: 6 }], // South Georgia
  ["Atlantic/St_Helena",                { center: [-15.9650, -5.7089], zoom: 7 }], // Saint Helena
  ["Atlantic/Stanley",                  { center: [-51.7006, -57.8510],zoom: 7 }], // Falkland Islands
]);

// prettier-ignore
const australiaTsMap = new Map<string, ZoneConfig>([
  ["Australia/Adelaide",                { center: [-34.9285, 138.6007], zoom: 8 }], // Adelaide
  ["Australia/Brisbane",                { center: [-27.4698, 153.0251], zoom: 7 }], // Brisbane
  ["Australia/Broken_Hill",             { center: [-31.9550, 141.4594], zoom: 7 }], // Broken Hill, NSW
  ["Australia/Darwin",                  { center: [-12.4634, 130.8456], zoom: 7 }], // Darwin
  ["Australia/Eucla",                   { center: [-31.6760, 128.8890], zoom: 7 }], // Eucla, WA
  ["Australia/Hobart",                  { center: [-42.8821, 147.3272], zoom: 8 }], // Hobart
  ["Australia/Lindeman",                { center: [-20.4490, 149.0300], zoom: 9 }], // Lindeman Island, QLD
  ["Australia/Lord_Howe",               { center: [-31.5388, 159.0773], zoom: 9 }], // Lord Howe Island
  ["Australia/Melbourne",               { center: [-37.8136, 144.9631], zoom: 8 }], // Melbourne
  ["Australia/Perth",                   { center: [-31.9523, 115.8613], zoom: 7 }], // Perth
  ["Australia/Sydney",                  { center: [-33.8688, 151.2093], zoom: 8 }], // Sydney
]);

// prettier-ignore
const europeTsMap = new Map<string, ZoneConfig>([
  ["Europe/Amsterdam",                  { center: [52.1326,   5.2913],  zoom: 7 }], // NL
  ["Europe/Andorra",                    { center: [42.5462,   1.6016],  zoom: 9 }], // AD
  ["Europe/Astrakhan",                  { center: [47.2220,  47.6064],  zoom: 7 }], // RU Astrakhan Oblast
  ["Europe/Athens",                     { center: [39.0742,  21.8243],  zoom: 6 }], // GR
  ["Europe/Belgrade",                   { center: [44.0165,  21.0059],  zoom: 7 }], // RS
  ["Europe/Berlin",                     { center: [51.1657,  10.4515],  zoom: 6 }], // DE
  ["Europe/Bratislava",                 { center: [48.6690,  19.6990],  zoom: 7 }], // SK
  ["Europe/Brussels",                   { center: [50.5039,   4.4699],  zoom: 7 }], // BE
  ["Europe/Bucharest",                  { center: [45.9432,  24.9668],  zoom: 6 }], // RO
  ["Europe/Budapest",                   { center: [47.1625,  19.5033],  zoom: 7 }], // HU
  ["Europe/Busingen",                   { center: [47.6973,   8.6900],  zoom: 11 }], // DE-Enclave near CH
  ["Europe/Chisinau",                   { center: [47.4116,  28.3699],  zoom: 8 }], // MD
  ["Europe/Copenhagen",                 { center: [56.2639,   9.5018],  zoom: 6 }], // DK
  ["Europe/Dublin",                     { center: [53.1424,  -7.6921],  zoom: 6 }], // IE
  ["Europe/Gibraltar",                  { center: [36.1408,  -5.3536],  zoom: 11 }], // GI
  ["Europe/Guernsey",                   { center: [49.4587,  -2.5895],  zoom: 11 }], // GG
  ["Europe/Helsinki",                   { center: [61.9241,  25.7482],  zoom: 5 }], // FI
  ["Europe/Isle_of_Man",                { center: [54.2361,  -4.5481],  zoom: 9 }], // IM
  ["Europe/Istanbul",                   { center: [39.9208,  32.8541],  zoom: 5 }], // TR (Ankara as center)
  ["Europe/Jersey",                     { center: [49.2138,  -2.1358],  zoom: 11 }], // JE
  ["Europe/Kaliningrad",                { center: [54.7104,  20.4522],  zoom: 8 }], // RU-Kaliningrad
  ["Europe/Kirov",                      { center: [58.6035,  49.6679],  zoom: 6 }], // RU Kirov Oblast
  ["Europe/Kyiv",                       { center: [49.0000,  32.0000],  zoom: 5 }], // UA
  ["Europe/Lisbon",                     { center: [39.3999,  -8.2245],  zoom: 6 }], // PT
  ["Europe/Ljubljana",                  { center: [46.1512,  14.9955],  zoom: 8 }], // SI
  ["Europe/London",                     { center: [54.0000,  -2.0000],  zoom: 5 }], // GB (Island center)
  ["Europe/Luxembourg",                 { center: [49.8153,   6.1296],  zoom: 10 }], // LU
  ["Europe/Madrid",                     { center: [40.4637,  -3.7492],  zoom: 6 }], // ES (Mainland)
  ["Europe/Malta",                      { center: [35.9375,  14.3754],  zoom: 10 }], // MT
  ["Europe/Mariehamn",                  { center: [60.1785,  19.9156],  zoom: 10 }], // Åland
  ["Europe/Minsk",                      { center: [53.7098,  27.9534],  zoom: 6 }], // BY
  ["Europe/Monaco",                     { center: [43.7384,   7.4246],  zoom: 12 }], // MC
  ["Europe/Moscow",                     { center: [55.7558,  37.6173],  zoom: 5 }], // RU MSK-Gebiet
  ["Europe/Oslo",                       { center: [60.4720,   8.4689],  zoom: 4 }], // NO
  ["Europe/Paris",                      { center: [46.2276,   2.2137],  zoom: 6 }], // FR
  ["Europe/Podgorica",                  { center: [42.7087,  19.3744],  zoom: 8 }], // ME
  ["Europe/Prague",                     { center: [49.8175,  15.4730],  zoom: 7 }], // CZ
  ["Europe/Riga",                       { center: [56.8796,  24.6032],  zoom: 7 }], // LV
  ["Europe/Rome",                       { center: [41.8719,  12.5674],  zoom: 6 }], // IT
  ["Europe/Samara",                     { center: [53.2038,  50.1606],  zoom: 6 }], // RU Samara Oblast
  ["Europe/San_Marino",                 { center: [43.9424,  12.4578],  zoom: 12 }], // SM
  ["Europe/Sarajevo",                   { center: [43.9159,  17.6791],  zoom: 8 }], // BA
  ["Europe/Saratov",                    { center: [51.5331,  46.0342],  zoom: 6 }], // RU Saratov Oblast
  ["Europe/Simferopol",                 { center: [44.9521,  34.1024],  zoom: 8 }], // Krim
  ["Europe/Skopje",                     { center: [41.6086,  21.7453],  zoom: 8 }], // MK
  ["Europe/Sofia",                      { center: [42.7339,  25.4858],  zoom: 7 }], // BG
  ["Europe/Stockholm",                  { center: [60.1282,  18.6435],  zoom: 4 }], // SE
  ["Europe/Tallinn",                    { center: [58.5953,  25.0136],  zoom: 6 }], // EE
  ["Europe/Tirane",                     { center: [41.1533,  20.1683],  zoom: 8 }], // AL
  ["Europe/Ulyanovsk",                  { center: [54.3142,  48.4031],  zoom: 6 }], // RU Ulyanovsk Oblast
  ["Europe/Vaduz",                      { center: [47.1660,   9.5554],  zoom: 11 }], // LI
  ["Europe/Vatican",                    { center: [41.9029,  12.4534],  zoom: 13 }], // VA
  ["Europe/Vienna",                     { center: [47.5162,  14.5501],  zoom: 7 }], // AT
  ["Europe/Vilnius",                    { center: [55.1694,  23.8813],  zoom: 6 }], // LT
  ["Europe/Volgograd",                  { center: [48.7080,  44.5133],  zoom: 6 }], // RU Volgograd Oblast
  ["Europe/Warsaw",                     { center: [51.9194,  19.1451],  zoom: 6 }], // PL
  ["Europe/Zagreb",                     { center: [45.1000,  16.0000],  zoom: 7 }], // HR
  ["Europe/Zurich",                     { center: [46.8182,   8.2275],  zoom: 7 }], // CH
]);

// prettier-ignore
const indianOceanTsMap = new Map<string, ZoneConfig>([
  ["Indian/Antananarivo",               { center: [-18.8792,  47.5079],  zoom: 6 }], // Antananarivo, Madagascar [web:32]
  ["Indian/Chagos",                     { center: [-7.3349,   72.4244],  zoom: 6 }], // Diego Garcia, Chagos Archipelago [web:38]
  ["Indian/Christmas",                  { center: [-10.4475, 105.6904],  zoom: 7 }], // Flying Fish Cove, Christmas Island [web:32]
  ["Indian/Cocos",                      { center: [-12.1880,  96.8290],  zoom: 7 }], // West Island, Cocos (Keeling) Islands [web:32]
  ["Indian/Comoro",                     { center: [-11.7022,  43.2551],  zoom: 7 }], // Moroni, Comoros [web:32]
  ["Indian/Kerguelen",                  { center: [-49.3510,  70.2190],  zoom: 6 }], // Port-aux-Français, Kerguelen [web:32]
  ["Indian/Mahe",                       { center: [-4.6796,   55.4919],  zoom: 8 }], // Victoria, Mahé, Seychelles [web:32]
  ["Indian/Maldives",                   { center: [ 4.1755,   73.5093],  zoom: 7 }], // Malé, Maldives [web:32]
  ["Indian/Mauritius",                  { center: [-20.1609,  57.5012],  zoom: 8 }], // Port Louis, Mauritius [web:32]
  ["Indian/Mayotte",                    { center: [-12.7806,  45.2279],  zoom: 9 }], // Mamoudzou, Mayotte [web:41]
  ["Indian/Reunion",                    { center: [-20.8789,  55.4481],  zoom: 8 }], // Saint-Denis, Réunion [web:41]
]);

// prettier-ignore
const pacificTsMap = new Map<string, ZoneConfig>([
  ["Pacific/Apia",                      { center: [-13.8333, -171.7667], zoom: 8 }], // Apia, Samoa [web:36]
  ["Pacific/Auckland",                  { center: [-36.8485,  174.7633], zoom: 7 }], // Auckland, New Zealand [web:36]
  ["Pacific/Bougainville",              { center: [-6.2150,  155.5660],  zoom: 7 }], // Buka/Bougainville, PNG (approx) [web:33]
  ["Pacific/Chatham",                   { center: [-43.9550, -176.5590], zoom: 7 }], // Waitangi, Chatham Islands (approx) [web:33]
  ["Pacific/Chuuk",                     { center: [ 7.4510,  151.8460],  zoom: 8 }], // Weno, Chuuk, Micronesia (approx) [web:33]
  ["Pacific/Easter",                    { center: [-27.1250, -109.3490], zoom: 7 }], // Hanga Roa, Easter Island [web:33]
  ["Pacific/Efate",                     { center: [-17.7333, 168.3167],  zoom: 8 }], // Port Vila, Vanuatu (on Efate) [web:36]
  ["Pacific/Fakaofo",                   { center: [-9.3650,  -171.2150], zoom: 10 }], // Fakaofo, Tokelau (approx) [web:33]
  ["Pacific/Fiji",                      { center: [-18.1400, 178.4400],  zoom: 7 }], // Suva, Fiji [web:36]
  ["Pacific/Funafuti",                  { center: [-8.5200,  179.1900],  zoom: 9 }], // Funafuti, Tuvalu [web:36]
  ["Pacific/Galapagos",                 { center: [-0.7390,  -90.3518],  zoom: 6 }], // Puerto Ayora / San Cristóbal area (approx) [web:33]
  ["Pacific/Gambier",                   { center: [-23.1200, -134.9700], zoom: 7 }], // Rikitea, Gambier Islands (approx) [web:33]
  ["Pacific/Guadalcanal",               { center: [-9.4333,  159.9500],  zoom: 7 }], // Honiara, Solomon Islands [web:36]
  ["Pacific/Guam",                      { center: [13.4443,  144.7937],  zoom: 9 }], // Hagåtña, Guam [web:33]
  ["Pacific/Honolulu",                  { center: [21.3069, -157.8583],  zoom: 8 }], // Honolulu, Hawaii [web:36]
  ["Pacific/Kanton",                    { center: [-2.7700, -171.7200],  zoom: 9 }], // Kanton Island, Kiribati (approx) [web:33]
  ["Pacific/Kiritimati",                { center: [ 1.8721, -157.4278],  zoom: 8 }], // Kiritimati Island, Kiribati [web:33]
  ["Pacific/Kosrae",                    { center: [ 5.3167,  162.9833],  zoom: 9 }], // Tofol area, Kosrae (approx) [web:33]
  ["Pacific/Kwajalein",                 { center: [ 8.7207,  167.7310],  zoom: 9 }], // Kwajalein Atoll, Marshall Islands [web:36]
  ["Pacific/Majuro",                    { center: [ 7.0900,  171.3800],  zoom: 9 }], // Majuro, Marshall Islands [web:36]
  ["Pacific/Marquesas",                 { center: [-9.0000, -139.5000],  zoom: 7 }], // Taiohae, Nuku Hiva (approx) [web:33]
  ["Pacific/Midway",                    { center: [28.2000, -177.3500],  zoom: 7 }], // Midway Atoll (approx) [web:33]
  ["Pacific/Nauru",                     { center: [-0.5500,  166.9300],  zoom: 9 }], // Yaren District, Nauru [web:36]
  ["Pacific/Niue",                      { center: [-19.0554, -169.9177], zoom: 9 }], // Alofi, Niue [web:33]
  ["Pacific/Norfolk",                   { center: [-29.0408, 167.9547],  zoom: 8 }], // Kingston, Norfolk Island [web:33]
  ["Pacific/Noumea",                    { center: [-22.2758, 166.4580],  zoom: 8 }], // Nouméa, New Caledonia [web:33]
  ["Pacific/Pago_Pago",                 { center: [-14.2756, -170.7020], zoom: 9 }], // Pago Pago, American Samoa [web:33]
  ["Pacific/Palau",                     { center: [ 7.5000,  134.6200],  zoom: 8 }], // Melekeok / Ngerulmud area, Palau [web:36]
  ["Pacific/Pitcairn",                  { center: [-25.0660, -130.1000], zoom: 7 }], // Adamstown, Pitcairn Islands (approx) [web:33]
  ["Pacific/Pohnpei",                   { center: [ 6.9200,  158.1600],  zoom: 8 }], // Palikir / Kolonia, Pohnpei [web:36]
  ["Pacific/Port_Moresby",              { center: [-9.4438,  147.1803],  zoom: 7 }], // Port Moresby, PNG [web:36]
  ["Pacific/Rarotonga",                 { center: [-21.2129, -159.7823], zoom: 9 }], // Avarua, Rarotonga, Cook Islands [web:33]
  ["Pacific/Saipan",                    { center: [15.1778,  145.7500],  zoom: 9 }], // Saipan, Northern Mariana Islands [web:33]
  ["Pacific/Tahiti",                    { center: [-17.5516, -149.5585], zoom: 8 }], // Papeete, Tahiti [web:33]
  ["Pacific/Tarawa",                    { center: [ 1.3300,  172.9800],  zoom: 9 }], // South Tarawa, Kiribati [web:36]
  ["Pacific/Tongatapu",                 { center: [-21.1400, -175.2000], zoom: 7 }], // Nukuʻalofa, Tonga [web:36]
  ["Pacific/Wake",                      { center: [19.2900,  166.6170],  zoom: 8 }], // Wake Island (approx) [web:33]
  ["Pacific/Wallis",                    { center: [-13.3000, -176.2000], zoom: 8 }], // Mata-Utu, Wallis Island (approx) [web:33]
]);

// list timezones in browser:
// const timeZones = Intl.supportedValuesOf('timeZone')
// dont count Etc/GMT* zones or UTC

export const timeZoneMap = new Map<string, ZoneConfig>([
	...africaTsMap,
	...americaTsMap,
	...arcticTsMap,
	...asiaTsMap,
	...atlanticTsMap,
	...australiaTsMap,
	...europeTsMap,
	...indianOceanTsMap,
	...pacificTsMap
]);
