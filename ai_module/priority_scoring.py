def calculate_priority(category, duplicate_count, description):
    score = 0

    if category in ["Road", "Electricity", "Water"]:
        score += 2

    if duplicate_count > 3:
        score += 2

    urgent_keywords = ["accident", "danger", "emergency", "blocked"]
    if any(word in description.lower() for word in urgent_keywords):
        score += 3

    if score >= 5:
        return "High"
    elif score >= 3:
        return "Medium"
    else:
        return "Low"