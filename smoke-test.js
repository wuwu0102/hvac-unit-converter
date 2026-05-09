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

console.log('smoke ok');
