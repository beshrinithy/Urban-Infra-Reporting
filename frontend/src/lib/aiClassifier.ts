export function classifyIssue(description: string) {
  const text = description.toLowerCase();

  if (text.includes("road")) return { category: "Road", priority: "High" };
  if (text.includes("garbage")) return { category: "Garbage", priority: "Medium" };
  if (text.includes("water")) return { category: "Water", priority: "High" };

  return { category: "Other", priority: "Low" };
}
