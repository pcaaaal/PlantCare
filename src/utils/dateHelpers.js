/**
 * Formatiert ein Datum zu einem lesbaren String
 * @param {Date} date - Das zu formatierende Datum
 * @param {string} locale - Optionales Locale (Standard: 'de-DE')
 * @returns {string} Formatierter Datumstring
 */
export const formatDate = (date, locale = 'de-DE') => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(locale, options);
};

/**
 * Berechnet das nächste Gießdatum basierend auf einem Intervall
 * @param {Date} lastWatered - Letztes Gießdatum
 * @param {number} intervalDays - Intervall in Tagen
 * @returns {Date} Nächstes Gießdatum
 */
export const calculateNextWatering = (lastWatered, intervalDays) => {
  const nextDate = new Date(lastWatered);
  nextDate.setDate(nextDate.getDate() + intervalDays);
  return nextDate;
};
