// Indian compact currency formatter: K (thousand), L (Lakh = 100,000), Cr (Crore = 10,000,000)
export function formatCompactINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount as number)) return "₹0";
  const n = Number(amount);
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";

  const trim = (v: number) => {
    // up to 2 decimals, strip trailing zeros
    const s = v.toFixed(2);
    return s.replace(/\.?0+$/, "");
  };

  if (abs >= 1_00_00_000) return `${sign}₹${trim(abs / 1_00_00_000)} Cr`;
  if (abs >= 1_00_000) return `${sign}₹${trim(abs / 1_00_000)} L`;
  if (abs >= 1_000) return `${sign}₹${trim(abs / 1_000)} K`;
  return `${sign}₹${abs.toLocaleString("en-IN")}`;
}

export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "₹0";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}
