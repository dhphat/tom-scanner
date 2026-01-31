const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwIDcM0Ni9m6sRVo1GVocDIIXznWp4hxHK7ekCcTUcG-8DWi3UQ-wtt0EDCRTnWg7Aq/exec';

export const highScoreService = {
  async fetchHighScore(): Promise<number> {
    try {
      const response = await fetch(SCRIPT_URL);
      const data = await response.json();
      return data.highScore || 0;
    } catch (error) {
      console.error('Error fetching high score:', error);
      // Fallback to local storage if available
      const saved = localStorage.getItem('tomb-scanner-high-score');
      return saved ? parseInt(saved, 10) : 0;
    }
  },

  async updateHighScore(score: number): Promise<number> {
    try {
      const response = await fetch(`${SCRIPT_URL}?score=${score}`);
      const data = await response.json();
      return data.highScore || score;
    } catch (error) {
      console.error('Error updating high score:', error);
      // Ensure local storage is updated anyway
      localStorage.setItem('tomb-scanner-high-score', score.toString());
      return score;
    }
  }
};
