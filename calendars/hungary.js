var _ = require('lodash'),
    moment = require('moment'),
    range = require('moment-range'),
    Path = require('path'),
    Utils = require( Path.join( __dirname, '../lib/utils' )),
    Dates = require( Path.join( __dirname, '../lib/dates' )),
    LiturgicalColors = require( Path.join( __dirname, '../data/liturgicalColors' )),
    Titles = require( Path.join( __dirname, '../data/titles' )),
    Types = require( Path.join( __dirname, '../data/types' )).types;

module.exports = {
  dates: function() {

    var dates = [
      {
        "key": "saintMargaretOfHungary",
        "type": Types[4],
        "moment": moment.utc({ year: arguments[0], month: 0, day: 18 }),
        "data": {
          "meta": {
            "liturgicalColor": LiturgicalColors.WHITE
          }
        }
      },
      {
        "key": "saintsCyrilMonkAndMethodiusBishop",
        "type": Types[4],
        "moment": moment.utc({ year: arguments[0], month: 1, day: 14 }),
        "data": {
          "meta": {
            "liturgicalColor": LiturgicalColors.WHITE,
            "titles": [ Titles.PATRON_OF_EUROPE ]
          }
        }
      },
      {
        "key": "saintMatthiasApostle",
        "type": Types[4],
        "moment": moment.utc({ year: arguments[0], month: 1, day: 24 }),
        "data": {
          "meta": {
            "liturgicalColor": LiturgicalColors.WHITE
          }
        }
      },
      {
        "key": "saintAdalbertBishopAndMartyr",
        "type": Types[5],
        "moment": moment.utc({ year: arguments[0], month: 3, day: 23 }),
        "data": {
          "meta": {
            "liturgicalColor": LiturgicalColors.RED,
            "titles": [
              Titles.MARTYR
            ]
          }
        }
      },
      {
        "key": "saintCatherineOfSienaVirginAndDoctorOfTheChurch",
        "type": Types[4],
        "moment": moment.utc({ year: arguments[0], month: 3, day: 29 }),
        "data": {
          "meta": {
            "liturgicalColor": LiturgicalColors.WHITE,
            "titles": [
              Titles.PATRON_OF_EUROPE,
              Titles.DOCTOR_OF_THE_CHURCH
            ]
          }
        }
      },
      {
        "key": "saintFlorianMartyr",
        "type": Types[6],
        "moment": moment.utc({ year: arguments[0], month: 4, day: 4 }),
        "data": {
          "meta": {
            "titles": [
              Titles.MARTYR
            ]
          }
        }
      },
      {
        "key": "blessedGisela",
        "type": Types[6],
        "moment": moment.utc({ year: arguments[0], month: 4, day: 7 }),
        "data": {}
      },
      {
        "key": "blessedSaraSalkahaziVirginAndMartyr",
        "type": Types[6],
        "moment": moment.utc({ year: arguments[0], month: 4, day: 11 }),
        "data": {
          "meta": {
            "titles": [
              Titles.MARTYR
            ]
          }
        }
      },
      {
        "key": "saintJohnNepomucenePriestAndMartyr",
        "type": Types[6],
        "moment": moment.utc({ year: arguments[0], month: 4, day: 16 }),
        "data": {
          "meta": {
            "titles": [
              Titles.MARTYR
            ]
          }
        }
      },
      {
        "key": "blessedVilmosAporBishopAndMartyr",
        "type": Types[6],
        "moment": moment.utc({ year: arguments[0], month: 4, day: 23 }),
        "data": {
          "meta": {
            "titles": [
              Titles.MARTYR
            ]
          }
        }
      },
      {
        "key": "ourLadyHelpOfChristians",
        "type": Types[5],
        "moment": moment.utc({ year: arguments[0], month: 4, day: 24 }),
        "data": {}
      },
      {
        "key": "transferOfTheRelicsOfSaintStephen",
        "type": Types[6],
        "moment": moment.utc({ year: arguments[0], month: 4, day: 30 }),
        "data": {}
      },
      {
        "key": "blessedIstvanSandorMartyr",
        "type": Types[6],
        "moment": moment.utc({ year: arguments[0], month: 5, day: 8 }),
        "data": {
          "meta": {
            "titles": [
              Titles.MARTYR
            ]
          }
        }
      },
      {
        "key": "saintLadislaus",
        "type": Types[4],
        "moment": moment.utc({ year: arguments[0], month: 5, day: 27 }),
        "data": {
          "meta": {
            "liturgicalColor": LiturgicalColors.WHITE
          }
        }
      },
      {
        "key": "visitationOfTheBlessedVirginMary",
        "type": Types[4],
        "moment": moment.utc({ year: arguments[0], month: 6, day: 2 }),
        "data": {
          "meta": {
            "liturgicalColor": LiturgicalColors.WHITE
          }
        }
      },
      {
        "key": "saintBenedictOfNursiaAbbot",
        "type": Types[4],
        "moment": moment.utc({ year: arguments[0], month: 6, day: 11 }),
        "data": {
          "meta": {
            "liturgicalColor": LiturgicalColors.WHITE,
            "titles": [ Titles.PATRON_OF_EUROPE ]
          }
        }
      },
      {
        "key": "saintsAndrewZorardAndBenedictHermits",
        "type": Types[5],
        "moment": moment.utc({ year: arguments[0], month: 6, day: 17 }),
        "data": {}
      },
      {
        "key": "saintBrigittaReligious",
        "type": Types[4],
        "moment": moment.utc({ year: arguments[0], month: 6, day: 23 }),
        "data": {
          "meta": {
            "liturgicalColor": LiturgicalColors.WHITE
          }
        }
      },
      {
        "key": "saintKingaVirgin",
        "type": Types[5],
        "moment": moment.utc({ year: arguments[0], month: 6, day: 24 }),
        "data": {}
      },
      {
        "key": "saintTeresaBenedictaOfTheCrossEdithSteinVirginAndMartyr",
        "type": Types[4],
        "moment": moment.utc({ year: arguments[0], month: 7, day: 9 }),
        "data": {
          "meta": {
            "liturgicalColor": LiturgicalColors.RED,
            "titles": [
              Titles.MARTYR,
              Titles.PATRON_OF_EUROPE
            ]
          }
        }
      },
      {
        "key": "blessedInnocentXiPope",
        "type": Types[5],
        "moment": moment.utc({ year: arguments[0], month: 7, day: 13 }),
        "data": {}
      },
      {
        "key": "saintStephenOfHungary",
        "type": "SOLEMNITY",
        "moment": moment.utc({ year: arguments[0], month: 7, day: 20 }),
        "data": {}
      },
      {
        "key": "blessedTeresaOfCalcuttaReligious",
        "type": Types[6],
        "moment": moment.utc({ year: arguments[0], month: 8, day: 5 }),
        "data": {}
      },
      {
        "key": "saintsMarkoKrizinMelicharGrodeckiAndStephenPongracPriestsAndMartyrs",
        "type": Types[4],
        "moment": moment.utc({ year: arguments[0], month: 8, day: 7 }),
        "data": {
          "meta": {
            "liturgicalColor": LiturgicalColors.WHITE
          }
        }
      },
      {
        "key": "saintGerardBishop",
        "type": Types[4],
        "moment": moment.utc({ year: arguments[0], month: 8, day: 24 }),
        "data": {
          "meta": {
            "liturgicalColor": LiturgicalColors.WHITE
          }
        }
      },
      {
        "key": "ourLadyOfHungary",
        "type": Types[4],
        "moment": moment.utc({ year: arguments[0], month: 9, day: 8 }),
        "data": {
          "meta": {
            "liturgicalColor": LiturgicalColors.WHITE
          }
        }
      },
      {
        "key": "saintJohnXxiiiPope",
        "type": Types[6],
        "moment": moment.utc({ year: arguments[0], month: 9, day: 11 }),
        "data": {}
      },
      {
        "key": "saintJohnPaulIiPope",
        "type": Types[6],
        "moment": moment.utc({ year: arguments[0], month: 9, day: 22 }),
        "data": {}
      },
      {
        "key": "saintMaurusBishop",
        "type": Types[5],
        "moment": moment.utc({ year: arguments[0], month: 9, day: 25 }),
        "data": {}
      },
      {
        "key": "blessedTheodoreRomzhaBishopAndMartyr",
        "type": Types[6],
        "moment": moment.utc({ year: arguments[0], month: 9, day: 31 }),
        "data": {
          "meta": {
            "titles": [
              Titles.MARTYR
            ]
          }
        }
      },
      {
        "key": "saintEmeric",
        "type": Types[4],
        "moment": moment.utc({ year: arguments[0], month: 10, day: 4 }),
        "data": {
          "meta": {
            "liturgicalColor": LiturgicalColors.WHITE
          }
        }
      },
      {
        "key": "hungarianSaintsAndBlesseds",
        "type": Types[6],
        "moment": moment.utc({ year: arguments[0], month: 10, day: 13 }),
        "data": {}
      }
    ];

    // Get localized celebration names
    return _.map( dates, function( date ) {
      date.name = Utils.localize({
        key: 'national.' + date.key
      });
      return date;
    });
  }
};
