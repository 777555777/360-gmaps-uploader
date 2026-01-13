# DSGVO/GDPR-Konformität - Rate Limiting & Geocoding

## Überblick

Die Geocoding-API verarbeitet IP-Adressen zum Zweck des Rate Limitings. Dieses Dokument erklärt die DSGVO-Konformität.

## Rechtsgrundlage (Art. 6 DSGVO)

**Art. 6 Abs. 1 lit. f DSGVO** - Berechtigtes Interesse:

- **Zweck**: Schutz vor Missbrauch und Überlastung der Infrastruktur
- **Erforderlichkeit**: Rate Limiting ist technisch notwendig zur Sicherstellung des Dienstes
- **Interessenabwägung**: Das Interesse an Systemstabilität überwiegt das Interesse an vollständiger Anonymität

Alternative Rechtsgrundlage falls User angemeldet ist:

- **Art. 6 Abs. 1 lit. b DSGVO** - Vertragserfüllung

## Technische Schutzmaßnahmen (Art. 32 DSGVO)

### 1. IP-Pseudonymisierung

```typescript
// IPs werden NIEMALS im Klartext gespeichert
const hash = hashIP(clientIP); // SHA-256 Hash mit täglichem Salt
```

**Eigenschaften:**

- SHA-256 mit täglichem Salt (rotiert um Mitternacht UTC)
- Nur erste 16 Zeichen gespeichert (ausreichend für Kollisionsvermeidung)
- Keine Rückführung auf Original-IP möglich
- Automatische "Löschung" durch Salt-Rotation

### 2. Minimale Speicherdauer

- **Minute-Limit**: Max. 60 Sekunden
- **Tages-Limit**: Max. 24 Stunden
- **Automatische Löschung**: Cleanup alle 5 Minuten
- **Salt-Rotation**: Täglich um 00:00 UTC (macht alte Hashes ungültig)

### 3. Keine Persistenz

- In-Memory Speicherung (Map)
- Kein Database-Logging
- Server-Neustart = vollständige Löschung

### 4. Anonymisierte Logs

```typescript
// FALSCH (DSGVO-Verstoß):
console.log(`IP 192.168.1.1 approaching limit`);

// RICHTIG (DSGVO-konform):
console.log(`Client approaching limit: ${remaining} remaining`);
```

## Informationspflichten (Art. 13 DSGVO)

### Datenschutzerklärung - Textvorschlag

```markdown
### Geocoding-Service & Rate Limiting

**Verarbeitete Daten:** IP-Adresse (pseudonymisiert via Hash)
**Zweck:** Schutz vor Missbrauch, Sicherstellung der Verfügbarkeit
**Rechtsgrundlage:** Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)
**Speicherdauer:**

- Minute-Limit: 60 Sekunden
- Tages-Limit: 24 Stunden
- Automatische Löschung danach

**Technische Schutzmaßnahmen:**

- SHA-256 Pseudonymisierung
- Tägliche Salt-Rotation
- In-Memory Speicherung (keine Datenbank)
- Keine Weitergabe an Dritte

**Ihre Rechte:** Auskunft, Löschung, Widerspruch nach Art. 15-21 DSGVO  
Kontakt: [Ihre Datenschutz-E-Mail]
```

## Betroffenenrechte

### Auskunftsrecht (Art. 15 DSGVO)

**Problem**: Hash kann nicht rückgeführt werden → keine Auskunft über spezifische Einträge möglich

**Antwort-Template**:

> "Ihre IP-Adresse wird ausschließlich pseudonymisiert (gehashed) zur Verhinderung von Missbrauch gespeichert. Eine Zuordnung zu Ihrer Person ist technisch nicht möglich, daher können wir keine spezifischen Daten über Sie ausweisen. Die maximale Speicherdauer beträgt 24 Stunden."

### Löschungsrecht (Art. 17 DSGVO)

**Umsetzung**:

- Automatische Löschung innerhalb 24h
- Manuelle Löschung nicht erforderlich (Hash-basiert)

**Optional**: Admin-Funktion zum Löschen aller Entries:

```typescript
// In rate-limiter.ts
export function clearAllRateLimits() {
	geocodingRateLimiter.destroy();
	dailyRateLimiter.destroy();
	geocodingCache.clear();
}
```

