# Design: KI-Output Tests

**Datum:** 2026-02-15
**Status:** Approved

## Ziel

Standalone TypeScript-Script (`scripts/test-ai.ts`) das die Gemini-Ausgaben strukturell validiert. Sequentieller mehrstufiger Flow der den echten User-Workflow simuliert.

## Architektur

- Script ausführbar via `npx tsx scripts/test-ai.ts`
- Importiert `analyzeTranscript` und `mergeFollowUp` direkt
- Jeder Test: Name + Input + strukturelle Validierungen + PASS/FAIL
- Non-deterministic AI-Output wird durch strukturelle Checks abgefangen (kein exakter Text-Vergleich)

## Test-Szenarien

### Szenario 1: Basis-Flow
1. analyzeTranscript mit Standard-Transcript
2. Validierung: Report hat Projekt, Mitarbeiter, Leistungen, Fragen vorhanden
3. Frage beantworten mit kurzem Text
4. Validierung: Beantwortete Frage weg, Info im Bericht

### Szenario 2: Merge-Korrektheit
5. Neue Info hinzufügen (Material)
6. Validierung: Material da, alte Daten intakt
7. Korrektur senden (Menge ändern)
8. Validierung: Aktualisiert statt dupliziert

### Szenario 3: Edge Cases
9. Leerer Input
10. Unsinniger Input
11. Gemischte Eingabe (Antwort + neue Info)
12. Validierung: Beide Teile verarbeitet

### Szenario 4: Fragen-Kontext
13. Mehrere Fragen → eine beantworten → nur diese verschwindet
14. Quick-Reply-Format testen

### Szenario 5: Strukturelle Robustheit
15. Arrays sind immer Arrays
16. berichtstyp ist gültiger Wert
17. vollstaendigkeit ist Zahl 0-100

## Validierungs-Helpers

- assertArray, assertString, assertNumber (mit Range)
- assertNoQuestion (keyword-basiert)
- assertHasField (tiefer Feldcheck)

## Output-Format

Farbiger Terminal-Output mit PASS/FAIL pro Test, Zusammenfassung am Ende.
