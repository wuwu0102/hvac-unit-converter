const PIPE_SIZE_OPTIONS = [
  { code: '15A', label: '1/2" / DN15', innerDiameterMm: 15.8 },
  { code: '20A', label: '3/4" / DN20', innerDiameterMm: 20.9 },
  { code: '25A', label: '1" / DN25', innerDiameterMm: 26.6 },
  { code: '32A', label: '1-1/4" / DN32', innerDiameterMm: 35.1 },
  { code: '40A', label: '1-1/2" / DN40', innerDiameterMm: 40.9 },
  { code: '50A', label: '2" / DN50', innerDiameterMm: 52.5 },
  { code: '65A', label: '2-1/2" / DN65', innerDiameterMm: 62.7 },
  { code: '80A', label: '3" / DN80', innerDiameterMm: 77.9 },
  { code: '100A', label: '4" / DN100', innerDiameterMm: 102.3 },
  { code: '125A', label: '5" / DN125', innerDiameterMm: 128.2 },
  { code: '150A', label: '6" / DN150', innerDiameterMm: 154.1 },
  { code: '200A', label: '8" / DN200', innerDiameterMm: 202.7 },
  { code: '250A', label: '10" / DN250', innerDiameterMm: 254.5 },
  { code: '300A', label: '12" / DN300', innerDiameterMm: 303.2 },
  { code: '350A', label: '14" / DN350', innerDiameterMm: 333.3 },
  { code: '400A', label: '16" / DN400', innerDiameterMm: 381.0 }
];

function getRecommendedPipeForFlow(flowRateLpm, velocityMs = 2) {
  if (!Number.isFinite(flowRateLpm) || flowRateLpm <= 0) return null;
  const flowM3s = flowRateLpm / 1000 / 60;
  const requiredArea = flowM3s / Math.max(velocityMs, 0.1);
  const requiredDiameter = Math.sqrt((4 * requiredArea) / Math.PI) * 1000;
  return PIPE_SIZE_OPTIONS.find((pipe) => pipe.innerDiameterMm >= requiredDiameter) || PIPE_SIZE_OPTIONS[PIPE_SIZE_OPTIONS.length - 1];
}

window.PIPE_SIZE_OPTIONS = PIPE_SIZE_OPTIONS;
window.getRecommendedPipeForFlow = getRecommendedPipeForFlow;
