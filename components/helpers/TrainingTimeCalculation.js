export const calculateDuration = (start, end) => {
  if (!start || !end) return "N/A";

  const startDate = new Date(start);
  const endDate = new Date(end);

  // Différence en millisecondes
  const diffTime = Math.abs(endDate - startDate);

  // Conversion en jours
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return "1 jour";
  return `${diffDays} jours`;
};
