const eur = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatPrice(cents: number, isFrom = false): string {
  const value = eur.format(cents / 100);
  return isFrom ? `ab ${value}` : value;
}
