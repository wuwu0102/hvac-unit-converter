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

const flowToM3sMap = {
  LPM: 1 / 60000,
  'L/s': 0.001,
  'm3/h': 1 / 3600,
  GPM: 0.0000630902
};

const dpToPaMap = {
  kPa: 1000,
  mAq: 9806.65,
  bar: 100000
};

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

function renderList(resultList, units, textByUnit) {
  resultList.innerHTML = units
    .map((unit) => `<li class="result-row"><span class="result-unit">${unit}</span><span class="result-colon">:</span><span class="result-value">${textByUnit(unit)}</span></li>`)
    .join('');
}

function updateResultRow(container, keyClass, valueClass, label, value) {
  const rows = Array.from(container.querySelectorAll('li'));
  const row = rows.find((item) => item.querySelector(`.${keyClass}`)?.textContent.trim() === label);
  const valueEl = row?.querySelector(`.${valueClass}`);
  if (valueEl) {
    valueEl.textContent = value;
  }
}

function initializeFlowVelocityCard(card) {
  const flowValueInput = card.querySelector('[data-role="fv-flow-value"]');
  const flowUnitSelect = card.querySelector('[data-role="fv-flow-unit"]');
  const pipeSizeSelect = card.querySelector('[data-role="fv-pipe-size"]');
  const result = card.querySelector('[data-role="flow-velocity-result"]');

  if (!flowValueInput || !flowUnitSelect || !pipeSizeSelect || !result) {
    return false;
  }

  function reset() {
    updateResultRow(result, 'flow-velocity-key', 'flow-velocity-value', '估算流速（m/s）', '-');
    updateResultRow(result, 'flow-velocity-key', 'flow-velocity-value', '估算流速（ft/s）', '-');
    updateResultRow(result, 'flow-velocity-key', 'flow-velocity-value', '使用管徑', '-');
    updateResultRow(result, 'flow-velocity-key', 'flow-velocity-value', '判定', '-');
  }

  function update() {
    const rawFlow = flowValueInput.value ?? '';
    const unit = flowUnitSelect.value;
    const pipeA = pipeSizeSelect.value;

    if (rawFlow.trim() === '') {
      reset();
      return;
    }

    const flowValue = Number(rawFlow);
    if (!Number.isFinite(flowValue) || flowValue <= 0) {
      reset();
      return;
    }

    const pipe = pipeSizeList.find((item) => item.a === pipeA);
    if (!pipe) {
      reset();
      return;
    }

    const flowM3s = flowValue * flowToM3sMap[unit];
    const diameterM = pipe.innerDiameterMm / 1000;
    const area = Math.PI * (diameterM ** 2) / 4;
    const velocityMs = flowM3s / area;
    const velocityFts = velocityMs * 3.28084;

    const boundary = Number.parseInt(pipe.a, 10) <= 40 ? 1.2 : 3.0;
    const judgment = velocityMs <= boundary ? '符合' : '偏高';

    updateResultRow(result, 'flow-velocity-key', 'flow-velocity-value', '估算流速（m/s）', formatNumber(velocityMs));
    updateResultRow(result, 'flow-velocity-key', 'flow-velocity-value', '估算流速（ft/s）', formatNumber(velocityFts));
    updateResultRow(result, 'flow-velocity-key', 'flow-velocity-value', '使用管徑', `${pipe.a} / ${pipe.inchDn}`);
    updateResultRow(result, 'flow-velocity-key', 'flow-velocity-value', '判定', judgment);
  }

  flowValueInput.addEventListener('input', update);
  flowUnitSelect.addEventListener('change', update);
  pipeSizeSelect.addEventListener('change', update);
  update();
  return true;
}

function initializeCoolingCard(card) {
  const flowValueInput = card.querySelector('[data-role="cooling-flow-value"]');
  const flowUnitSelect = card.querySelector('[data-role="cooling-flow-unit"]');
  const deltaTInput = card.querySelector('[data-role="cooling-delta-t"]');
  const result = card.querySelector('[data-role="cooling-result"]');

  if (!flowValueInput || !flowUnitSelect || !deltaTInput || !result) {
    return false;
  }

  function reset() {
    updateResultRow(result, 'cooling-key', 'cooling-value', '冷量（kW）', '-');
    updateResultRow(result, 'cooling-key', 'cooling-value', '冷量（RT）', '-');
    updateResultRow(result, 'cooling-key', 'cooling-value', '備註', '以水為基準粗估');
  }

  function update() {
    const rawFlow = flowValueInput.value ?? '';
    const unit = flowUnitSelect.value;
    const rawDeltaT = deltaTInput.value ?? '';

    if (rawFlow.trim() === '' || rawDeltaT.trim() === '') {
      reset();
      return;
    }

    const flowValue = Number(rawFlow);
    const deltaT = Number(rawDeltaT);

    if (!Number.isFinite(flowValue) || !Number.isFinite(deltaT) || flowValue <= 0) {
      reset();
      return;
    }

    const flowLpm = (flowValue * flowToM3sMap[unit]) * 60000;
    const kw = (flowLpm * deltaT * 4.186) / 60;
    const rt = kw / 3.517;

    updateResultRow(result, 'cooling-key', 'cooling-value', '冷量（kW）', formatNumber(kw));
    updateResultRow(result, 'cooling-key', 'cooling-value', '冷量（RT）', formatNumber(rt));
    updateResultRow(result, 'cooling-key', 'cooling-value', '備註', '以水為基準粗估');
  }

  flowValueInput.addEventListener('input', update);
  flowUnitSelect.addEventListener('change', update);
  deltaTInput.addEventListener('input', update);
  update();
  return true;
}

