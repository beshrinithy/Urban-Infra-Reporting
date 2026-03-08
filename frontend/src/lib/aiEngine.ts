// This function now calls the Python AI Backend
import { API_URL } from './config';

export async function analyzeIssue(description: string, existingDescriptions: string[] = []) {
  try {
    // 1. Detect Duplicates
    let duplicateScore = 0;
    try {
      const dupRes = await fetch(`${API_URL}/api/ai/detect/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          new_issue: description,
          existing_issues: existingDescriptions
        }),
      });
      const dupData = await dupRes.json();
      duplicateScore = dupData.score || 0;
      console.log("Duplicate Score:", duplicateScore);
    } catch (e) {
      console.error("Duplicate detection failed:", e);
    }

    // 2. Predict Category
    const catRes = await fetch(`${API_URL}/api/ai/predict/category`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });
    const catData = await catRes.json();

    // 3. Predict Priority (using real duplicate score)
    // Note: If duplicate score is high, we might want to INCREASE priority (many people reporting same thing = urgent)
    // or DECREASE (spam). The report says "Duplicate complaints... flooding system".
    // However, usually high volume = High Urgency for things like 'Fire'.
    // Let's assume the Python `priority_scoring.py` logic handles this (it adds +2 for duplicates > 3).
    // But we are passing a float score (0.0 - 1.0) here vs a count. 
    // Let's normalize: if score > 0.8, we treat it as "High Duplicate Count equivalent".

    const simulatedDupCount = duplicateScore > 0.75 ? 5 : 0;

    const prioRes = await fetch(`${API_URL}/api/ai/predict/priority`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: catData.category || "Other",
        duplicate_count: simulatedDupCount,
        description,
      }),
    });
    const prioData = await prioRes.json();

    const category = catData.category || "Other";
    const initialPriority = prioData.priority || "Low";

    // Feature 5: Department Routing
    const deptMap: Record<string, string> = {
      "Road": "Roads & Transport", "Pothole": "Roads & Transport", "Traffic": "Traffic Police",
      "Water": "Water Board", "Pipe": "Water Board", "Leak": "Water Board",
      "Garbage": "Sanitation Dept", "Trash": "Sanitation Dept", "Clean": "Sanitation Dept",
      "Electricity": "Electricity Board", "Light": "Electricity Board", "Wire": "Electricity Board",
      "Fire": "Fire Dept", "Flood": "Disaster Mgmt", "Accident": "Emergency Services"
    };
    const department = deptMap[category] || "General Administration";

    // Feature 4: Enhanced Severity (Keyword Extraction)
    let severity = initialPriority === "High" ? "High" : (initialPriority === "Medium" ? "Moderate" : "Low");
    const descLower = description.toLowerCase();

    // Critical Keywords Override
    if (descLower.includes("fire") || descLower.includes("explosion") || descLower.includes("smoke") || descLower.includes("blood") || descLower.includes("collapsed")) {
      severity = "Critical";
    } else if (descLower.includes("blocked") || descLower.includes("flood") || descLower.includes("danger") || descLower.includes("spark")) {
      severity = "High";
    }

    const summary =
      description.length > 100
        ? description.slice(0, 100) + "..."
        : description;

    return {
      category,
      priority: severity === "Critical" ? "High" : initialPriority, // Critical is always High priority
      severity,
      department, // New Field
      confidence: 0.85,
      summary,
      isDuplicate: duplicateScore > 0.75,
      duplicateScore
    };
  } catch (error) {
    console.error("AI Service Error:", error);
    // Fallback
    return {
      category: "Uncategorized",
      priority: "Low",
      severity: "Low",
      department: "General Administration",
      confidence: 0.0,
      summary: description,
      isDuplicate: false,
      duplicateScore: 0
    };
  }
}
