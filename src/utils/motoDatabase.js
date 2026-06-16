/**
 * Database marche e modelli moto venduti in Italia.
 * Utilizzato per autocompletamento e selezione nei form.
 */

const MOTO_DATABASE = {
  'Aprilia': ['RS 125', 'RS 660', 'Tuono 660', 'RSV4', 'Tuono V4', 'SR 50', 'SR 125', 'SR 300', 'SX 125', 'SX 50', 'RX 125', 'Dorsoduro 750', 'Shiver 750', 'Pegaso 650', 'Scarabeo 125', 'Scarabeo 200', 'Scarabeo 300', 'Atlantic 300', 'Sportcity 125'],
  'Benelli': ['TRK 502', 'TRK 502 X', 'Leoncino 500', 'Leoncino 250', 'BN 125', 'BN 302', '502C', '752S', 'TNT 125', 'TNT 300', 'Imperiale 400'],
  'Beta': ['RR 50', 'RR 125', 'RR 250', 'RR 300', 'RR 350', 'RR 390', 'RR 430', 'RR 480', 'Alp 4.0', 'Urban 125', 'Urban 200'],
  'BMW': ['R 1250 GS', 'R 1250 GS Adventure', 'R 1250 RT', 'R 1250 RS', 'S 1000 RR', 'S 1000 XR', 'S 1000 R', 'F 900 R', 'F 900 XR', 'F 750 GS', 'F 850 GS', 'F 850 GS Adventure', 'R nineT', 'R 18', 'G 310 R', 'G 310 GS', 'C 400 X', 'C 400 GT', 'CE 04', 'K 1600 GTL'],
  'CF Moto': ['300 NK', '400 NK', '650 NK', '700 CL-X', '800 NK', 'MT 800', '300 SR', '450 SR'],
  'Ducati': ['Panigale V4', 'Panigale V4 S', 'Panigale V2', 'Streetfighter V4', 'Streetfighter V2', 'Monster', 'Monster Plus', 'Monster 821', 'Monster 1200', 'Multistrada V4', 'Multistrada V4 S', 'Multistrada 950', 'Hypermotard 950', 'Scrambler Icon', 'Scrambler Desert Sled', 'Scrambler Full Throttle', 'Scrambler Nightshift', 'Diavel V4', 'XDiavel', 'SuperSport 950'],
  'Fantic': ['Caballero 125', 'Caballero 250', 'Caballero 500', 'Rally 125', 'Rally 250', 'Issimo', 'XEF 125', 'XEF 250', 'XE 125', 'XMF 250'],
  'Gas Gas': ['EC 250', 'EC 300', 'MC 125', 'MC 250', 'MC 450', 'ES 700', 'SM 700'],
  'Harley-Davidson': ['Sportster S', 'Nightster', 'Street Bob 114', 'Fat Bob 114', 'Low Rider S', 'Low Rider ST', 'Road Glide', 'Street Glide', 'Road King', 'Heritage Classic', 'Breakout', 'Fat Boy', 'Softail Standard', 'Pan America 1250', 'LiveWire'],
  'Honda': ['CB 125 R', 'CB 300 R', 'CB 500 F', 'CB 500 X', 'CB 650 R', 'CB 750 Hornet', 'CBR 125 R', 'CBR 500 R', 'CBR 650 R', 'CBR 1000 RR-R', 'CRF 250 L', 'CRF 300 L', 'CRF 1100 L Africa Twin', 'NC 750 X', 'NT 1100', 'Forza 125', 'Forza 300', 'Forza 350', 'Forza 750', 'ADV 350', 'SH 125', 'SH 150', 'SH 300', 'SH 350', 'PCX 125', 'Vision 110', 'X-ADV 750', 'Rebel 500', 'Rebel 1100', 'Gold Wing'],
  'Husqvarna': ['Norden 901', 'Svartpilen 401', 'Svartpilen 125', 'Vitpilen 401', 'Vitpilen 125', 'FE 250', 'FE 350', 'FE 450', 'FE 501', 'TE 150', 'TE 250', 'TE 300', 'FC 250', 'FC 350', 'FC 450', '701 Supermoto', '701 Enduro'],
  'Indian': ['Scout', 'Scout Bobber', 'Chief', 'Super Chief', 'Springfield', 'Chieftain', 'Roadmaster', 'Challenger', 'FTR 1200', 'FTR Rally'],
  'Kawasaki': ['Z 125', 'Z 400', 'Z 650', 'Z 900', 'Z 900 RS', 'Z H2', 'Ninja 125', 'Ninja 400', 'Ninja 650', 'Ninja ZX-6R', 'Ninja ZX-10R', 'Ninja 1000 SX', 'Versys 650', 'Versys 1000', 'Vulcan S', 'KLX 125', 'KLX 300', 'KX 250', 'KX 450', 'W800', 'Eliminator 500', 'J125', 'J300'],
  'KTM': ['Duke 125', 'Duke 200', 'Duke 390', 'Duke 690', 'Duke 790', 'Duke 890', 'Duke 1290 Super Duke R', 'RC 125', 'RC 390', 'Adventure 390', 'Adventure 790', 'Adventure 890', 'Adventure 1290', '1290 Super Adventure S', 'EXC-F 250', 'EXC-F 350', 'EXC-F 450', 'EXC-F 500', 'SX-F 250', 'SX-F 350', 'SX-F 450', 'Freeride E-XC'],
  'Kymco': ['Agility 125', 'Agility 150', 'People S 125', 'People S 150', 'Downtown 300', 'Downtown 350', 'AK 550', 'Like 125', 'Like 150', 'X-Town 125', 'X-Town 300', 'DTX 125', 'DTX 360'],
  'Moto Guzzi': ['V7', 'V7 Stone', 'V7 Special', 'V85 TT', 'V85 TT Travel', 'V100 Mandello', 'V100 Mandello S', 'Stelvio'],
  'Moto Morini': ['X-Cape 650', 'Seiemmezzo STR', 'Seiemmezzo SCR', 'Calibro'],
  'MV Agusta': ['F3 675', 'F3 800', 'Brutale 675', 'Brutale 800', 'Brutale 1000', 'Dragster 800', 'Turismo Veloce 800', 'Superveloce', 'Rush 1000', 'Lucky Explorer 5.5', 'Lucky Explorer 9.5'],
  'Piaggio': ['Liberty 125', 'Liberty 150', 'Medley 125', 'Medley 150', 'Beverly 300', 'Beverly 400', 'MP3 300', 'MP3 400', 'MP3 500', 'Vespa Primavera 50', 'Vespa Primavera 125', 'Vespa Sprint 50', 'Vespa Sprint 125', 'Vespa GTS 125', 'Vespa GTS 300', 'Vespa GTV 300', 'Vespa Elettrica'],
  'Royal Enfield': ['Classic 350', 'Meteor 350', 'Hunter 350', 'Bullet 350', 'Himalayan', 'Continental GT 650', 'INT650', 'Super Meteor 650', 'Scram 411'],
  'Suzuki': ['GSX-R 125', 'GSX-R 600', 'GSX-R 750', 'GSX-R 1000', 'GSX-S 125', 'GSX-S 750', 'GSX-S 950', 'GSX-S 1000', 'GSX-8S', 'GSX-8R', 'V-Strom 250', 'V-Strom 650', 'V-Strom 800', 'V-Strom 1050', 'SV 650', 'Hayabusa', 'Burgman 125', 'Burgman 200', 'Burgman 400', 'Address 125', 'DR-Z 400', 'RM-Z 250', 'RM-Z 450'],
  'SYM': ['Symphony 125', 'Symphony 150', 'HD 300', 'Cruisym 300', 'Maxsym 400', 'Maxsym TL 500', 'Jet 14 125', 'NH T 125', 'NH T 200'],
  'Triumph': ['Street Triple 765', 'Street Triple 765 RS', 'Speed Triple 1200', 'Tiger 660', 'Tiger 850 Sport', 'Tiger 900', 'Tiger 1200', 'Trident 660', 'Bonneville T100', 'Bonneville T120', 'Street Twin', 'Speed Twin 900', 'Speed Twin 1200', 'Scrambler 900', 'Scrambler 1200', 'Thruxton RS', 'Rocket 3'],
  'Vespa': ['Primavera 50', 'Primavera 125', 'Sprint 50', 'Sprint 125', 'GTS 125', 'GTS 300', 'GTS Super 300', 'GTV 300', 'Elettrica'],
  'Voge': ['300 R', '500 R', '300 DS', '650 DS', '525 R', 'Brivido 500'],
  'Yamaha': ['MT-03', 'MT-07', 'MT-09', 'MT-10', 'YZF-R125', 'YZF-R3', 'YZF-R6', 'YZF-R7', 'YZF-R1', 'Tracer 7', 'Tracer 9', 'Tracer 9 GT', 'Tenere 700', 'XSR 125', 'XSR 700', 'XSR 900', 'NMAX 125', 'XMAX 125', 'XMAX 300', 'TMAX 560', 'Tricity 125', 'Tricity 300', 'Delight 125', 'Aerox 50', 'YZ 125', 'YZ 250', 'YZ 250 F', 'YZ 450 F', 'WR 250 F', 'WR 450 F', 'FZ6', 'FZ8'],
  'Zero': ['SR/F', 'SR/S', 'S', 'DS', 'DSR/X', 'FX', 'FXE'],
}

