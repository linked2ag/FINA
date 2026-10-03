/* ══════════════════════════════════════════════════════════════
   FINA — Demo-Daten (englisch)
   Ein erfundenes Haushaltsbuch für den Knopf „Open demo data (EN)"
   auf der Begrüßungsseite (data-wdemo → openDemo() in
   js/storage.js). Alle Namen und Zahlen sind ausgedacht.

   **Eine Skriptdatei und keine JSON-Datei**, aus demselben Grund
   wie alles in FINA (Regel 4 in CLAUDE.md): `fetch` auf eine Datei
   daneben scheitert unter file:// — und genau so laufen die Mac-
   und die Windows-App. Ein <script> lädt dagegen überall. Geladen
   wird sie erst beim Klick, nicht mit der Seite: wer seine eigene
   Datei öffnet, braucht sie nie.

   Der Inhalt ist ein gewöhnlicher Stand im aktuellen Format, so wie
   „Daten speichern" ihn schreibt (stateJson()). Entstanden ist er
   aus `fina-demo-en.json` (Google Drive, „# MDA/Finanzen/FINA
   Tabellen/") — durch migrate() überführt, die beantwortete Umfrage
   und der Zeitpunkt des letzten Imports entfernt, alle Monate
   sichtbar (hideDoneMonths:false), die flexiblen Posten in zwei
   Kategorien (EVERYDAY, LEISURE) statt in „N/A". Wer die Daten
   ändert, ändert sie hier; openDemo() lässt sie beim Öffnen
   trotzdem noch einmal durch migrate() laufen, eine ältere Fassung
   dieser Datei bliebe also lesbar.
   ══════════════════════════════════════════════════════════════ */
