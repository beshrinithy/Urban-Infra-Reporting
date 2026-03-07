from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def is_duplicate(new_issue: str, existing_issues: list, threshold: float = 0.75):
    """
    Checks if a new issue description is a duplicate of existing issues.
    Returns True if duplicate found, else False.
    """

    corpus = existing_issues + [new_issue]

    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(corpus)

    similarity_scores = cosine_similarity(tfidf_matrix[-1], tfidf_matrix[:-1])

    max_similarity = similarity_scores.max()

    return max_similarity >= threshold, max_similarity


# Example test
if __name__ == "__main__":
    existing = [
        "Garbage is not collected near the main road",
        "Pothole on highway causing traffic",
        "Water leakage near bus stand"
    ]

    new_report = "Garbage piling up near main road area"

    duplicate, score = is_duplicate(new_report, existing)
    print("Duplicate:", duplicate)
    print("Similarity Score:", score)
