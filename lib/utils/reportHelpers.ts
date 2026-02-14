import { Report } from '@/lib/types/report';

export function getReportStats(report: Report): string {
  const parts: string[] = [];

  if (report.mitarbeiter.length > 0) {
    parts.push(`${report.mitarbeiter.length} Mitarbeiter`);
  }
  if (report.arbeitszeiten?.gesamt) {
    parts.push(report.arbeitszeiten.gesamt);
  }
  if (report.leistungen.length > 0) {
    parts.push(`${report.leistungen.length} Leistungen`);
  }
  if (report.materialien.length > 0) {
    parts.push(`${report.materialien.length} Materialien`);
  }
  if (report.geraete.length > 0) {
    parts.push(`${report.geraete.length} Geräte`);
  }
  if (report.besondere_vorkommnisse) {
    parts.push('1 Besonderheit');
  }

  return parts.join(' · ');
}

export function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
