// import { Controller } from "@hotwired/stimulus"
import { Application, Controller } from "https://unpkg.com/@hotwired/stimulus/dist/stimulus.js"
window.Stimulus = Application.start()

// Connects to data-controller="uwp-translator"
// export default class extends Controller {
Stimulus.register("uwp-translator", class extends Controller {
  connect() {
    console.log("connected uwp-translator")
    this.translate();
  }
  static targets = ["name", "uwp", "code", "output",
    'port', 'size', 'atmos', 'popx', 'hydro', 'govt', 'law', 'tech',
  ];

  highlight(target) {
    this[`${target}Target`].classList.add('bg-amber-100');
    setTimeout(() => { this[`${target}Target`].classList.remove('bg-amber-100'); }, 1500);
  }

  translate() {
    // Your translation logic here
    let name = this.nameTarget.value || 'Unnamed World';
    let s = [];

    let keys = ['port', 'size', 'atmos', 'hydro', 'popx', 'govt', 'law', 'tech'];
    let bits = this.uwpTarget.value.split('').filter(bit => bit !== '-');
    let checksum = this.codeTarget.innerHTML.split('').filter(bit => bit !== '-');
    if (bits.length !== keys.length) { return; }

    keys.forEach((key, i) => {
      if (checksum[i] !== bits[i]) {
        let template = this.metadata.templates[key];
        let datum = this.metadata.code[key][bits[i]];
        this.highlight(key)
        if (Array.isArray(datum)) {
          this[`${key}Target`].innerHTML = template.replace('{0}', datum[0]).replace('{1}', datum[1]);
        } else {
          this[`${key}Target`].innerHTML = template.replace('{0}', datum);
        }
      }
    });
    this.codeTarget.innerHTML = this.uwpTarget.value;
  }
  metadata = {
    "templates": {
      "name": "{0} {1}.",
      "port": "{0}",
      "size": "The main world is roughly {1} kilometers in diameter, and is <strong>{0}</strong>.",
      "atmos": "{0}",
      "hydro": "The surface is roughly {0} percent surface water (or similar fluid), which qualifies it as a <strong>{1}</strong> world.",
      "popx": "The main world has a general population of {1} local residents, which qualifies it as a <strong>{0} population</strong> world.",
      "govt": "The local government is characterized as <strong>{0}</strong>, with {1}.",
      "law": "Visitors may find the law {0}restrictive as <strong>{1}</strong> are regulated or restricted by local authorities.",
      "tech": "Technology is described as {0} (See <a href='http://wiki.travellerrpg.com/Tech_Level_Comparison_Chart'>TL chart</a>)."
    },
    "code": {
      "port": {
        "A": "has an Excellent Starport with shipyards able of handling Starships up to the Overhaul level, and provides <b>Refined</b> fuel",
        "B": "has a Good Starport with shipyards able of handling Spacecraft up to the Overhaul level, and provides <b>Refined</b> fuel",
        "C": "has a Routine Starport without shipyards, can perform Major repairs, and provides <b>Unrefined</b> fuel",
        "D": "has a Poor Starport without shipyards, can perform Major repairs, and provides <b>Unrefined</b> fuel",
        "E": "has a frontier Starport without shipyards or repair facilities, and provides no fuel",
        "F": "has a Good Spaceport without shipyards, can perform Minor repairs, and provides <b>Unrefined</b> fuel",
        "G": "has a Good Spaceport without shipyards, can perform Superficial repairs, and provides <b>Unrefined</b> fuel",
        "H": "has a Primitive Spaceport without shipyards or repair facilities, and provides no fuel",
        "X": "has no spaceport or starport",
        "Y": "has no spaceport or starport"
      },
      "size": {
        "R": ["a Asteroid/Planetary Ring (around world)", "Multiple < 1"],
        "0": ["a Asteroid/Planetary Belt (around star)", "Multiple < 200"],
        "D": ["Debris", "< 200"],
        "S": ["a Very Small terrestrial (e.g. Luna)", "200&ndash;6,399"],
        "1": ["a Tiny terrestrial (e.g. Mars)", " 6,400&ndash;7,199"],
        "2": ["a Small terrestrial ", "7,200&ndash;7,999"],
        "3": ["a Small terrestrial", "8,000&ndash;8,799"],
        "4": ["a Small terrestrial", "8,800&ndash;9,599"],
        "5": ["a Medium terrestrial", "9,600&ndash;10,399"],
        "6": ["a Medium terrestrial", "10,400&ndash;11,199"],
        "7": ["a Medium terrestrial (e.g. Venus)", "11,200&ndash;12,799"],
        "8": ["a Large terrestrial (e.g. Terra)", "12,800&ndash;14,399"],
        "9": ["a Large terrestrial", "14,400&ndash;15,999"],
        "A": ["a Large terrestrial", "16,000&ndash;16,799"],
        "B": ["a Huge terrestrial", "16,800+"]
      },
      "atmos": {
        "0": "The atmosphere has a pressure of less than 0.1 atmosphere, which requires the use of a vacc suit.",
        "1": "The atmosphere has a pressure of less than 0.1 atmosphere, which requires the use of a vacc suit.",
        "2": "The atmosphere has a pressure of 0 1 to 0.42 atmospheres and contains contains an unusual taint such as such as disease, a hazardous gas mix, pollutants, or sulfur compounds. This requires a combination respirator/filter mask for survival.",
        "3": "The atmosphere has a pressure of 0.1 to 0.42 atmospheres, which requires the use of a compressor to ensure sufficient oxygen.",
        "4": "The atmosphere has a pressure of 0.71 to 1.49 atmospheres. The atmosphere is a standard oxygen/nitrogen mix, which is breathable without assistance.",
        "5": "The atmosphere has a pressure of 0.43 to 0.70 atmospheres. The atmosphere is a standard oxygen/nitrogen mix, which is breathable without assistance.",
        "6": "The atmosphere has a pressure of 0.71 to 1.49 atmospheres The atmosphere is a standard oxygen/nitrogen mix, which is breathable without assistance.",
        "7": "The otherwise standard atmosphere (0.71&ndash;1.49 atm) contains an unusual taint such as such as disease, a hazardous gas mix, pollutants, or sulfur compounds which requires the use of a filter mask.",
        "8": "The atmosphere has a pressure of 1.50 to 2.49 atmospheres The atmosphere is a standard oxygen/nitrogen mix, which is breathable without assistance.",
        "9": "The dense atmosphere (0.71&ndash;1.49 atm) contains an unusual taint such as such as disease, a hazardous gas mix, pollutants, or sulfur compounds which requires the use of a filter mask. Tainted, very thin atmospheres require a combination respirator/filter mask for survival.",
        "A": "An unusual gas mix which requires the use of oxygen tanks, but protective suits are not needed.",
        "B": "A concentrated gas mix or unusual temperature creates a corrosive environment, which requires the use of a protective suit or vacc suit.",
        "C": "The atmosphere is similar to a corrosive atmosphere, but extreme conditions cause the corrosive effects to defeat any protective measures in a few hours.",
        "D": "Pressure at or below sea level is too great to support life but is breathable at higher altitudes.",
        "E": "The world’s surface is ellipsoidal, not spherical. Because the atmosphere remains spherical, surface atmospheric pressure ranges from very high at the middle to very low at the ends Breathable bands may exist at some point within the range of pressure.",
        "F": "The world is large and massive, with a thin atmosphere which settles to the lowest levels of the terrain. The atmosphere is unbreathable at most altitudes except the very low ones (as in depressions or deep valleys)."
      },
      "hydro": {
        "0": ["0&ndash;4", "Desert world"], "1": ["5&ndash;14", "Dry world"],
        "2": ["15&ndash;24", "Dry world"], "3": ["25&ndash;34", "Wet world"],
        "4": ["35&ndash;44", "Wet world"], "5": ["45&ndash;54", "Wet world"],
        "6": ["55&ndash;64", "Wet world"], "7": ["65&ndash;74", "Wet world"],
        "8": ["75&ndash;84", "Wet world"], "9": ["85&ndash;94", "Wet world"],
        "A": ["95&ndash;100", "Water world"]
      },
      "popx": {
        "0": ["Low", "<10 (P)"], "1": ["Low", "10 to 100 (P0)"],
        "2": ["Low", "100 to 1,000 (P00)"], "3": ["Low", "1,000 to 10,000 (P,000)"],
        "4": ["Moderate", "10,000 to 100,000 (P0,000)"],
        "5": ["Moderate", "100,000 to 1,000,000 (P00,000)"],
        "6": ["Moderate", "1 Million to 10 Million (P,000,000)"],
        "7": ["Moderate", "10 Million to 100 Million (P0,000,000)"],
        "8": ["Moderate", "100 Million to 1 Billion (P00,000,000)"],
        "9": ["High", "1 Billion to 10 Billion (P,000,000,000)"],
        "A": ["High", "10 Billion to 100 Billion (P0,000,000,000)"],
        "B": ["High", "100 Billion to 1 Trillion (P00,000,000,000)"]
      },
      "govt": {
        "0": ["No Government Structure", "In many cases, tribal, clan or family bonds predominate"],
        "1": ["Company/Corporation", "government by a company managerial elite, citizens are company employees"],
        "2": ["Participating Democracy", "government by advice and consent of the citizen"],
        "3": ["Self-Perpetuating Oligarchy", "government by a restricted minority, with little or no input from the masses"],
        "4": ["Representative Democracy", "government by elected representatives"],
        "5": ["Feudal Technocracy", "government by specific individuals for those who agree to be ruled Relationships are based on the performance of technical activities which are mutually beneficial"],
        "6": ["Captive Government/Colony", "government by a leadership answerable to an outside group, a colony or conquered area"],
        "7": ["Balkanization", "No central ruling authority exists", "rival governments compete for control"],
        "8": ["Civil Service Bureaucracy", "government by agencies employing individuals selected for their expertise"],
        "9": ["Impersonal Bureaucracy", "government by agencies which are insulated from the governed"],
        "A": ["Charismatic Dictator", "government by a single leader enjoying the confidence of the citizens"],
        "B": ["Non-Charismatic Leader", "A previous charismatic dictator has been replaced by a leader through normal channels"],
        "C": ["Charismatic Oligarchy", "government by a select group, organization, or class enjoying overwhelming confidence of the citizenry"],
        "D": ["Religious Dictatorship", "government by a religious minority which has little regard for the needs of the citizenry"],
        "E": ["Religious Autocracy", "government by a single religious leader having absolute power over the citizenry"],
        "F": ["Totalitarian Oligarchy", "government by an all-powerful minority which maintains absolute control through widespread coercion and oppression"]
      },
      "law": {
        "0": ["unrestricted", "no prohibitions (nuclear weapons)"],
        "1": ["barely ", "only body pistols, explosives, poison gas"],
        "2": ["barely ", "portable energy weapons"],
        "3": ["barely ", "machine guns, automatic weapons"],
        "4": ["moderately ", "light assault weapons"],
        "5": ["moderately ", "personal concealable weapons"],
        "6": ["moderately ", "all firearms except shotguns"],
        "7": ["moderately ", "Shotguns"],
        "8": ["highly ", "Blade Weapons Controlled"],
        "9": ["highly ", "weapons outside the home"],
        "A": ["extremely ", "Weapon possession"],
        "B": ["extremely ", "Rigid control of civilian movement"],
        "C": ["extremely ", "Unrestricted invasion of privacy"],
        "D": ["extremely ", "Paramilitary law enforcement"],
        "E": ["extremely ", "Full-fledged police state"],
        "F": ["extremely ", "All facets of daily life rigidly controlled"],
        "G": ["extremely ", "Severe punishment for petty infractions"],
        "H": ["extremely ", "Legalized oppressive practices"],
        "J": ["extremely ", "Routinely oppressive and restrictive"],
        "K": ["extremely ", "Excessively oppressive and restrictive"],
        "L": ["extremely ", "Totally oppressive and restrictive"]
      },
      "tech": {
        "0": "Stone Age (fire)",
        "1": "Pre-Industrial (3500 BC to 600 AD)",
        "2": "Age of Sail (1450 AD)",
        "3": "Industrial Revolution (1730 AD)",
        "4": "Mechanized Age (1880 AD)",
        "5": "Circa 1910 AD",
        "6": "Nuclear Age (1940 AD)",
        "7": "Circa 1970 AD",
        "8": "Digital Age (1990 AD)",
        "9": "Early Stellar (2050 AD)",
        "A": "Early Stellar (2120 AD)",
        "B": "Average Stellar",
        "C": "Average Imperial",
        "D": "Average Stellar",
        "E": "High Stellar",
        "F": "Imperial Maximum"
      }
    }
  }
});
