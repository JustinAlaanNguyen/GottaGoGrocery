// utils/formatFraction.ts
export function formatQuantity(value: string | number): string {
  if (!value) return "";

  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return value.toString();

  // Round to nearest 1/8 (you can adjust precision: 1/16, 1/4, etc.)
  const precision = 8;
  const rounded = Math.round(num * precision) / precision;

  const whole = Math.floor(rounded);
  const fraction = rounded - whole;

  const fractionMap: { [key: number]: string } = {
    0: "",
    0.125: "⅛",
    0.25: "¼",
    0.333: "⅓",
    0.375: "⅜",
    0.5: "½",
    0.625: "⅝",
    0.667: "⅔",
    0.75: "¾",
    0.875: "⅞",
  };

  // Find closest fraction key
  let closestFraction = "";
  let minDiff = 1;
  for (const [decimal, symbol] of Object.entries(fractionMap)) {
    const diff = Math.abs(parseFloat(decimal) - fraction);
    if (diff < minDiff) {
      minDiff = diff;
      closestFraction = symbol;
    }
  }

  if (whole === 0 && closestFraction) return closestFraction;
  if (whole > 0 && closestFraction) return `${whole} ${closestFraction}`;
  return `${whole}`;
}
