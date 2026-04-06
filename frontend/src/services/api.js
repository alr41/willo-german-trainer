// frontend/src/services/api.js

const API_URL = "http://127.0.0.1:8000/api";


export async function getVocabQuestion(level, seen = []) {
  try {
    const seenParam = seen.length > 0 ? `&seen=${seen.join(",")}` : "";
    const response = await fetch(`${API_URL}/word/quiz?level=${level}${seenParam}`);
    if (!response.ok) throw new Error("No words found");
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
}


export async function submitVocabAnswer(wordId, userChoice, mode, lives) {
  const payload = {
    word_id: wordId,
    answer: userChoice,
    mode: mode,
    lives: lives
  };

  const response = await fetch(`${API_URL}/answer/translation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return await response.json();
}


export async function getArticleWord(level) {
  try {
    const response = await fetch(`${API_URL}/word/article?level=${level}`);
    if (!response.ok) throw new Error("No words found");
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
}

export async function submitArticleAnswer(wordId, userChoice, mode, lives) {
  const payload = {
    word_id: wordId,
    answer: userChoice,
    mode: mode,
    lives: lives
  };

  const response = await fetch(`${API_URL}/answer/article`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return await response.json();
}


export const getStatsSummary = async () => {
  try {
    const response = await fetch(`${API_URL}/stats/summary`);
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
  } catch (error) {
    console.error("Error fetching stats summary:", error);
    return [];
  }
};

export const getLevelStats = async (levelName) => {
  try {
    const response = await fetch(`${API_URL}/stats/level/${levelName}`);
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
  } catch (error) {
    console.error("Error fetching level stats:", error);
    return { top: [], bottom: [] };
  }
};