### Widerspruchsrecht (Art. 21 DSGVO)

**Hinweis**: Bei Widerspruch gegen Rate Limiting kann Service nicht genutzt werden (Art. 6(1)(f) erfordert Abwägung)

## Verzeichnis von Verarbeitungstätigkeiten (Art. 30 DSGVO)

**Eintrag für internes Verzeichnis:**

| Feld                 | Wert                                |
| -------------------- | ----------------------------------- |
| Verarbeitungszweck   | Rate Limiting / Missbrauchsschutz   |
| Datenkategorien      | IP-Adressen (pseudonymisiert)       |
| Betroffene           | Website-Besucher (Geocoding-Nutzer) |
| Empfänger            | Keine (interne Verarbeitung)        |
| Speicherdauer        | Max. 24 Stunden                     |
| Technische Maßnahmen | SHA-256, Salt-Rotation, In-Memory   |
| Rechtsgrundlage      | Art. 6(1)(f) DSGVO                  |

## Drittland-Transfer (Art. 44-49 DSGVO)

### MapTiler API

**Problem**: MapTiler ist in der Schweiz ansässig → kein Drittland-Transfer (Schweiz hat Angemessenheitsbeschluss)

**Falls anderer Provider**:

- Standardvertragsklauseln (SCCs)
- Auftragsverarbeitungsvertrag (AVV)

## Weitere Best Practices

### 1. Environment-Variable für Origins

```bash
# .env
VITE_ALLOWED_ORIGINS=https://example.com,https://www.example.com
```

### 2. Monitoring ohne personenbezogene Daten

```typescript
// Nur aggregierte Stats
const stats = getRateLimiterStats();
// → { activeIdentifiers: 42, maxRequests: 20 }
// KEINE IPs, KEINE User-Zuordnung
```

### 3. Security Headers

```typescript
headers: {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': 'max-age=31536000'
}
```

## Checkliste DSGVO-Konformität

- [x] Rechtsgrundlage dokumentiert (Art. 6(1)(f))
- [x] IP-Pseudonymisierung implementiert
- [x] Minimale Speicherdauer (24h max.)
- [x] Keine Logs mit IPs
- [x] Datenschutzerklärung aktualisiert
- [x] Verzeichnis von Verarbeitungstätigkeiten ergänzt
- [ ] **TODO**: Datenschutzerklärung auf Website einpflegen
- [ ] **TODO**: Cookie-Banner (falls weitere Tracking-Tools genutzt werden)
- [ ] **TODO**: Kontakt-Formular für Betroffenenanfragen einrichten

## Fragen & Antworten

**Q: Muss ich Consent (Einwilligung) einholen?**  
A: Nein, Rate Limiting basiert auf berechtigtem Interesse (Art. 6(1)(f)). Consent wäre Art. 6(1)(a) und wäre hier unverhältnismäßig.

**Q: Was passiert bei DSGVO-Anfrage?**  
A: Siehe Templates oben. Wichtig: Hash kann nicht rückgeführt werden, daher Verweis auf automatische Löschung.

**Q: Brauche ich einen Datenschutzbeauftragten?**  
A: Abhängig von Unternehmensgröße. Bei <20 Mitarbeitern in der Regel nein (außer Kerntätigkeit ist Datenverarbeitung).

**Q: Was ist mit Server-Logs (nginx/Apache)?**  
A: Server-Logs sind separate Verarbeitung! Auch hier IPs anonymisieren oder kürzen:

```nginx
# nginx.conf
log_format anonymized '$remote_addr_anonymized $request ...';
map $remote_addr $remote_addr_anonymized {
    ~(?P<ip>\d+\.\d+\.\d+)\.\d+ $ip.0;
    ~(?P<ip>[^:]+:[^:]+): $ip::;
}
```

## Weitere Ressourcen

- [DSGVO-Portal.de - Rate Limiting](https://dsgvo-portal.de)
- [Datenschutzkonferenz - Orientierungshilfen](https://www.datenschutzkonferenz-online.de)
- [EDPB Guidelines on legitimate interest](https://edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-32019-processing-personal-data-through-video_en)
