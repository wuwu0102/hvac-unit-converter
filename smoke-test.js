const fs = require('fs');
const assert = require('assert');
const pipeSizes = require('./src/data/pipeSizes.js');

const app = fs.readFileSync('app.js', 'utf8');

assert(pipeSizes.getRecommendedPipeForFlow(5000, 3).label === '200A', '5000 LPM should map to 200A');
assert(Number.isFinite(pipeSizes.getRecommendedPipeForFlow(5000, 3).velocityMs), 'velocityMs should be finite');
assert(pipeSizes.getPipeSizeById('200A').label === '200A', '200A should map to DN200 entry');
assert(app.includes('FEEDBACK_FORM_URL'), 'app.js should include FEEDBACK_FORM_URL');
assert(app.includes('FEEDBACK_MAILTO'), 'app.js should include FEEDBACK_MAILTO');
assert(app.includes('function initFeedbackTool() {'), 'initFeedbackTool should have non-empty body');
assert(!app.includes('function initFeedbackTool(){}'), 'initFeedbackTool must not be empty');

assert(app.includes('Google Form 回饋'), 'feedback page should include Google Form 回饋');
assert(app.includes('Email 備援回饋'), 'feedback page should include Email 備援回饋');
assert(!app.includes('Google Form 回饋Email 備援回饋'), 'feedback ui must not be plain concatenated text links');
const styles = fs.readFileSync('styles.css', 'utf8');
assert(
  app.includes('feedback-actions') || app.includes('menu-button') || styles.includes('feedback-actions') || styles.includes('menu-button') || styles.includes('feedback-button'),
  'feedback should use styled feedback button classes'
);

console.log('smoke ok');
