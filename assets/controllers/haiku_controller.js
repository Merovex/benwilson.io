import { Application, Controller } from "https://unpkg.com/@hotwired/stimulus/dist/stimulus.js"
window.Stimulus = Application.start()
// Connects to data-controller="travel-calculator"
Stimulus.register("haiku", class extends Controller {

  // import { Controller } from "@hotwired/stimulus"

  // export default class extends Controller {
  static targets = ["terms", "heroku", "heroko", 'shavian']; // Define your targets
  shavian_char = {
    "a": "𐑭",
    "b": "𐑚",
    "c": "𐑑𐑕",
    "ĉ": "𐑗",
    "d": "𐑛",
    "e": "𐑧",
    "f": "𐑓",
    "g": "𐑜",
    "ĝ": "𐑡",
    "h": "𐑣",
    "ĥ": "𐑗",
    "i": "𐑰",
    "j": "𐑘",
    "ĵ": "𐑟",
    "k": "𐑒",
    "l": "𐑤",
    "m": "𐑥",
    "n": "𐑯",
    "o": "𐑴",
    "p": "𐑐",
    "r": "𐑮",
    "s": "𐑕",
    "ŝ": "𐑖",
    "t": "𐑑",
    "u": "𐑵",
    "ŭ": "𐑢",
    "v": "𐑝",
    "z": "𐑟"
  };

  ligatures = {
    '𐑭𐑮': '𐑸', //: 'are',   // /ɑː(r)/
    '𐑴𐑮': '𐑹',//: 'or',    // /ɔː(r)/
    '𐑧𐑮': '𐑺', //: 'air',   // /ɛə(r)/
    '𐑧𐑟': '𐑻', //: 'err',   // /ɜː(r)/
    '𐑰𐑮': '𐑽', //: 'ear',   // /ɪə(r)/
    // '𐑤𐑳': '𐑿', //: 'yew'    // /ju(ː)/
    '𐑧𐑘': '𐑱', // ej
    '𐑭𐑘': '𐑲', // aj
    '𐑭𐑢': '𐑷', // aŭ
  }

  connect() {
    // This function runs when the controller is connected to the DOM
    // console.log("Haiku controller is connected");
    this.generate();
  }

  generate() {
    var h = this.haiku();
    this.termsTarget.classList.remove('opacity-100');
    this.termsTarget.classList.add('opacity-0');
    // console.log(h);

    setTimeout(() => {
      var h = this.haiku();
      this.herokuTarget.textContent = h[0];
      this.herokoTarget.textContent = h[1];
      this.toShavian(h[1]);

      // Fade in the text
      this.termsTarget.classList.remove('opacity-0');
      this.termsTarget.classList.add('opacity-100');
    }, 350);
  }

  haiku() {
    const token = Math.floor(Math.random() * (10000 - 1000) + 1000);

    const adj_en = this.getRandom(this.adjectives);
    const noun_en = this.getRandom(this.nouns);

    const adj_es = this.adjectives[adj_en]
    const noun_es = this.nouns[noun_en]

    var esperanto = adj_es + '-' + noun_es + '-' + token
    var english = adj_en + '-' + noun_en + '-' + token

    // console.log(english, esperanto);

    return [english, esperanto];
  }

  toShavian(text) {
    let characters = text.split('');

    // Map each character to its Shavian equivalent if one exists
    let translated = characters.map(char => this.shavian_char[char] || char).join('');

    Object.keys(this.ligatures).forEach(shavianChar => {
      const replacement = this.ligatures[shavianChar];
      // console.log(shavianChar, replacement);
      translated = translated.replace(new RegExp(shavianChar, 'g'), replacement);
    });

    this.shavianTarget.textContent = translated;
  }

  getRandom(obj) {
    const keys = Object.keys(obj);
    return keys[Math.floor(Math.random() * keys.length)];
  }

  adjectives = {
    absolute: "absoluta",
    aged: "malyuna",
    ancient: "antikva",
    autumn: "aŭtuno",
    beautiful: "bela",
    believing: "kreda",
    billowing: "blovado",
    bitter: "akra",
    black: "negra",
    blue: "blua",
    bold: "aŭdaca",
    broken: "disrompita",
    capable: "kapabla",
    cold: "malvarma",
    complicated: "komplika",
    cool: "malvarmeta",
    crimson: "karmezina",
    damp: "malseka",
    dark: "malhela",
    debating: "debata",
    delicate: "delikata",
    devilish: "diabla",
    diverse: "diversa",
    divine: "devina",
    dry: "seka",
    dutiful: "obema",
    empty: "malplena",
    evening: "vespera",
    extensive: "ampleska",
    falling: "falanta",
    fearful: "tima",
    floral: "flora",
    forgetful: "forgesa",
    foxy: "vulpa",
    fragrant: "bonodora",
    frequent: "ofta",
    friendly: "amika",
    frosty: "frosta",
    giving: "donaca",
    green: "verda",
    handy: "proksima",
    happy: "feliĉa",
    hidden: "kaŝa",
    holy: "sankta",
    icy: "glacia",
    late: "malfrua",
    lingering: "kronika",
    little: "malgranda",
    lively: "viva",
    long: "longa",
    misty: "nebula",
    morning: "matena",
    muddy: "kota",
    nameless: "anonima",
    necessary: "necesa",
    nomadic: "nomada",
    old: "malnova",
    patient: "pacienca",
    peachy: "persika",
    polished: "jentila",
    precise: "preciza",
    proud: "fiera",
    purple: "purpura",
    quaint: "ĉarma",
    quiet: "kvieta",
    ravenous: "englutema",
    red: "ruja",
    regretful: "bedaŭra",
    restless: "malkvieta",
    rough: "kruda",
    savage: "sovaja",
    sensible: "senca",
    shy: "timida",
    silent: "silenta",
    skillful: "lerta",
    small: "malgranda",
    snowy: "neja",
    solitary: "sola",
    sparkling: "brileta",
    spring: "printempa",
    still: "trankvila",
    summer: "somera",
    terrible: "terura",
    thankful: "danka",
    thinking: "pensa",
    throbbing: "pulsa",
    tranquil: "trankvila",
    twilight: "krepuska",
    vigorous: "vigla",
    wandering: "vagada",
    weathered: "eluzita",
    weeping: "plora",
    white: "blanka",
    wild: "frenza",
    winter: "vintra",
    wispy: "maldika",
    withered: "velka",
    yellow: "flava",
    young: "yuna",
    heedless: "senatenta",
  };
  nouns = {
    amusement: "amuzo",
    basket: "korbo",
    belief: "kredo",
    bird: "birdo",
    breeze: "venteto",
    brook: "rivereto",
    bush: "arbedo",
    butterfly: "papilio",
    cherry: "ĉerizo",
    cloud: "nubo",
    darkness: "mallumo",
    dawn: "krepusko",
    debate: "debato",
    desire: "deziro",
    devil: "diablo",
    dew: "roso",
    dream: "sonjo",
    dust: "polvo",
    existence: "ekzisto",
    feather: "plumo",
    field: "kampo",
    fire: "brulego",
    firefly: "lampiro",
    flower: "floro",
    fog: "nebulo",
    forest: "arbaro",
    fox: "vulpo",
    friend: "amiko",
    frog: "rano",
    frost: "prujno",
    gift: "donaco",
    glade: "arbarkampo",
    glitter: "brilo",
    goal: "celo",
    grass: "herbo",
    hand: "mano",
    haze: "nebuleto",
    hill: "monto",
    horse: "ĉevalo",
    lake: "lago",
    leaf: "folio",
    meadow: "herbejo",
    moon: "luno",
    morning: "mateno",
    mountain: "mateno",
    night: "nokto",
    paper: "papero",
    peach: "persiko",
    pine: "pino",
    precision: "precizo",
    rain: "pluvo",
    regret: "bedaŭro",
    resonance: "resonanco",
    river: "rivero",
    sea: "maro",
    shadow: "ombro",
    shape: "formo",
    silence: "kvieto",
    situation: "situacio",
    sky: "ĉielo",
    smoke: "fumo",
    snow: "nejo",
    snowflake: "nejero",
    sound: "sono",
    star: "stelo",
    story: "rakonto",
    sun: "suno",
    sunset: "sunsubiro",
    surf: "ŝaŭmo",
    thanks: "danko",
    thunder: "tondro",
    tree: "arbo",
    valor: "kurajo",
    violet: "violo",
    voice: "voĉo",
    watchtower: "gardoturo",
    water: "akvo",
    waterfall: "akvofalo",
    wave: "ondo",
    wind: "vento",
    wizard: "sorĉo",
    wood: "ligno",
  };
});