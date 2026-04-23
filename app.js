const conversionMap = {
  temp: {
    toBase(value, fromUnit) {
      return fromUnit === 'C' ? value : (value - 32) * (5 / 9);
    },
    fromBase(value, toUnit) {
      return toUnit === 'C' ? value : value * (9 / 5) + 32;
    }
  },
  airflow: {
    toBase(value, fromUnit) {
      const toM3s = {
        CFM: 0.000471947,
        CMH: 1 / 3600,
        'm3/s': 1,
        'L/s': 0.001,
        LPM: 1 / 60000,
        CMM: 1 / 60
      };
      return value * toM3s[fromUnit];
    },
    fromBase(value, toUnit) {
      const fromM3s = {
        CFM: 1 / 0.000471947,
        CMH: 3600,
        'm3/s': 1,
        'L/s': 1000,
        LPM: 60000,
        CMM: 60
      };
      return value * fromM3s[toUnit];
    }
  },
  pressure: {
    toBase(value, fromUnit) {
      const toPa = {
        Pa: 1,
        kPa: 1000,
        mmAq: 9.80665,
        bar: 100000,
        psi: 6894.76,
        'N/m2': 1
      };
      return value * toPa[fromUnit];
    },
    fromBase(value, toUnit) {
      const fromPa = {
        Pa: 1,
        kPa: 1 / 1000,
        mmAq: 1 / 9.80665,
        bar: 1 / 100000,
        psi: 1 / 6894.76,
        'N/m2': 1
      };
      return value * fromPa[toUnit];
    }
  },
  velocity: {
    toBase(value, fromUnit) {
      const toMs = {
        'm/s': 1,
        'ft/s': 1 / 3.28084,
        'mm/s': 1 / 1000,
        'cm/s': 1 / 100
      };
      return value * toMs[fromUnit];
    },
    fromBase(value, toUnit) {
      const fromMs = {
        'm/s': 1,
        'ft/s': 3.28084,
        'mm/s': 1000,
        'cm/s': 100
      };
      return value * fromMs[toUnit];
    }
  }
};

const unitMap = {
  airflow: ['CFM', 'CMH', 'm3/s', 'L/s', 'LPM', 'CMM'],
  pressure: ['Pa', 'kPa', 'mmAq', 'bar', 'psi', 'N/m2'],
  velocity: ['m/s', 'ft/s', 'mm/s', 'cm/s']
};

const SMALL_PIPE_MAX_VELOCITY = 1.2;
const COMMON_MIN_VELOCITY = 0.6;
const DEFAULT_GENERAL_MAX_VELOCITY = 3.0;
const WATER_DENSITY = 998;

const flowToM3sMap = {
  LPM: 1 / 60000,
  'L/s': 0.001,
  'm3/h': 1 / 3600,
  GPM: 0.0000630902
};

const dpToPaMap = {
  kPa: 1000,
  bar: 100000,
  psi: 6894.76,
  mAq: 9806.65
};


function getReasonableVelocityRangeByPipeA(pipeA) {
  const numericA = Number.parseInt(pipeA, 10);
  const minVelocity = COMMON_MIN_VELOCITY;
  const maxVelocity = numericA >= 50 ? DEFAULT_GENERAL_MAX_VELOCITY : SMALL_PIPE_MAX_VELOCITY;
  return { minVelocity, maxVelocity };
}
const pipeSizeList = [
  { a: '15A', inchDn: '1/2" / DN15', innerDiameterMm: 15.8 },
  { a: '20A', inchDn: '3/4" / DN20', innerDiameterMm: 20.9 },
  { a: '25A', inchDn: '1" / DN25', innerDiameterMm: 26.6 },
  { a: '32A', inchDn: '1-1/4" / DN32', innerDiameterMm: 35.1 },
  { a: '40A', inchDn: '1-1/2" / DN40', innerDiameterMm: 40.9 },
  { a: '50A', inchDn: '2" / DN50', innerDiameterMm: 52.5 },
  { a: '65A', inchDn: '2-1/2" / DN65', innerDiameterMm: 62.7 },
  { a: '80A', inchDn: '3" / DN80', innerDiameterMm: 77.9 },
  { a: '100A', inchDn: '4" / DN100', innerDiameterMm: 102.3 },
  { a: '125A', inchDn: '5" / DN125', innerDiameterMm: 128.2 },
  { a: '150A', inchDn: '6" / DN150', innerDiameterMm: 154.1 }
];

