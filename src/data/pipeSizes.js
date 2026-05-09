(function initPipeSizes(global) {
  // Web V1.1 production pipe table (15A~400A).
  const PIPE_SIZES = [
    ['15A', 15.8], ['20A', 20.9], ['25A', 26.6], ['32A', 35.1], ['40A', 40.9],
    ['50A', 52.5], ['65A', 62.7], ['80A', 77.9], ['100A', 102.3], ['125A', 128.2],
    ['150A', 154.1], ['200A', 202.7], ['250A', 254.5], ['300A', 303.2], ['350A', 333.3], ['400A', 381.0]
  ].map(([a, innerDiameterMm]) => ({ a, innerDiameterMm }));

  function areaM2(innerDiameterMm) {
    const m = innerDiameterMm / 1000;
    return Math.PI * m * m / 4;
  }

  function getRecommendedPipeForFlow(flowLpm, designVelocityMs = 3) {
    const flowM3s = flowLpm / 60000;
    for (const pipe of PIPE_SIZES) {
      const velocity = flowM3s / areaM2(pipe.innerDiameterMm);
      if (velocity <= designVelocityMs) return { pipe, velocity };
    }
    return null;
  }

  global.PipeSizes = { PIPE_SIZES, getRecommendedPipeForFlow };
})(window);
