export type ReportType =
  | 'bautagesbericht'
  | 'abnahmeprotokoll'
  | 'baustellenbegehung'
  | 'regiebericht'
  | 'einsatzbericht'
  | 'bedenkenanzeige'
  | 'berichtsheft'
  | 'besprechungsprotokoll'
  | 'checkliste';

export interface ImageAttachment {
  id: string;
  name: string;
  dataUrl: string;
  timestamp: string;
}

export interface AllgemeineInformationen {
  projekt: string;
  adresse?: string;
  datum: string;
  erstellt_von: string;
  wetter?: string;
  temperatur?: string;
}

export interface Leistung {
  beschreibung: string;
  menge?: string;
  einheit?: string;
  dauer?: string;
}

export interface Material {
  bezeichnung: string;
  menge?: string;
  einheit?: string;
}

export interface Geraet {
  bezeichnung: string;
  einsatzdauer?: string;
}

export interface BaseReport {
  berichtstyp: ReportType;
  allgemeine_informationen: AllgemeineInformationen;
  mitarbeiter: string[];
  arbeitszeiten?: {
    von?: string;
    bis?: string;
    pause?: string;
    gesamt?: string;
  };
  leistungen: Leistung[];
  materialien: Material[];
  geraete: Geraet[];
  bilder: ImageAttachment[];
  besondere_vorkommnisse: string;
  notizen?: string;
  status: 'entwurf' | 'vollstaendig' | 'bestaetigt';
  vollstaendigkeit: number;
}

export interface Bautagesbericht extends BaseReport {
  berichtstyp: 'bautagesbericht';
}

export interface Abnahmeprotokoll extends BaseReport {
  berichtstyp: 'abnahmeprotokoll';
  maengel: Array<{
    beschreibung: string;
    schweregrad: 'leicht' | 'mittel' | 'schwer';
    frist?: string;
  }>;
  vorbehalte?: string;
  ergebnis: 'abgenommen' | 'abgenommen_mit_maengeln' | 'nicht_abgenommen' | '';
}

export interface Baustellenbegehung extends BaseReport {
  berichtstyp: 'baustellenbegehung';
  sicherheit: string;
  fortschritt: string;
  festgestellte_maengel: string[];
}

export interface Regiebericht extends BaseReport {
  berichtstyp: 'regiebericht';
  auftraggeber: string;
  stunden_details: Array<{
    mitarbeiter: string;
    stunden: string;
    taetigkeit: string;
  }>;
  zuschlaege?: string;
}

export interface Einsatzbericht extends BaseReport {
  berichtstyp: 'einsatzbericht';
  stoerung_beschreibung: string;
  massnahmen: string;
  ergebnis: string;
}

export interface Bedenkenanzeige extends BaseReport {
  berichtstyp: 'bedenkenanzeige';
  bedenken_gegen: string;
  hinweis: string;
  geforderte_massnahme: string;
}

export interface Berichtsheft extends BaseReport {
  berichtstyp: 'berichtsheft';
  ausbildungsinhalte: string[];
  unterweisungen?: string[];
  abteilung?: string;
}

export interface Besprechungsprotokoll extends BaseReport {
  berichtstyp: 'besprechungsprotokoll';
  teilnehmer: Array<{ name: string; rolle?: string }>;
  tagesordnung: string[];
  beschluesse: string[];
  naechste_schritte?: string[];
}

export interface Checkliste extends BaseReport {
  berichtstyp: 'checkliste';
  kategorie: string;
  pruefpunkte: Array<{
    punkt: string;
    status: 'ok' | 'mangel' | 'nicht_geprueft';
    kommentar?: string;
  }>;
}

export type Report =
  | Bautagesbericht
  | Abnahmeprotokoll
  | Baustellenbegehung
  | Regiebericht
  | Einsatzbericht
  | Bedenkenanzeige
  | Berichtsheft
  | Besprechungsprotokoll
  | Checkliste;

export interface FollowUpQuestion {
  id: string;
  frage: string;
  typ: 'fehlend' | 'plausibilitaet' | 'unklar';
  quick_replies?: string[];
}

export interface DetectedProblem {
  id: string;
  typ: 'mangel' | 'lieferverzug' | 'sicherheit' | 'leistungsaenderung' | 'wetterunterbrechung';
  beschreibung: string;
  vorgeschlagene_aktionen: Array<{
    typ: 'foto' | 'chef_benachrichtigen' | 'separater_bericht' | 'bedenkenanzeige';
    label: string;
  }>;
}

export interface GeminiAnalysisResult {
  report: Report;
  questions: FollowUpQuestion[];
  problems: DetectedProblem[];
}

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  bautagesbericht: 'Bautagesbericht',
  abnahmeprotokoll: 'Abnahmeprotokoll',
  baustellenbegehung: 'Baustellenbegehung',
  regiebericht: 'Regiebericht',
  einsatzbericht: 'Einsatzbericht',
  bedenkenanzeige: 'Bedenkenanzeige (VOB/B §4)',
  berichtsheft: 'Berichtsheft',
  besprechungsprotokoll: 'Besprechungsprotokoll',
  checkliste: 'Checkliste',
};
