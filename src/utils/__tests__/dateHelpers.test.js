import { formatDate, calculateNextWatering } from '../dateHelpers';

describe('dateHelpers', () => {
  describe('formatDate', () => {
    it('sollte ein Datum korrekt im deutschen Format formatieren', () => {
      const testDate = new Date('2025-11-17');
      const formatted = formatDate(testDate, 'de-DE');
      
      expect(formatted).toBe('17. November 2025');
    });

    it('sollte das Standard-Locale de-DE verwenden wenn kein Locale angegeben wird', () => {
      const testDate = new Date('2025-12-25');
      const formatted = formatDate(testDate);
      
      // Prüfe ob es ein deutsches Datumsformat ist
      expect(formatted).toContain('Dezember');
      expect(formatted).toContain('2025');
    });
  });

  describe('calculateNextWatering', () => {
    it('sollte das nächste Gießdatum korrekt berechnen', () => {
      const lastWatered = new Date('2025-11-17');
      const intervalDays = 3;
      
      const nextWatering = calculateNextWatering(lastWatered, intervalDays);
      
      // Erwartetes Datum: 20. November 2025
      expect(nextWatering.getDate()).toBe(20);
      expect(nextWatering.getMonth()).toBe(10); // November (0-basiert)
      expect(nextWatering.getFullYear()).toBe(2025);
    });

    it('sollte auch über Monatsgrenzen hinweg korrekt rechnen', () => {
      const lastWatered = new Date('2025-11-28');
      const intervalDays = 5;
      
      const nextWatering = calculateNextWatering(lastWatered, intervalDays);
      
      // Erwartetes Datum: 3. Dezember 2025
      expect(nextWatering.getDate()).toBe(3);
      expect(nextWatering.getMonth()).toBe(11); // Dezember (0-basiert)
      expect(nextWatering.getFullYear()).toBe(2025);
    });

    it('sollte mit einem Intervall von 0 Tagen das gleiche Datum zurückgeben', () => {
      const lastWatered = new Date('2025-11-17');
      const intervalDays = 0;
      
      const nextWatering = calculateNextWatering(lastWatered, intervalDays);
      
      expect(nextWatering.getDate()).toBe(lastWatered.getDate());
      expect(nextWatering.getMonth()).toBe(lastWatered.getMonth());
      expect(nextWatering.getFullYear()).toBe(lastWatered.getFullYear());
    });
  });
});
