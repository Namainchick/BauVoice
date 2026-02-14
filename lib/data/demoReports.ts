import { SavedReport } from '@/lib/utils/storage';

export const DEMO_REPORTS: SavedReport[] = [
  {
    id: 'demo_bautagesbericht',
    savedAt: new Date().toISOString(),
    questions: [],
    problems: [],
    report: {
      berichtstyp: 'bautagesbericht',
      allgemeine_informationen: {
        projekt: 'BV Müller — Dachsanierung',
        adresse: 'Hauptstraße 12, 22767 Hamburg',
        datum: new Date().toISOString().split('T')[0],
        erstellt_von: 'Thomas Weber',
        wetter: 'Sonnig',
        temperatur: '12°C',
      },
      mitarbeiter: ['Thomas Weber', 'Kevin Schmitt', 'Markus Braun'],
      arbeitszeiten: { von: '07:00', bis: '16:00', pause: '30 Minuten', gesamt: '8,5 Stunden' },
      leistungen: [
        { beschreibung: 'Dampfsperre verlegt', menge: '35', einheit: 'm²', dauer: '3 Stunden' },
        { beschreibung: 'Dachlatten montiert', menge: '120', einheit: 'lfm', dauer: '4 Stunden' },
      ],
      materialien: [
        { bezeichnung: 'Dampfsperrfolie', menge: '2', einheit: 'Rollen' },
        { bezeichnung: 'Dachlatten 30x50mm', menge: '50', einheit: 'Stück' },
        { bezeichnung: 'Schrauben 4,5x60', menge: '1', einheit: 'Paket' },
      ],
      geraete: [{ bezeichnung: 'Akkuschrauber Makita', einsatzdauer: '6 Stunden' }],
      bilder: [],
      besondere_vorkommnisse: 'Riss an der Südwand festgestellt — muss vom Statiker geprüft werden.',
      notizen: null,
      status: 'bestaetigt',
      vollstaendigkeit: 85,
    },
  },
  {
    id: 'demo_regiebericht',
    savedAt: new Date(Date.now() - 86400000).toISOString(),
    questions: [
      {
        id: 'q1',
        frage: 'Welches Material wurde für den Durchbruch verbraucht?',
        typ: 'fehlend',
        quick_replies: ['Kein Material', 'Mörtel + Putz', 'Nur Werkzeug'],
      },
    ],
    problems: [],
    report: {
      berichtstyp: 'regiebericht',
      allgemeine_informationen: {
        projekt: 'Umbau Gewerbe — Becker GmbH',
        adresse: 'Industrieweg 5, 20537 Hamburg',
        datum: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        erstellt_von: 'Thomas Weber',
        wetter: null,
        temperatur: null,
      },
      auftraggeber: 'Becker GmbH',
      stunden_details: [
        { mitarbeiter: 'Thomas Weber', stunden: '3', taetigkeit: 'Wanddurchbruch vergrößert' },
        { mitarbeiter: 'Kevin Schmitt', stunden: '2', taetigkeit: 'Schutt entsorgt und aufgeräumt' },
      ],
      zuschlaege: null,
      mitarbeiter: ['Thomas Weber', 'Kevin Schmitt'],
      arbeitszeiten: { von: '09:00', bis: '14:00', pause: '30 Minuten', gesamt: '5 Stunden' },
      leistungen: [
        { beschreibung: 'Wanddurchbruch vergrößert (nicht im Angebot)', menge: '1', einheit: 'Stück', dauer: '3 Stunden' },
      ],
      materialien: [],
      geraete: [{ bezeichnung: 'Bohrhammer Hilti', einsatzdauer: '2 Stunden' }],
      bilder: [],
      besondere_vorkommnisse: 'Zusatzauftrag vom Bauherrn — nicht im ursprünglichen Angebot enthalten.',
      notizen: null,
      status: 'entwurf',
      vollstaendigkeit: 60,
    } as any,
  },
  {
    id: 'demo_abnahmeprotokoll',
    savedAt: new Date(Date.now() - 172800000).toISOString(),
    questions: [],
    problems: [
      {
        id: 'p1',
        typ: 'mangel',
        beschreibung: 'Fehlende Silikonfuge am Küchenfenster — leichter Mangel, Nachbesserung nötig.',
        vorgeschlagene_aktionen: [
          { typ: 'foto', label: 'Foto aufnehmen' },
          { typ: 'chef_benachrichtigen', label: 'Chef informieren' },
        ],
      },
    ],
    report: {
      berichtstyp: 'abnahmeprotokoll',
      allgemeine_informationen: {
        projekt: 'Badsanierung — Familie Meier',
        adresse: 'Elbchaussee 89, 22763 Hamburg',
        datum: new Date(Date.now() - 172800000).toISOString().split('T')[0],
        erstellt_von: 'Thomas Weber',
        wetter: null,
        temperatur: null,
      },
      maengel: [
        { beschreibung: 'Silikonfuge am Küchenfenster fehlt', schweregrad: 'leicht', frist: '2 Wochen' },
      ],
      vorbehalte: 'Abnahme unter Vorbehalt der Mängelbeseitigung',
      ergebnis: 'abgenommen_mit_maengeln',
      mitarbeiter: ['Thomas Weber'],
      arbeitszeiten: { von: '10:00', bis: '11:30', pause: null, gesamt: '1,5 Stunden' },
      leistungen: [
        { beschreibung: 'Abnahmebegehung Bad und Küche', menge: null, einheit: null, dauer: '1,5 Stunden' },
      ],
      materialien: [],
      geraete: [],
      bilder: [],
      besondere_vorkommnisse: 'Kunde grundsätzlich zufrieden. Silikonfuge wird nächste Woche nachgebessert.',
      notizen: null,
      status: 'bestaetigt',
      vollstaendigkeit: 90,
    } as any,
  },
];

export const DEMO_TRANSCRIPT = `Heute war ich mit Kevin und Markus auf der Baustelle Müller in der Hauptstraße 12.
Wir haben von 7 bis 16 Uhr gearbeitet, eine halbe Stunde Pause gemacht.
Wir haben 35 Quadratmeter Dampfsperre verlegt und die Dachlatten montiert.
Verbraucht haben wir 2 Rollen Dampfsperrfolie und 50 Dachlatten.
Das Wetter war sonnig, ungefähr 12 Grad.
An der Südwand ist uns ein Riss aufgefallen, das sollte man sich nochmal anschauen.`;