function initializeAhuInterpolationCard(card) {
  const point1FlowInput = card.querySelector('[data-role="ahu-p1-flow"]');
  const point1DpInput = card.querySelector('[data-role="ahu-p1-dp"]');
  const point2FlowInput = card.querySelector('[data-role="ahu-p2-flow"]');
  const point2DpInput = card.querySelector('[data-role="ahu-p2-dp"]');
  const siteDpInput = card.querySelector('[data-role="ahu-site-dp"]');
  const dpUnitSelect = card.querySelector('[data-role="ahu-dp-unit"]');
  const result = card.querySelector('[data-role="ahu-interp-result"]');

  if (!point1FlowInput || !point1DpInput || !point2FlowInput || !point2DpInput || !siteDpInput || !dpUnitSelect || !result) {
    return false;
  }

  function reset() {
    updateResultRow(result, 'ahu-interp-key', 'ahu-interp-value', '估算流量（LPM）', '-');
    updateResultRow(result, 'ahu-interp-key', 'ahu-interp-value', '估算流量（L/s）', '-');
    updateResultRow(result, 'ahu-interp-key', 'ahu-interp-value', '判定', '-');
    updateResultRow(result, 'ahu-interp-key', 'ahu-interp-value', '備註', '建議使用同一台設備選機表相鄰兩點');
  }

  function update() {
    const rawP1Flow = point1FlowInput.value ?? '';
    const rawP1Dp = point1DpInput.value ?? '';
    const rawP2Flow = point2FlowInput.value ?? '';
    const rawP2Dp = point2DpInput.value ?? '';
    const rawSiteDp = siteDpInput.value ?? '';
    const unit = dpUnitSelect.value;

    if (rawP1Flow.trim() === '' || rawP1Dp.trim() === '' || rawP2Flow.trim() === '' || rawP2Dp.trim() === '' || rawSiteDp.trim() === '') {
      reset();
      return;
    }

    const p1Flow = Number(rawP1Flow);
    const p1Dp = Number(rawP1Dp);
    const p2Flow = Number(rawP2Flow);
    const p2Dp = Number(rawP2Dp);
    const siteDp = Number(rawSiteDp);

    if (!Number.isFinite(p1Flow) || !Number.isFinite(p1Dp) || !Number.isFinite(p2Flow) || !Number.isFinite(p2Dp) || !Number.isFinite(siteDp)) {
      reset();
      return;
    }

    const ratio = dpToPaMap[unit];
    const p1Pa = p1Dp * ratio;
    const p2Pa = p2Dp * ratio;
    const sitePa = siteDp * ratio;

    if (p1Pa === p2Pa) {
      reset();
      updateResultRow(result, 'ahu-interp-key', 'ahu-interp-value', '判定', '兩點壓損不可相同');
      return;
    }

    const estimatedFlowLpm = p1Flow + ((sitePa - p1Pa) * (p2Flow - p1Flow)) / (p2Pa - p1Pa);
    const estimatedFlowLs = estimatedFlowLpm / 60;

    const minPa = Math.min(p1Pa, p2Pa);
    const maxPa = Math.max(p1Pa, p2Pa);
    const isInside = sitePa >= minPa && sitePa <= maxPa;
    const judgment = isInside ? '內插估算' : '超出兩點範圍，為外推估算';

    updateResultRow(result, 'ahu-interp-key', 'ahu-interp-value', '估算流量（LPM）', formatNumber(estimatedFlowLpm));
    updateResultRow(result, 'ahu-interp-key', 'ahu-interp-value', '估算流量（L/s）', formatNumber(estimatedFlowLs));
    updateResultRow(result, 'ahu-interp-key', 'ahu-interp-value', '判定', judgment);
    updateResultRow(result, 'ahu-interp-key', 'ahu-interp-value', '備註', '建議使用同一台設備選機表相鄰兩點');
  }

  point1FlowInput.addEventListener('input', update);
  point1DpInput.addEventListener('input', update);
  point2FlowInput.addEventListener('input', update);
  point2DpInput.addEventListener('input', update);
  siteDpInput.addEventListener('input', update);
  dpUnitSelect.addEventListener('change', update);
  update();
  return true;
}

function initializeCard(card) {
  const type = card?.dataset?.type || 'unknown';

  if (type === 'flow-velocity') {
    return initializeFlowVelocityCard(card);
  }

  if (type === 'flow-delta-t-cooling') {
    return initializeCoolingCard(card);
  }

  if (type === 'ahu-interp') {
    return initializeAhuInterpolationCard(card);
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