window.FINA_DEMO_EN={
  "year": 2026,
  "lang": "en",
  "opening": 2123,
  "banks": [
    {
      "code": "MA",
      "label": "Main account"
    },
    {
      "code": "CC",
      "label": "Credit card"
    },
    {
      "code": "SA",
      "label": "Savings"
    }
  ],
  "pays": [
    {
      "code": "DD",
      "label": "Direct debit"
    },
    {
      "code": "TR",
      "label": "Transfer"
    },
    {
      "code": "CC",
      "label": "Card"
    },
    {
      "code": "CA",
      "label": "Cash"
    }
  ],
  "groups": [
    "(Regulär ohne Kategorie)",
    "HOME",
    "CAR",
    "INSURANCE",
    "SUBSCRIPTIONS"
  ],
  "incomeGroups": [
    "(Einnahmen ohne Kategorie)",
    "SALARY",
    "SIDE INCOME"
  ],
  "fixed": [
    {
      "id": "inc-1",
      "name": "Salary",
      "group": "SALARY",
      "amounts": [
        4260,
        4260,
        4260,
        4260,
        4260,
        4260,
        4260,
        4260,
        4260,
        4260,
        4260,
        4260
      ],
      "bank": "MA",
      "pay": "TR",
      "dueDay": "28",
      "end": null,
      "estimated": false,
      "note": "",
      "notes": [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "paid": [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        false
      ],
      "links": [
        {
          "name": "Google",
          "url": "https://google.de"
        },
        {
          "name": "Apple",
          "url": "https://apple.com"
        }
      ],
      "imp": [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
      ]
    },
    {
      "id": "inc-2",
      "name": "Bonus",
      "group": "SALARY",
      "amounts": [
        0,
        0,
        0,
        0,
        0,
        1400,
        0,
        0,
        0,
        0,
        0,
        900
      ],
      "bank": "MA",
      "pay": "TR",
      "dueDay": "28",
      "end": null,
      "estimated": false,
      "note": "",
      "notes": [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "paid": [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        false
      ],
      "links": [],
      "imp": [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
      ]
    },
    {
      "id": "inc-3",
      "name": "Freelance job",
      "group": "SIDE INCOME",
      "amounts": [
        340,
        0,
        520,
        0,
        410,
        0,
        600,
        380,
        0,
        450,
        0,
        0
      ],
      "bank": "MA",
      "pay": "TR",
      "dueDay": "15",
      "end": null,
      "estimated": false,
      "note": "",
      "notes": [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "paid": [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        false
      ],
      "links": [
        {
          "name": "Google",
          "url": "https://google.de"
        }
      ],
      "imp": [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
      ]
    },
    {
      "id": "inc-4",
      "name": "Tax refund",
      "group": "SIDE INCOME",
      "amounts": [
        0,
        0,
        0,
        612.4,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ],
      "bank": "MA",
      "pay": "TR",
      "dueDay": "5",
      "end": null,
      "estimated": false,
      "note": "",
      "notes": [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "paid": [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        false
      ],
      "links": [],
      "imp": [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
      ]
    },
    {
      "id": "f-1",
      "name": "Rent",
      "group": "HOME",
      "amounts": [
        -1180,
        -1180,
        -1180,
        -1180,
        -1180,
        -1180,
        -1180,
        -1180,
        -1180,
        -1180,
        -1180,
        -1180
      ],
      "bank": "MA",
      "pay": "DD",
      "dueDay": "1",
      "end": null,
      "estimated": false,
      "note": "Index review every January.",
      "notes": [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "paid": [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        false,
        false
      ],
      "links": [],
      "imp": [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
      ]
    },
    {
      "id": "f-2",
      "name": "Electricity",
      "group": "HOME",
      "amounts": [
        -88,
        -88,
        -88,
        -88,
        -88,
        -88,
        -88,
        -88,
        -88,
        -88,
        -88,
        -88
      ],
      "bank": "MA",
      "pay": "DD",
      "dueDay": "3",
      "end": null,
      "estimated": true,
      "note": "",
      "notes": [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "paid": [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        false
      ],
      "links": [],
      "imp": [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
      ]
    },
    {
      "id": "f-3",
      "name": "Internet & phone",
      "group": "HOME",
      "amounts": [
        -49.9,
        -49.9,
        -49.9,
        -49.9,
        -49.9,
        -49.9,
        -49.9,
        -49.9,
        -49.9,
        -49.9,
        -49.9,
        -49.9
      ],
      "bank": "MA",
      "pay": "DD",
      "dueDay": "8",
      "end": null,
      "estimated": false,
      "note": "",
      "notes": [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "paid": [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        false
      ],
      "links": [],
      "imp": [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
      ]
    },
    {
      "id": "f-4",
      "name": "Building fee",
      "group": "HOME",
      "amounts": [
        -64,
        -64,
        -64,
        -64,
        -64,
        -64,
        -64,
        -64,
        -64,
        -64,
        -64,
        -64
      ],
      "bank": "MA",
      "pay": "DD",
      "dueDay": "1",
      "end": null,
      "estimated": false,
      "note": "",
      "notes": [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "paid": [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        false
      ],
      "links": [],
      "imp": [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
      ]
    },
    {
      "id": "f-5",
      "name": "Car loan",
      "group": "CAR",
      "amounts": [
        -243.55,
        -243.55,
        -243.55,
        -243.55,
        -243.55,
        -243.55,
        -243.55,
        -243.55,
        -243.55,
        -243.55,
        -243.55,
        -243.55
      ],
      "bank": "MA",
      "pay": "DD",
      "dueDay": "15",
      "end": {
        "m": 4,
        "y": 2027
      },
      "estimated": false,
      "note": "",
      "notes": [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "paid": [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        false
      ],
      "links": [],
      "imp": [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
      ]
    },
    {
      "id": "f-6",
      "name": "Car tax",
      "group": "CAR",
      "amounts": [
        0,
        0,
        -186,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ],
      "bank": "MA",
      "pay": "TR",
      "dueDay": "20",
      "end": null,
      "estimated": false,
      "note": "",
      "notes": [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "paid": [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        false
      ],
      "links": [],
      "imp": [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
      ]
    },
    {
      "id": "f-7",
      "name": "Winter tyres",
      "group": "CAR",
      "amounts": [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        -410,
        0,
        0
      ],
      "bank": "CC",
      "pay": "CC",
      "dueDay": "",
      "end": null,
      "estimated": true,
      "note": "",
      "notes": [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "paid": [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        false
      ],
      "links": [],
      "imp": [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
      ]
    },
    {
      "id": "f-8",
      "name": "Health insurance",
      "group": "INSURANCE",
      "amounts": [
        -212,
        -212,
        -212,
        -212,
        -212,
        -212,
        -212,
        -212,
        -212,
        -212,
        -212,
        -212
      ],
      "bank": "MA",
      "pay": "DD",
      "dueDay": "2",
      "end": null,
      "estimated": false,
      "note": "",
      "notes": [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "paid": [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        false
      ],
      "links": [],
      "imp": [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
      ]
    },
    {
      "id": "f-9",
      "name": "Liability cover",
      "group": "INSURANCE",
      "amounts": [
        0,
        0,
        0,
        0,
        -96,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ],
      "bank": "MA",
      "pay": "DD",
      "dueDay": "12",
      "end": null,
      "estimated": false,
      "note": "",
      "notes": [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "paid": [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        false
      ],
      "links": [],
      "imp": [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
      ]
    },
    {
      "id": "f-10",
      "name": "Household cover",
      "group": "INSURANCE",
      "amounts": [
        0,
        -142,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ],
      "bank": "MA",
      "pay": "DD",
      "dueDay": "9",
      "end": null,
      "estimated": false,
      "note": "",
      "notes": [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "paid": [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        false
      ],
      "links": [],
      "imp": [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
      ]
    },
    {
      "id": "f-11",
      "name": "Streaming",
      "group": "SUBSCRIPTIONS",
      "amounts": [
        -17.99,
        -17.99,
        -17.99,
        -17.99,
        -17.99,
        -17.99,
        -17.99,
        -17.99,
        -17.99,
        -17.99,
        -17.99,
        -17.99
      ],
      "bank": "CC",
      "pay": "CC",
      "dueDay": "11",
      "end": null,
      "estimated": false,
      "note": "",
      "notes": [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "paid": [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        false
      ],
      "links": [],
      "imp": [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
      ]
    },
    {
      "id": "f-12",
      "name": "Music",
      "group": "SUBSCRIPTIONS",
      "amounts": [
        -10.99,
        -10.99,
        -10.99,
        -10.99,
        -10.99,
        -10.99,
        -10.99,
        -10.99,
        -10.99,
        -10.99,
        -10.99,
        -10.99
      ],
      "bank": "CC",
      "pay": "CC",
      "dueDay": "11",
      "end": null,
      "estimated": false,
      "note": "",
      "notes": [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "paid": [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        false
      ],
      "links": [],
      "imp": [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
      ]
    },
    {
      "id": "f-13",
      "name": "Cloud storage",
      "group": "SUBSCRIPTIONS",
      "amounts": [
        -2.99,
        -2.99,
        -2.99,
        -2.99,
        -2.99,
        -2.99,
        -2.99,
        -2.99,
        -2.99,
        -2.99,
        -2.99,
        -2.99
      ],
      "bank": "CC",
      "pay": "CC",
      "dueDay": "22",
      "end": null,
      "estimated": false,
      "note": "",
      "notes": [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "paid": [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        false
      ],
      "links": [],
      "imp": [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
      ]
    },
    {
      "id": "f-14",
      "name": "Gym",
      "group": "SUBSCRIPTIONS",
      "amounts": [
        -34.9,
        -34.9,
        -34.9,
        -34.9,
        -34.9,
        -34.9,
        0,
        0,
        0,
        0,
        0,
        0
      ],
      "bank": "MA",
      "pay": "DD",
      "dueDay": "5",
      "end": {
        "m": 6,
        "y": 2026
      },
      "estimated": false,
      "note": "",
      "notes": [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "paid": [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        false
      ],
      "links": [],
      "imp": [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
      ]
    },
    {
      "id": "f-15",
      "name": "Newspaper",
      "group": "SUBSCRIPTIONS",
      "amounts": [
        -13.4,
        -13.4,
        -13.4,
        -13.4,
        -13.4,
        -13.4,
        -13.4,
        -13.4,
        -13.4,
        -13.4,
        -13.4,
        -13.4
      ],
      "bank": "MA",
      "pay": "DD",
      "dueDay": "25",
      "end": null,
      "estimated": false,
      "note": "",
      "notes": [
        "",
        "",
        "",
        "",
        "Price goes up from June.",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "paid": [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        false
      ],
      "links": [],
      "imp": [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
      ]
    },
    {
      "id": "ijyl8ksd",
      "name": "Groceries",
      "group": "EVERYDAY",
      "amounts": [
        -608.58,
        -555.06,
        -229.64,
        -534.32,
        -530.37,
        -699.84,
        -240.27,
        -539.41,
        -577,
        -545.31,
        -574.41,
        -572.74
      ],
      "estimated": true,
      "note": "",
      "notes": [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "links": [],
      "paid": [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        false
      ],
      "imp": [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        false,
        false,
        false,
        false,
        false
      ],
      "bank": "",
      "pay": "",
      "dueDay": "",
      "end": null,
      "impRows": {
        "1": [
          {
            "d": "12.01.26",
            "v": -107.13,
            "x": "Market"
          },
          {
            "d": "26.01.26",
            "v": -90.3,
            "x": "Bakery"
          },
          {
            "d": "03.01.26",
            "v": -158.24,
            "x": "Bakery"
          },
          {
            "d": "22.01.26",
            "v": -92.39,
            "x": "Supermarket"
          },
          {
            "d": "23.01.26",
            "v": -160.52,
            "x": "Bakery"
          }
        ],
        "2": [
          {
            "d": "20.02.26",
            "v": -147.56,
            "x": "Supermarket"
          },
          {
            "d": "19.02.26",
            "v": -149.41,
            "x": "Supermarket"
          },
          {
            "d": "12.02.26",
            "v": -86.82,
            "x": "Market"
          },
          {
            "d": "28.02.26",
            "v": -171.27,
            "x": "Supermarket"
          }
        ],
        "3": [
          {
            "d": "04.03.26",
            "v": -67.43,
            "x": "Bakery"
          },
          {
            "d": "25.03.26",
            "v": -70.19,
            "x": "Supermarket"
          },
          {
            "d": "06.03.26",
            "v": -92.02,
            "x": "Bakery"
          }
        ],
        "4": [
          {
            "d": "17.04.26",
            "v": -109.01,
            "x": "Market"
          },
          {
            "d": "23.04.26",
            "v": -88.92,
            "x": "Bakery"
          },
          {
            "d": "18.04.26",
            "v": -94.5,
            "x": "Bakery"
          },
          {
            "d": "08.04.26",
            "v": -89.31,
            "x": "Market"
          },
          {
            "d": "09.04.26",
            "v": -87.96,
            "x": "Market"
          },
          {
            "d": "07.04.26",
            "v": -64.62,
            "x": "Bakery"
          }
        ],
        "5": [
          {
            "d": "18.05.26",
            "v": -99.34,
            "x": "Market"
          },
          {
            "d": "23.05.26",
            "v": -84.07,
            "x": "Bakery"
          },
          {
            "d": "02.05.26",
            "v": -152.68,
            "x": "Market"
          },
          {
            "d": "03.05.26",
            "v": -131.71,
            "x": "Bakery"
          },
          {
            "d": "21.05.26",
            "v": -62.57,
            "x": "Supermarket"
          }
        ],
        "6": [
          {
            "d": "10.06.26",
            "v": -121.26,
            "x": "Supermarket"
          },
          {
            "d": "06.06.26",
            "v": -93.8,
            "x": "Bakery"
          },
          {
            "d": "09.06.26",
            "v": -95.16,
            "x": "Bakery"
          },
          {
            "d": "18.06.26",
            "v": -61.57,
            "x": "Bakery"
          },
          {
            "d": "10.06.26",
            "v": -120.9,
            "x": "Supermarket"
          },
          {
            "d": "01.06.26",
            "v": -105.07,
            "x": "Bakery"
          },
          {
            "d": "16.06.26",
            "v": -102.08,
            "x": "Bakery"
          }
        ],
        "7": [
          {
            "d": "11.07.26",
            "v": -81.84,
            "x": "Bakery"
          },
          {
            "d": "23.07.26",
            "v": -78.16,
            "x": "Bakery"
          },
          {
            "d": "05.07.26",
            "v": -80.27,
            "x": "Supermarket"
          }
        ]
      }
    },
    {
      "id": "i23tbcof",
      "name": "Fuel",
      "group": "EVERYDAY",
      "amounts": [
        -262.81,
        -192.61,
        -165.87,
        -200,
        -188.48,
        -207.19,
        -182,
        -168.27,
        -121.9,
        -196.27,
        -131.32,
        -176.83
      ],
      "estimated": true,
      "note": "",
      "notes": [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "links": [],
      "paid": [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        false
      ],
      "imp": [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        false,
        false,
        false,
        false,
        false
      ],
      "bank": "",
      "pay": "",
      "dueDay": "",
      "end": null,
      "impRows": {
        "1": [
          {
            "d": "27.01.26",
            "v": -17.86,
            "x": "Charging"
          },
          {
            "d": "13.01.26",
            "v": -33.99,
            "x": "Charging"
          },
          {
            "d": "15.01.26",
            "v": -51.03,
            "x": "Charging"
          },
          {
            "d": "04.01.26",
            "v": -39.92,
            "x": "Charging"
          },
          {
            "d": "25.01.26",
            "v": -47.71,
            "x": "Charging"
          },
          {
            "d": "08.01.26",
            "v": -42.37,
            "x": "Charging"
          },
          {
            "d": "28.01.26",
            "v": -29.93,
            "x": "Charging"
          }
        ],
        "2": [
          {
            "d": "21.02.26",
            "v": -30.43,
            "x": "Charging"
          },
          {
            "d": "20.02.26",
            "v": -18.32,
            "x": "Charging"
          },
          {
            "d": "04.02.26",
            "v": -27.37,
            "x": "Charging"
          },
          {
            "d": "15.02.26",
            "v": -17.86,
            "x": "Charging"
          },
          {
            "d": "03.02.26",
            "v": -27.1,
            "x": "Petrol"
          },
          {
            "d": "11.02.26",
            "v": -44.28,
            "x": "Charging"
          },
          {
            "d": "23.02.26",
            "v": -27.25,
            "x": "Petrol"
          }
        ],
        "3": [
          {
            "d": "24.03.26",
            "v": -45.45,
            "x": "Charging"
          },
          {
            "d": "24.03.26",
            "v": -27.69,
            "x": "Petrol"
          },
          {
            "d": "06.03.26",
            "v": -21.77,
            "x": "Petrol"
          },
          {
            "d": "19.03.26",
            "v": -50.55,
            "x": "Charging"
          },
          {
            "d": "05.03.26",
            "v": -20.41,
            "x": "Charging"
          }
        ],
        "4": [
          {
            "d": "13.04.26",
            "v": -29.09,
            "x": "Charging"
          },
          {
            "d": "22.04.26",
            "v": -32.68,
            "x": "Petrol"
          },
          {
            "d": "07.04.26",
            "v": -28.73,
            "x": "Charging"
          },
          {
            "d": "25.04.26",
            "v": -20.77,
            "x": "Petrol"
          }
        ],
        "5": [
          {
            "d": "28.05.26",
            "v": -45.68,
            "x": "Petrol"
          },
          {
            "d": "28.05.26",
            "v": -47.06,
            "x": "Petrol"
          },
          {
            "d": "11.05.26",
            "v": -27.96,
            "x": "Charging"
          },
          {
            "d": "09.05.26",
            "v": -18.69,
            "x": "Petrol"
          },
          {
            "d": "23.05.26",
            "v": -49.09,
            "x": "Petrol"
          }
        ],
        "6": [
          {
            "d": "08.06.26",
            "v": -23.07,
            "x": "Petrol"
          },
          {
            "d": "27.06.26",
            "v": -45.13,
            "x": "Petrol"
          },
          {
            "d": "19.06.26",
            "v": -41.42,
            "x": "Petrol"
          },
          {
            "d": "10.06.26",
            "v": -29.83,
            "x": "Charging"
          },
          {
            "d": "03.06.26",
            "v": -23.61,
            "x": "Petrol"
          },
          {
            "d": "23.06.26",
            "v": -23.04,
            "x": "Charging"
          },
          {
            "d": "24.06.26",
            "v": -21.09,
            "x": "Charging"
          }
        ],
        "7": [
          {
            "d": "09.07.26",
            "v": -47.56,
            "x": "Petrol"
          },
          {
            "d": "22.07.26",
            "v": -22.37,
            "x": "Charging"
          },
          {
            "d": "17.07.26",
            "v": -33.72,
            "x": "Charging"
          },
          {
            "d": "15.07.26",
            "v": -27.64,
            "x": "Petrol"
          },
          {
            "d": "18.07.26",
            "v": -17.86,
            "x": "Petrol"
          },
          {
            "d": "03.07.26",
            "v": -32.85,
            "x": "Charging"
          }
        ]
      }
    },
    {
      "id": "inp60ppx",
      "name": "Eating out",
      "group": "LEISURE",
      "amounts": [
        -59.13,
        -152.95,
        -139.66,
        -127.41,
        -62.37,
        -92.68,
        -52.84,
        -130.21,
        -116.18,
        -154.98,
        -155.23,
        -143.52
      ],
      "estimated": true,
      "note": "",
      "notes": [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "links": [],
      "paid": [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        false
      ],
      "imp": [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        false,
        false,
        false,
        false,
        false
      ],
      "bank": "",
      "pay": "",
      "dueDay": "",
      "end": null,
      "impRows": {
        "1": [
          {
            "d": "13.01.26",
            "v": -30.01,
            "x": "Coffee"
          },
          {
            "d": "27.01.26",
            "v": -14.46,
            "x": "Coffee"
          },
          {
            "d": "09.01.26",
            "v": -14.66,
            "x": "Coffee"
          }
        ],
        "2": [
          {
            "d": "17.02.26",
            "v": -38.23,
            "x": "Coffee"
          },
          {
            "d": "18.02.26",
            "v": -30.93,
            "x": "Restaurant"
          },
          {
            "d": "10.02.26",
            "v": -15.9,
            "x": "Restaurant"
          },
          {
            "d": "09.02.26",
            "v": -16.72,
            "x": "Coffee"
          },
          {
            "d": "12.02.26",
            "v": -14.2,
            "x": "Restaurant"
          },
          {
            "d": "25.02.26",
            "v": -19.37,
            "x": "Coffee"
          },
          {
            "d": "20.02.26",
            "v": -17.6,
            "x": "Restaurant"
          }
        ],
        "3": [
          {
            "d": "18.03.26",
            "v": -30.49,
            "x": "Restaurant"
          },
          {
            "d": "26.03.26",
            "v": -38.36,
            "x": "Restaurant"
          },
          {
            "d": "05.03.26",
            "v": -19.48,
            "x": "Coffee"
          },
          {
            "d": "07.03.26",
            "v": -13.45,
            "x": "Restaurant"
          },
          {
            "d": "07.03.26",
            "v": -37.88,
            "x": "Coffee"
          }
        ],
        "4": [
          {
            "d": "05.04.26",
            "v": -31.11,
            "x": "Coffee"
          },
          {
            "d": "04.04.26",
            "v": -27.79,
            "x": "Coffee"
          },
          {
            "d": "06.04.26",
            "v": -14.44,
            "x": "Restaurant"
          },
          {
            "d": "14.04.26",
            "v": -30.24,
            "x": "Coffee"
          },
          {
            "d": "07.04.26",
            "v": -23.83,
            "x": "Coffee"
          }
        ],
        "5": [
          {
            "d": "09.05.26",
            "v": -13.61,
            "x": "Restaurant"
          },
          {
            "d": "10.05.26",
            "v": -29.36,
            "x": "Coffee"
          },
          {
            "d": "07.05.26",
            "v": -19.4,
            "x": "Coffee"
          }
        ],
        "6": [
          {
            "d": "20.06.26",
            "v": -25.5,
            "x": "Restaurant"
          },
          {
            "d": "27.06.26",
            "v": -36.78,
            "x": "Coffee"
          },
          {
            "d": "26.06.26",
            "v": -16.21,
            "x": "Restaurant"
          },
          {
            "d": "25.06.26",
            "v": -14.19,
            "x": "Restaurant"
          }
        ],
        "7": [
          {
            "d": "03.07.26",
            "v": -25.33,
            "x": "Coffee"
          },
          {
            "d": "13.07.26",
            "v": -13.39,
            "x": "Restaurant"
          },
          {
            "d": "07.07.26",
            "v": -14.12,
            "x": "Restaurant"
          }
        ]
      }
    },
    {
      "id": "ip2hn8y4",
      "name": "Household",
      "group": "EVERYDAY",
      "amounts": [
        -86.04,
        -57.07,
        -107.91,
        -89.64,
        -106.87,
        -95.99,
        -113.85,
        -69.08,
        -105.47,
        -79.05,
        -82.98,
        -54.99
      ],
      "estimated": true,
      "note": "",
      "notes": [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "links": [],
      "paid": [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        false
      ],
      "imp": [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        false,
        false,
        false,
        false,
        false
      ],
      "bank": "",
      "pay": "",
      "dueDay": "",
      "end": null,
      "impRows": {
        "1": [
          {
            "d": "13.01.26",
            "v": -11.98,
            "x": "Drugstore"
          },
          {
            "d": "06.01.26",
            "v": -21.76,
            "x": "Drugstore"
          },
          {
            "d": "08.01.26",
            "v": -19.35,
            "x": "Drugstore"
          },
          {
            "d": "19.01.26",
            "v": -14.38,
            "x": "Drugstore"
          },
          {
            "d": "01.01.26",
            "v": -18.57,
            "x": "Drugstore"
          }
        ],
        "2": [
          {
            "d": "24.02.26",
            "v": -10.75,
            "x": "Drugstore"
          },
          {
            "d": "16.02.26",
            "v": -20.24,
            "x": "Hardware"
          },
          {
            "d": "01.02.26",
            "v": -11.51,
            "x": "Hardware"
          },
          {
            "d": "07.02.26",
            "v": -14.57,
            "x": "Hardware"
          }
        ],
        "3": [
          {
            "d": "19.03.26",
            "v": -19.13,
            "x": "Hardware"
          },
          {
            "d": "14.03.26",
            "v": -18.66,
            "x": "Drugstore"
          },
          {
            "d": "24.03.26",
            "v": -25.26,
            "x": "Hardware"
          },
          {
            "d": "22.03.26",
            "v": -10.14,
            "x": "Hardware"
          },
          {
            "d": "17.03.26",
            "v": -10.67,
            "x": "Drugstore"
          },
          {
            "d": "17.03.26",
            "v": -13.73,
            "x": "Drugstore"
          },
          {
            "d": "25.03.26",
            "v": -10.32,
            "x": "Drugstore"
          }
        ],
        "4": [
          {
            "d": "12.04.26",
            "v": -23.92,
            "x": "Drugstore"
          },
          {
            "d": "15.04.26",
            "v": -16.91,
            "x": "Hardware"
          },
          {
            "d": "13.04.26",
            "v": -11.77,
            "x": "Hardware"
          },
          {
            "d": "10.04.26",
            "v": -13.92,
            "x": "Drugstore"
          },
          {
            "d": "26.04.26",
            "v": -23.12,
            "x": "Drugstore"
          }
        ],
        "5": [
          {
            "d": "06.05.26",
            "v": -14.17,
            "x": "Hardware"
          },
          {
            "d": "01.05.26",
            "v": -16.73,
            "x": "Hardware"
          },
          {
            "d": "01.05.26",
            "v": -26.38,
            "x": "Drugstore"
          },
          {
            "d": "08.05.26",
            "v": -13.97,
            "x": "Hardware"
          },
          {
            "d": "27.05.26",
            "v": -23.37,
            "x": "Hardware"
          },
          {
            "d": "18.05.26",
            "v": -12.25,
            "x": "Hardware"
          }
        ],
        "6": [
          {
            "d": "23.06.26",
            "v": -10.91,
            "x": "Drugstore"
          },
          {
            "d": "02.06.26",
            "v": -24.21,
            "x": "Drugstore"
          },
          {
            "d": "04.06.26",
            "v": -12.46,
            "x": "Hardware"
          },
          {
            "d": "18.06.26",
            "v": -10.61,
            "x": "Drugstore"
          },
          {
            "d": "21.06.26",
            "v": -12.56,
            "x": "Drugstore"
          },
          {
            "d": "01.06.26",
            "v": -14.32,
            "x": "Hardware"
          },
          {
            "d": "24.06.26",
            "v": -10.92,
            "x": "Drugstore"
          }
        ],
        "7": [
          {
            "d": "24.07.26",
            "v": -24,
            "x": "Hardware"
          },
          {
            "d": "05.07.26",
            "v": -9.75,
            "x": "Hardware"
          },
          {
            "d": "23.07.26",
            "v": -10.21,
            "x": "Hardware"
          },
          {
            "d": "16.07.26",
            "v": -19.37,
            "x": "Hardware"
          },
          {
            "d": "01.07.26",
            "v": -26.99,
            "x": "Hardware"
          },
          {
            "d": "13.07.26",
            "v": -11.99,
            "x": "Hardware"
          },
          {
            "d": "14.07.26",
            "v": -11.54,
            "x": "Hardware"
          }
        ]
      }
    },
    {
      "id": "iho3aj8i",
      "name": "Gifts",
      "group": "LEISURE",
      "amounts": [
        -62.8,
        -61.85,
        -82.61,
        -32.19,
        -74.05,
        -86.41,
        -72.4,
        -60.88,
        -96.86,
        -46.54,
        -38.83,
        -54.16
      ],
      "estimated": true,
      "note": "",
      "notes": [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      "links": [],
      "paid": [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        false
      ],
      "imp": [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        false,
        false,
        false,
        false,
        false
      ],
      "bank": "",
      "pay": "",
      "dueDay": "",
      "end": null,
      "impRows": {
        "1": [
          {
            "d": "20.01.26",
            "v": -9.67,
            "x": "Presents"
          },
          {
            "d": "23.01.26",
            "v": -6.88,
            "x": "Presents"
          },
          {
            "d": "28.01.26",
            "v": -10.45,
            "x": "Presents"
          },
          {
            "d": "13.01.26",
            "v": -11.13,
            "x": "Presents"
          },
          {
            "d": "13.01.26",
            "v": -10.19,
            "x": "Presents"
          },
          {
            "d": "07.01.26",
            "v": -14.48,
            "x": "Presents"
          }
        ],
        "2": [
          {
            "d": "24.02.26",
            "v": -7.64,
            "x": "Presents"
          },
          {
            "d": "12.02.26",
            "v": -6.87,
            "x": "Presents"
          },
          {
            "d": "08.02.26",
            "v": -13.88,
            "x": "Presents"
          },
          {
            "d": "07.02.26",
            "v": -14.35,
            "x": "Presents"
          },
          {
            "d": "20.02.26",
            "v": -8.9,
            "x": "Presents"
          },
          {
            "d": "21.02.26",
            "v": -10.21,
            "x": "Presents"
          }
        ],
        "3": [
          {
            "d": "26.03.26",
            "v": -19.84,
            "x": "Presents"
          },
          {
            "d": "16.03.26",
            "v": -14.87,
            "x": "Presents"
          },
          {
            "d": "11.03.26",
            "v": -9.47,
            "x": "Presents"
          },
          {
            "d": "04.03.26",
            "v": -7.79,
            "x": "Presents"
          },
          {
            "d": "09.03.26",
            "v": -13.36,
            "x": "Presents"
          },
          {
            "d": "17.03.26",
            "v": -7.86,
            "x": "Presents"
          },
          {
            "d": "25.03.26",
            "v": -9.42,
            "x": "Presents"
          }
        ],
        "4": [
          {
            "d": "09.04.26",
            "v": -17.12,
            "x": "Presents"
          },
          {
            "d": "06.04.26",
            "v": -7.11,
            "x": "Presents"
          },
          {
            "d": "27.04.26",
            "v": -7.96,
            "x": "Presents"
          }
        ],
        "5": [
          {
            "d": "07.05.26",
            "v": -12.38,
            "x": "Presents"
          },
          {
            "d": "27.05.26",
            "v": -11.87,
            "x": "Presents"
          },
          {
            "d": "12.05.26",
            "v": -11.05,
            "x": "Presents"
          },
          {
            "d": "01.05.26",
            "v": -7.48,
            "x": "Presents"
          },
          {
            "d": "09.05.26",
            "v": -8.89,
            "x": "Presents"
          },
          {
            "d": "03.05.26",
            "v": -15.08,
            "x": "Presents"
          },
          {
            "d": "22.05.26",
            "v": -7.3,
            "x": "Presents"
          }
        ],
        "6": [
          {
            "d": "24.06.26",
            "v": -17.67,
            "x": "Presents"
          },
          {
            "d": "03.06.26",
            "v": -13.29,
            "x": "Presents"
          },
          {
            "d": "25.06.26",
            "v": -13.61,
            "x": "Presents"
          },
          {
            "d": "21.06.26",
            "v": -13.68,
            "x": "Presents"
          },
          {
            "d": "13.06.26",
            "v": -10.06,
            "x": "Presents"
          },
          {
            "d": "22.06.26",
            "v": -10.21,
            "x": "Presents"
          },
          {
            "d": "20.06.26",
            "v": -7.89,
            "x": "Presents"
          }
        ],
        "7": [
          {
            "d": "27.07.26",
            "v": -12.25,
            "x": "Presents"
          },
          {
            "d": "25.07.26",
            "v": -19.93,
            "x": "Presents"
          },
          {
            "d": "04.07.26",
            "v": -7.47,
            "x": "Presents"
          },
          {
            "d": "24.07.26",
            "v": -8.24,
            "x": "Presents"
          },
          {
            "d": "03.07.26",
            "v": -13.28,
            "x": "Presents"
          },
          {
            "d": "28.07.26",
            "v": -11.23,
            "x": "Presents"
          }
        ]
      }
    }
  ],
  "balance": {
    "id": "balance-correction",
    "name": "Balance Correction",
    "group": "",
    "amounts": [
      -7000,
      0,
      -12.4,
      0,
      0,
      8.15,
      0,
      0,
      0,
      0,
      0,
      0
    ],
    "estimated": false,
    "note": "",
    "notes": [
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      ""
    ],
    "paid": [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false
    ],
    "bank": "",
    "pay": "",
    "dueDay": "",
    "end": null,
    "links": [],
    "imp": [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false
    ]
  },
  "flexSource": {
    "1": "fina-demo.csv",
    "2": "fina-demo.csv",
    "3": "fina-demo.csv",
    "4": "fina-demo.csv",
    "5": "fina-demo.csv",
    "6": "fina-demo.csv",
    "7": "fina-demo.csv",
    "8": null,
    "9": null,
    "10": null,
    "11": null,
    "12": null
  },
  "labWidth": 250,
  "monWidth": 100,
  "topMin": 50,
  "hideDoneMonths": false,
  "folded": {
    "in": false,
    "flex": false,
    "out": false
  },
  "foldedYear": {
    "in": false,
    "flex": false,
    "out": false
  },
  "filterFields": {
    "name": true,
    "note": true,
    "amount": true,
    "total": true,
    "meta": true
  },
  "qHidden": false,
  "updateCheck": true,
  "v": "26.9.10",
  "anaOpen": false,
  "flexGroups": [
    "(Flexibel ohne Kategorie)",
    "EVERYDAY",
    "LEISURE"
  ],
  "guideOpen": true,
  "csvMaps": {}
};
