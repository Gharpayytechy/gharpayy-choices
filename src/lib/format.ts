export const inr = (n: number) => {
  if (n >= 1e7) return "₹" + (n / 1e7).toFixed(2).replace(/\.0+$/, "") + " Cr";
  if (n >= 1e5) return "₹" + (n / 1e5).toFixed(1).replace(/\.0$/, "") + "L";
  if (n >= 1000) return "₹" + (n / 1000).toFixed(0) + "k";
  return "₹" + n;
};

export const inrFull = (n: number) =>
  "₹" + n.toLocaleString("en-IN");

export const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, "-");
