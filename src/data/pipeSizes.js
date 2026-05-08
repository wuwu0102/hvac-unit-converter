(function (globalScope) {
  const pipeSizes = [
    { id: 'DN15', dn: 'DN15', innerDiameterMm: 15.8 },
    { id: 'DN20', dn: 'DN20', innerDiameterMm: 20.9 },
    { id: 'DN25', dn: 'DN25', innerDiameterMm: 26.6 },
    { id: 'DN32', dn: 'DN32', innerDiameterMm: 35.1 },
    { id: 'DN40', dn: 'DN40', innerDiameterMm: 40.9 },
    { id: 'DN50', dn: 'DN50', innerDiameterMm: 52.5 },
    { id: 'DN65', dn: 'DN65', innerDiameterMm: 62.7 },
    { id: 'DN80', dn: 'DN80', innerDiameterMm: 77.9 },
    { id: 'DN100', dn: 'DN100', innerDiameterMm: 102.3 },
    { id: 'DN125', dn: 'DN125', innerDiameterMm: 128.2 },
    { id: 'DN150', dn: 'DN150', innerDiameterMm: 154.1 },
    { id: 'DN200', dn: 'DN200', innerDiameterMm: 202.7 },
    { id: 'DN250', dn: 'DN250', innerDiameterMm: 254.5 },
    { id: 'DN300', dn: 'DN300', innerDiameterMm: 303.2 },
    { id: 'DN350', dn: 'DN350', innerDiameterMm: 333.3 },
    { id: 'DN400', dn: 'DN400', innerDiameterMm: 381.0 }
  ]

  function getPipeSizeById(id) {
    return pipeSizes.find((p) => p.id === id) || null
  }

  function calculateVelocityFromLpmAndDiameter(flowRateLpm, innerDiameterMm) {
    if (!Number.isFinite(flowRateLpm) || !Number.isFinite(innerDiameterMm) || innerDiameterMm <= 0) return NaN
    const flowM3s = flowRateLpm / 1000 / 60
    const diameterM = innerDiameterMm / 1000
    const area = Math.PI * (diameterM / 2) ** 2
    return flowM3s / area
  }

  function getRecommendedPipeForFlow(flowRateLpm, maxVelocityMs = 2) {
    if (!Number.isFinite(flowRateLpm) || flowRateLpm <= 0) return null
    return pipeSizes.find((p) => calculateVelocityFromLpmAndDiameter(flowRateLpm, p.innerDiameterMm) <= maxVelocityMs) || pipeSizes[pipeSizes.length - 1]
  }

  const api = {
    pipeSizes,
    getPipeSizeById,
    calculateVelocityFromLpmAndDiameter,
    getRecommendedPipeForFlow
  }

  globalScope.PipeSizes = api
})(typeof globalThis !== 'undefined' ? globalThis : window)
