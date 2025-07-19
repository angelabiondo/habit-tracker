// Global functions for HTML onclick handlers
import { app } from './appInstance.js';

export function showSection(sectionName) { app.showSection(sectionName); }
export function filterHistory() { app.filterHistory(); }
export function clearHistoryFilter() { app.clearHistoryFilter(); }
export function switchDataView(viewType) { app.switchDataView(viewType); }
export function updateDataView() { app.updateDataView(); }
export function updateSelectedChart() { app.updateSelectedChart(); }
export function switchChartMode(mode) { app.switchChartMode(mode); }
export function updateCurrentChart() { app.updateCurrentChart(); }
export function updateMultiChart() { app.updateMultiChart(); }
export function selectAllMetrics() { app.selectAllMetrics(); }
export function clearAllMetrics() { app.clearAllMetrics(); }
export function selectSkinMetrics() { app.selectSkinMetrics(); }
// Quiz Global Functions
export function startQuiz() { app.startQuiz(); }
export function nextQuestion() { app.nextQuestion(); }
export function previousQuestion() { app.previousQuestion(); }
export function saveQuizEntry() { app.saveQuizEntry(); }
export function restartQuiz() { app.restartQuiz(); }
export function updateQuizRatingValue(value) {
    document.getElementById('ratingValue').textContent = value;
}
