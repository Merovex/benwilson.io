import { Application, Controller } from "https://unpkg.com/@hotwired/stimulus/dist/stimulus.js"
window.Stimulus = Application.start()

String.prototype.format = function () {
  var a = this;
  for (var k in arguments) {
    a = a.replace("{" + k + "}", arguments[k])
  }
  return a
}
String.prototype.template = function (data) {
  var a = this;
  return a.replace(
    /\{(\w*)\}/g,
    function (m, key) {
      return data.hasOwnProperty(key) ? data[key] : "";
    }
  );
}

// Connects to data-controller="astromap"
Stimulus.register("astromap", class extends Controller {
  static targets = ['coordinates', 'newCoordinate', 'bases', 'factions', 'location', 'name', 'orbits', 'star', 'temp', 'trade_codes', 'travel_code', 'uwp', 'description', 'routableVolumes'];
  volumes = [];
  connect() {
    console.log("Loading Astromap Controller")
    this.loadData();
    // this.showVolumeDetails();
  }
  ternary(source, key, alternate) {
    return source.hasOwnProperty(key) ? source[key] : alternate
  }
  showVolumeDetails() { // 0801
    var coord = this.coordinatesTarget.value;
    // coord = '0801';
    var orbits = "";
    var onum = 0;
    if (coord.length != 4 || this.volumes[coord] == undefined) { return; }

    var data = this.volumes[coord];
    // console.log("Show Volume Details", this.coordinatesTarget.value, data);
    for (let orbit of data["orbits"]) {
      var result = '';
      var d = {
        orbit: onum++,
        type: orbit[0][0],
        uwp: orbit[0][1],
        distance: orbit[0][2]
      }
      if (d['type'] == ".") { // Different rendering for empty orbits
        result = this.EMPTY_TEMPLATE.template(d)
      }
      else {
        d['klass'] = this.ternary(this.PLANET_CLASSES, d['type'], " striped")
        d['type'] = this.ternary(this.PLANET_TYPES, d['type'], d['type'])

        result = this.ORBIT_TEMPLATE.template(d)

        if (orbit[1].length != 0) { // Add any moons to table
          for (let moon of orbit[1]) {
            var d = moon.split(".")
            result += this.MOON_TEMPLATE.template({
              distance: d[0],
              uwp: d[1]
            })
          }
        }
      }
      orbits += result
    }
    this.basesTarget.innerHTML = data["bases"];
    this.factionsTarget.innerHTML = data["factions"];
    this.locationTarget.innerHTML = data["location"];
    this.nameTarget.innerHTML = data["name"];
    this.orbitsTarget.innerHTML = orbits;
    this.starTarget.innerHTML = data["star"];
    this.tempTarget.innerHTML = data["temp"];
    this.trade_codesTarget.innerHTML = data["trade_codes"];
    this.travel_codeTarget.innerHTML = data["travel_code"];
    this.uwpTarget.innerHTML = data["uwp"];
    // console.log(orbits);
    this.uwpTranslate(data["name"], data["uwp"])
    this.routableVolumes(coord)
  }
  loadData() {
    fetch('/assets/teradoma.json')
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Network response was not ok.");
        }
      })
      .then(data => {
        // this.handleData(data);

        this.volumes = data["volumes"];
        console.log("Loaded data.");
        if (this.coordinatesTarget.value.length == 4) {
          this.showVolumeDetails();
        }
        // console.log(this.volumes);
      })
      .catch(error => console.error("Error fetching data: ", error));
  }

  uwpTranslate(name, uwp) {
    var keys = ['port', 'size', 'atmos', 'hydro', 'popx', 'govt', 'law', 'tech'];
    var bits = uwp.split('').filter(bit => bit !== '-');
    var description = name;

    keys.forEach((key, i) => {
      var template = this.metadata.templates[key];
      var datum = this.metadata.code[key][bits[i]];
      if (Array.isArray(datum)) {
        description += template.replace('{0}', datum[0]).replace('{1}', datum[1]);
      } else {
        description += template.replace('{0}', datum);
      }
      description += ' ';
    });
    this.descriptionTarget.innerHTML = description;
  }
  EMPTY_TEMPLATE = `<tr class='text-sm text-center striped text-shade'><td class='py-2'>{orbit}</td><td class='py-2'>&mdash; Empty &mdash;</td><td class='py-2'>{distance}</td><td class='py-2'>&nbsp;</td></tr>`;
  ORBIT_TEMPLATE = `<tr class='text-center{klass}'><td class='py-2'>{orbit}</td><td class='py-2'>{type}</td><td class='py-2'>{distance}</td><td class='py-2'>{uwp}</td></tr>`;
  MOON_TEMPLATE = `<tr class='striped'><td colspan='2'></td><td class='text-right'>{distance}.</td><td class='text-center'>{uwp}</td></tr>`;
  ROUTE_TEMPLATE = `<tr class='text-center striped'><td class='py-2'><a data-astromap-target='newCoordinate' data-action='click->astromap#setCoordinate'>{coord}</a></td><td class='py-2'>{uwp}</td><td class='py-2'>{distance}</td><td class='py-2'>{name}</td></tr>`;
  PLANET_CLASSES = {
    'W': " italic bg-primary-50 dark:bg-primary-50/10",
    'S': " bg-amber-300 dark:bg-amber-600 text-black"
  }
  PLANET_TYPES = {
    'W': 'Mainworld',
    'S': 'Companion Star',
    'G': "Gas Giant",
    'R': "Rockball",
    'B': "Belt"
  }
  center_of(column, row) {
    var side = 40
    var factor = 1.732
    var x = (side + ((column - 1) * side * 1.5)).toFixed(0)
    var y = ((row - 1) * side * factor + (side * factor / (1 + (column % 2)))).toFixed(0)
    return [x, y]
  }
  calcSlope(origin, point) {
    return Math.round((point[1] - origin[1]) / (point[0] - origin[0]) * 10)
  }
  calcDistance(origin, point) {
    return Math.sqrt(Math.pow(origin[0] - point[0], 2) + Math.pow(origin[1] - point[1], 2))
  }
  calcQuadrant(origin, point) {
    var x = point[0] - origin[0]
    var y = point[1] - origin[1]
    switch (true) {
      case (x >= 0) && (y <= 0): return 1; break; // 1 = x pos, y pos
      case (x <= 0) && (y <= 0): return 2; break; // 2 = x neg, y pos
      case (x <= 0) && (y >= 0): return 3; break; // 3 = x neg, y neg
      case (x >= 0) && (y >= 0): return 4; break; // 4 = x pos, y neg
      default: return 5
    }
  }
  routableVolumes(key) {
    if (key.length != 4) { return; }
    var routes = {}
    var x = parseInt(key.slice(0, 2))
    var y = parseInt(key.slice(2))
    var origin = this.center_of(x, y)

    var p = 0 // Failsafe in case the for loops get out of control. It has happened.

    for (var j = (y - 3); j <= (y + 3); j++) {
      for (var i = (x - 3); i <= (x + 3); i++) {

        var coord = i.toString().padStart(2, '0') + j.toString().padStart(2, '0') // Printed coordinates

        var point = this.center_of(i, j)
        var distance = this.calcDistance([x, y], [i, j]) // We need unadjusted coordinates.
        var quadrant = this.calcQuadrant(origin, point)
        var slope = this.calcSlope(origin, point)

        // Process routes to habited volumes if within Jump-3 (a bit of rounding required)
        if (0 < distance && distance < 3.605 && this.volumes[coord] != undefined) {
          // Exclude the farther route of two candidate routes in the same direction.
          var direction = "{0}:{1}".format(quadrant, slope)
          if (direction in routes && distance > routes[direction][0]) {
            continue;
          }

          // Capture the route information
          routes[direction] = [
            distance,
            coord,
            this.ROUTE_TEMPLATE.template({
              coord: coord,
              distance: Math.round(distance),
              name: this.volumes[coord]['name'],
              uwp: this.volumes[coord]['uwp']
            })
          ]
        }
        if (p++ > 1000) { break; } // failsafe
      }
    }
    var result = "";
    for (key in routes) { result += routes[key][2] }
    this.routableVolumesTarget.innerHTML = result;
  }
  setCoordinate(event) {
    event.preventDefault();
    // console.log("Set Coordinate", event, event.target.innerHTML);
    // var coordinate = link.getAttribute("data-coordinate");
    // this.setVal('coordinate', coordinate)
    this.coordinatesTarget.value = event.target.innerHTML;
    this.showVolumeDetails()
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
        "A": "has an Excellent Starport with shipyards able of handling Starships up to the Overhaul level, and provides <b>Refined</b> fuel.",
        "B": "has a Good Starport with shipyards able of handling Spacecraft up to the Overhaul level, and provides <b>Refined</b> fuel.",
        "C": "has a Routine Starport without shipyards, can perform Major repairs, and provides <b>Unrefined</b> fuel.",
        "D": "has a Poor Starport without shipyards, can perform Major repairs, and provides <b>Unrefined</b> fuel.",
        "E": "has a frontier Starport without shipyards or repair facilities, and provides no fuel.",
        "F": "has a Good Spaceport without shipyards, can perform Minor repairs, and provides <b>Unrefined</b> fuel.",
        "G": "has a Good Spaceport without shipyards, can perform Superficial repairs, and provides <b>Unrefined</b> fuel.",
        "H": "has a Primitive Spaceport without shipyards or repair facilities, and provides no fuel.",
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