export default MOTO_DATABASE

/**
 * Restituisce tutte le marche ordinate alfabeticamente.
 * @returns {string[]}
 */
export function getMarcheOrdered() {
  return Object.keys(MOTO_DATABASE).sort()
}

/**
 * Restituisce i modelli per una marca, ordinati alfabeticamente.
 * @param {string} marca - Nome della marca
 * @returns {string[]}
 */
export function getModelliPerMarca(marca) {
  return (MOTO_DATABASE[marca] || []).sort()
}

/**
 * Cerca tra marche e modelli in base a un termine di ricerca.
 * Restituisce al massimo 20 risultati.
 * @param {string} termine - Stringa di ricerca (minimo 2 caratteri)
 * @returns {Array<{marca: string, modello: string|null, label: string}>}
 */
export function cercaMoto(termine) {
  if (!termine || termine.length < 2) return []
  const t = termine.toLowerCase()
  const risultati = []
  for (const [marca, modelli] of Object.entries(MOTO_DATABASE)) {
    if (marca.toLowerCase().includes(t)) {
      risultati.push({ marca, modello: null, label: marca })
    }
    for (const modello of modelli) {
      if (modello.toLowerCase().includes(t) || `${marca} ${modello}`.toLowerCase().includes(t)) {
        risultati.push({ marca, modello, label: `${marca} ${modello}` })
      }
    }
  }
  return risultati.slice(0, 20)
}