function formatNumber(value) {
  return Number.isFinite(value) ? value.toFixed(4) : '-';
}

function formatCompactNumber(value) {
  if (!Number.isFinite(value)) {
    return '-';
  }
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function renderList(resultList, units, textByUnit) {
  resultList.innerHTML = units
    .map((unit) => `<li class="result-row"><span class="result-unit">${unit}</span><span class="result-colon">:</span><span class="result-value">${textByUnit(unit)}</span></li>`)
    .join('');
}

function resetPipeResult(pipeResult) {
  updatePipeResultRow(pipeResult, '建議管徑', '-');
  updatePipeResultRow(pipeResult, '參考尺寸', '-');
  updatePipeResultRow(pipeResult, '估算內徑', '-');
  updatePipeResultRow(pipeResult, '估算流速', '-');
  updatePipeResultRow(pipeResult, '設計條件', '-');
  updatePipeResultRow(pipeResult, '判定', '-');
}

function updatePipeResultRow(pipeResult, label, value) {
  const rows = Array.from(pipeResult.querySelectorAll('li'));
  const row = rows.find((item) => item.querySelector('.pipe-result-key')?.textContent.trim() === label);
  const valueEl = row?.querySelector('.pipe-result-value');
  if (valueEl) {
    valueEl.textContent = value;
  }
}

function updateDpResultRow(dpResult, label, value) {
  const rows = Array.from(dpResult.querySelectorAll('li'));
  const row = rows.find((item) => item.querySelector('.dp-result-key')?.textContent.trim() === label);
  const valueEl = row?.querySelector('.dp-result-value');
  if (valueEl) {
    valueEl.textContent = value;
  }
}

function initializePipeSizingCard(card) {
  const flowInput = card.querySelector('[data-role="flow-input"]');
  const flowUnit = card.querySelector('[data-role="flow-unit"]');
  const maxVelocityInput = card.querySelector('[data-role="max-velocity-input"]');
  const pipeResult = card.querySelector('[data-role="pipe-result"]');

  if (!flowInput || !flowUnit || !maxVelocityInput || !pipeResult) {
    return false;
  }

  function updatePipeSizing() {
    const rawFlow = flowInput.value ?? '';
    const selectedUnit = flowUnit.value ?? 'LPM';
    const rawGeneralMax = maxVelocityInput.value ?? '';

    if (rawFlow.trim() === '') {
      resetPipeResult(pipeResult);
      return;
    }

    const flowValue = Number(rawFlow);
    const generalMaxVelocity = Number(rawGeneralMax || DEFAULT_GENERAL_MAX_VELOCITY);

    if (!Number.isFinite(flowValue) || flowValue <= 0 || !Number.isFinite(generalMaxVelocity) || generalMaxVelocity <= 0) {
      resetPipeResult(pipeResult);
      return;
    }

    const flowM3s = flowValue * flowToM3sMap[selectedUnit];

    const matchedPipe = pipeSizeList.find((pipe) => {
      const diameterM = pipe.innerDiameterMm / 1000;
      const area = Math.PI * (diameterM ** 2) / 4;
      const velocity = flowM3s / area;
      const { maxVelocity } = getReasonableVelocityRangeByPipeA(pipe.a);
      const maxAllowed = Number.parseInt(pipe.a, 10) >= 50 ? generalMaxVelocity : maxVelocity;
      return velocity <= maxAllowed;
    });

    const conditionText = `水 / 一般鍍鋅鋼管 / 小管徑 ${SMALL_PIPE_MAX_VELOCITY.toFixed(1)} m/s、一般上限 ${generalMaxVelocity.toFixed(1)} m/s`;

    if (!matchedPipe) {
      updatePipeResultRow(pipeResult, '建議管徑', '目前內建管徑範圍不足，請選更大管徑');
      updatePipeResultRow(pipeResult, '參考尺寸', '-');
      updatePipeResultRow(pipeResult, '估算內徑', '-');
      updatePipeResultRow(pipeResult, '估算流速', '-');
      updatePipeResultRow(pipeResult, '設計條件', conditionText);
      updatePipeResultRow(pipeResult, '判定', '不符合流速上限');
      return;
    }

    const matchedDiameterM = matchedPipe.innerDiameterMm / 1000;
    const matchedArea = Math.PI * (matchedDiameterM ** 2) / 4;
    const estimatedVelocity = flowM3s / matchedArea;

    updatePipeResultRow(pipeResult, '建議管徑', matchedPipe.a);
    updatePipeResultRow(pipeResult, '參考尺寸', matchedPipe.inchDn);
    updatePipeResultRow(pipeResult, '估算內徑', `${matchedPipe.innerDiameterMm.toFixed(1)} mm`);
    updatePipeResultRow(pipeResult, '估算流速', `${formatNumber(estimatedVelocity)} m/s`);
    updatePipeResultRow(pipeResult, '設計條件', conditionText);
    updatePipeResultRow(pipeResult, '判定', '符合流速上限');
  }

  flowInput.addEventListener('input', updatePipeSizing);
  flowUnit.addEventListener('change', updatePipeSizing);
  maxVelocityInput.addEventListener('input', updatePipeSizing);
  updatePipeSizing();

  return true;
}

function initializeDpFlowCard(card) {
  const dpInput = card.querySelector('[data-role="dp-input"]');
  const dpUnit = card.querySelector('[data-role="dp-unit"]');
  const dpRefFlow = card.querySelector('[data-role="dp-ref-flow"]');
  const dpRefPressure = card.querySelector('[data-role="dp-ref-pressure"]');
  const dpRefUnit = card.querySelector('[data-role="dp-ref-unit"]');
  const dpPipeSize = card.querySelector('[data-role="dp-pipe-size"]');
  const dpResult = card.querySelector('[data-role="dp-result"]');

  if (!dpInput || !dpUnit || !dpRefFlow || !dpRefPressure || !dpRefUnit || !dpPipeSize || !dpResult) {
    return false;
  }

  function resetDpResult() {
    updateDpResultRow(dpResult, '理想壓差粗估流量（LPM）', '-');
    updateDpResultRow(dpResult, '設備修正流量（LPM）', '-');
    updateDpResultRow(dpResult, '設備修正流量（L/s）', '-');
    updateDpResultRow(dpResult, '使用管徑', '-');
    updateDpResultRow(dpResult, '設備參考條件', '-');
    updateDpResultRow(dpResult, '判定', '-');
    updateDpResultRow(dpResult, '備註', '設備修正流量為依壓損平方關係推估，較接近實務，仍建議搭配廠商曲線確認');
  }

  function updateDpFlow() {
    const rawDp = dpInput.value ?? '';
    const rawRefFlow = dpRefFlow.value ?? '';
    const rawRefPressure = dpRefPressure.value ?? '';
    const selectedDpUnit = dpUnit.value;
    const selectedRefUnit = dpRefUnit.value;
    const selectedPipeA = dpPipeSize.value;

    if (rawDp.trim() === '' || rawRefFlow.trim() === '' || rawRefPressure.trim() === '') {
      resetDpResult();
      return;
    }

    const dpValue = Number(rawDp);
    const refFlowLpm = Number(rawRefFlow);
    const refPressureValue = Number(rawRefPressure);

    if (!Number.isFinite(dpValue) || dpValue <= 0 || !Number.isFinite(refFlowLpm) || refFlowLpm <= 0 || !Number.isFinite(refPressureValue) || refPressureValue <= 0) {
      resetDpResult();
      return;
    }

    const pipe = pipeSizeList.find((item) => item.a === selectedPipeA);
    if (!pipe) {
      resetDpResult();
      return;
    }

    const dpPa = dpValue * dpToPaMap[selectedDpUnit];
    const refDpPa = refPressureValue * dpToPaMap[selectedRefUnit];
    const velocity = Math.sqrt((2 * dpPa) / WATER_DENSITY);
    const diameterM = pipe.innerDiameterMm / 1000;
    const area = Math.PI * (diameterM ** 2) / 4;
    const idealFlowM3s = area * velocity;
    const idealFlowLpm = idealFlowM3s * 60000;

    const correctedFlowLpm = refFlowLpm * Math.sqrt(dpPa / refDpPa);
    const correctedFlowLs = correctedFlowLpm / 60;

    let judgment = '設備修正後與理想流量接近';
    if (correctedFlowLpm < idealFlowLpm * 0.7) {
      judgment = '設備阻力影響明顯，理想流量高估';
    }

    updateDpResultRow(dpResult, '理想壓差粗估流量（LPM）', formatNumber(idealFlowLpm));
    updateDpResultRow(dpResult, '設備修正流量（LPM）', formatNumber(correctedFlowLpm));
    updateDpResultRow(dpResult, '設備修正流量（L/s）', formatNumber(correctedFlowLs));
    updateDpResultRow(dpResult, '使用管徑', `${pipe.a} / ${pipe.inchDn}`);
    updateDpResultRow(dpResult, '設備參考條件', `${formatCompactNumber(refFlowLpm)} LPM @ ${formatCompactNumber(refPressureValue)} ${selectedRefUnit}`);
    updateDpResultRow(dpResult, '判定', judgment);
    updateDpResultRow(dpResult, '備註', '設備修正流量為依壓損平方關係推估，較接近實務，仍建議搭配廠商曲線確認');
  }

  dpInput.addEventListener('input', updateDpFlow);
  dpUnit.addEventListener('change', updateDpFlow);
  dpRefFlow.addEventListener('input', updateDpFlow);
  dpRefPressure.addEventListener('input', updateDpFlow);
  dpRefUnit.addEventListener('change', updateDpFlow);
  dpPipeSize.addEventListener('change', updateDpFlow);
  updateDpFlow();

  return true;
}

function initializeCard(card) {
  const type = card?.dataset?.type || 'unknown';

  if (type === 'pipe-sizing') {
    return initializePipeSizingCard(card);
  }

  if (type === 'dp-flow') {
    return initializeDpFlowCard(card);
  }

  const input = card.querySelector('input');
  const fromSelect = card.querySelector('[data-role="from-unit"]');
  const result = card.querySelector('.result');
  const resultList = card.querySelector('[data-role="result-list"]');

  if (!conversionMap[type] || !input || !fromSelect) {
    return false;
  }

  function update() {
    const raw = input.value ?? '';
    const selectedUnit = fromSelect.value ?? '';

    if (raw.trim() === '') {
      if (resultList && unitMap[type]) {
        const outputUnits = unitMap[type].filter((unit) => unit !== selectedUnit);
        renderList(resultList, outputUnits, () => '-');
      } else if (result) {
        result.textContent = '結果：-';
      }
      return;
    }

    const value = Number(raw);
    if (!Number.isFinite(value)) {
      if (resultList && unitMap[type]) {
        const outputUnits = unitMap[type].filter((unit) => unit !== selectedUnit);
        renderList(resultList, outputUnits, () => '-');
      } else if (result) {
        result.textContent = '結果：-';
      }
      return;
    }

    const converter = conversionMap[type];
    const baseValue = converter.toBase(value, selectedUnit);

    if (resultList && unitMap[type]) {
      const outputUnits = unitMap[type].filter((unit) => unit !== selectedUnit);
      renderList(resultList, outputUnits, (unit) => formatNumber(converter.fromBase(baseValue, unit)));
      return;
    }

    if (result) {
      const targetUnit = selectedUnit === 'C' ? 'F' : 'C';
      const convertedValue = converter.fromBase(baseValue, targetUnit);
      result.textContent = `${targetUnit}：${formatNumber(convertedValue)}`;
    }
  }

  input.addEventListener('input', update);
  fromSelect.addEventListener('change', update);
  update();

  return true;
}

function startApp() {
  const cards = Array.from(document.querySelectorAll('.card'));
  cards.forEach((card) => {
    initializeCard(card);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
