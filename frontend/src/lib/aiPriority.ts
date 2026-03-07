export function assignPriority(description: string) {
  const text = description.toLowerCase();

  if (text.includes("accident") || text.includes("water")) return "High";
  if (text.includes("garbage")) return "Medium";
  return "Low";
}
