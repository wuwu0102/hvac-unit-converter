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

const dpToPaMap = {
  kPa: 1000,
  mAq: 9806.65,
  bar: 100000,
  psi: 6894.76
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

function getPipe(pipeA) {
  return pipeSizeList.find((item) => item.a === pipeA);
}

function getPipeAreaM2(pipe) {
  const diameterM = pipe.innerDiameterMm / 1000;
  return Math.PI * (diameterM ** 2) / 4;
}

function initializePipeSuggestCard(card) {
  const flowInput = card.querySelector('[data-role="pipe-flow"]');
  const result = card.querySelector('[data-role="pipe-result"]');
  if (!flowInput || !result) return false;

  function reset() {
    updateResultRow(result, 'dp-key', 'dp-value', '建議管徑', '-');
    updateResultRow(result, 'dp-key', 'dp-value', '參考流速（m/s）', '-');
  }

  function update() {
    const raw = flowInput.value ?? '';
    if (raw.trim() === '') return reset();

    const flowLpm = Number(raw);
    if (!Number.isFinite(flowLpm) || flowLpm <= 0) return reset();

    const flowM3s = flowLpm / 60000;
    const candidate = pipeSizeList.find((pipe) => {
      const velocity = flowM3s / getPipeAreaM2(pipe);
      const limit = Number.parseInt(pipe.a, 10) <= 40 ? 1.2 : 3.0;
      return velocity <= limit;
    }) || pipeSizeList[pipeSizeList.length - 1];

    const velocity = flowM3s / getPipeAreaM2(candidate);
    updateResultRow(result, 'dp-key', 'dp-value', '建議管徑', `${candidate.a} / ${candidate.inchDn}`);
    updateResultRow(result, 'dp-key', 'dp-value', '參考流速（m/s）', formatNumber(velocity));
  }

  flowInput.addEventListener('input', update);
  update();
  return true;
}

function initializeDpFlowCard(card) {
  const measuredInput = card.querySelector('[data-role="dp-measured"]');
  const measuredUnit = card.querySelector('[data-role="dp-measured-unit"]');
  const pipeSelect = card.querySelector('[data-role="dp-pipe-size"]');
  const refFlowInput = card.querySelector('[data-role="dp-ref-flow"]');
  const refLossInput = card.querySelector('[data-role="dp-ref-loss"]');
  const refLossUnit = card.querySelector('[data-role="dp-ref-loss-unit"]');
  const result = card.querySelector('[data-role="dp-result"]');

  if (!measuredInput || !measuredUnit || !pipeSelect || !refFlowInput || !refLossInput || !refLossUnit || !result) return false;

  const note = '設備修正流量為依壓損平方關係推估，較接近實務；正式值仍建議依設備選機表或實測確認。';

  function reset() {
    updateResultRow(result, 'dp-key', 'dp-value', '理想壓差粗估流量（LPM）', '-');
    updateResultRow(result, 'dp-key', 'dp-value', '設備修正流量（LPM）', '-');
    updateResultRow(result, 'dp-key', 'dp-value', '設備修正流量（L/s）', '-');
    updateResultRow(result, 'dp-key', 'dp-value', '約略流速（m/s）', '-');
    updateResultRow(result, 'dp-key', 'dp-value', '使用管徑', '-');
    updateResultRow(result, 'dp-key', 'dp-value', '判定', '-');
    updateResultRow(result, 'dp-key', 'dp-value', '備註', note);
  }

  function update() {
    const rawMeasured = measuredInput.value ?? '';
    if (rawMeasured.trim() === '') return reset();

    const measured = Number(rawMeasured);
    const refFlow = Number(refFlowInput.value ?? '');
    const refLoss = Number(refLossInput.value ?? '');
    const pipe = getPipe(pipeSelect.value);

    if (!Number.isFinite(measured) || measured <= 0 || !Number.isFinite(refFlow) || refFlow <= 0 || !Number.isFinite(refLoss) || refLoss <= 0 || !pipe) {
      return reset();
    }

    const measuredPa = measured * dpToPaMap[measuredUnit.value];
    const refDpPa = refLoss * dpToPaMap[refLossUnit.value];
    if (!Number.isFinite(measuredPa) || !Number.isFinite(refDpPa) || measuredPa <= 0 || refDpPa <= 0) {
      return reset();
    }

    const area = getPipeAreaM2(pipe);

    const idealVelocity = Math.sqrt((2 * measuredPa) / 998);
    const idealFlowM3s = area * idealVelocity;
    const idealFlowLpm = idealFlowM3s * 60000;

    const correctedFlowLpm = refFlow * Math.sqrt(measuredPa / refDpPa);
    const correctedFlowLs = correctedFlowLpm / 60;
    const correctedFlowM3s = correctedFlowLpm / 60000;
    const velocity = correctedFlowM3s / area;

    const limit = Number.parseInt(pipe.a, 10) <= 40 ? 1.2 : 3.0;
    const judgment = velocity <= limit
      ? '約略流速在建議範圍內'
      : '約略流速偏高，請確認設備資料或選用較大管徑';

    updateResultRow(result, 'dp-key', 'dp-value', '理想壓差粗估流量（LPM）', formatNumber(idealFlowLpm));
    updateResultRow(result, 'dp-key', 'dp-value', '設備修正流量（LPM）', formatNumber(correctedFlowLpm));
    updateResultRow(result, 'dp-key', 'dp-value', '設備修正流量（L/s）', formatNumber(correctedFlowLs));
    updateResultRow(result, 'dp-key', 'dp-value', '約略流速（m/s）', formatNumber(velocity));
    updateResultRow(result, 'dp-key', 'dp-value', '使用管徑', `${pipe.a} / ${pipe.inchDn}`);
    updateResultRow(result, 'dp-key', 'dp-value', '判定', judgment);
    updateResultRow(result, 'dp-key', 'dp-value', '備註', note);
  }

  [measuredInput, measuredUnit, pipeSelect, refFlowInput, refLossInput, refLossUnit].forEach((el) => {
    el.addEventListener('input', update);
    el.addEventListener('change', update);
  });

  update();
  return true;
}

function initializeAhuTempCard(card) {
  const raInput = card.querySelector('[data-role="ahu-ra"]');
  const saInput = card.querySelector('[data-role="ahu-sa"]');
  const result = card.querySelector('[data-role="ahu-temp-result"]');
  if (!raInput || !saInput || !result) return false;

  function reset() {
    updateResultRow(result, 'dp-key', 'dp-value', '溫差 ΔT（°C）', '-');
    updateResultRow(result, 'dp-key', 'dp-value', '判定', '-');
  }

  function update() {
    const ra = Number(raInput.value ?? '');
    const sa = Number(saInput.value ?? '');
    if (!Number.isFinite(ra) || !Number.isFinite(sa)) return reset();

    const delta = ra - sa;
    const judgment = delta > 0 ? '送風低於回風，方向合理' : '請確認量測點或數值';
    updateResultRow(result, 'dp-key', 'dp-value', '溫差 ΔT（°C）', formatNumber(delta));
    updateResultRow(result, 'dp-key', 'dp-value', '判定', judgment);
  }

  [raInput, saInput].forEach((el) => el.addEventListener('input', update));
  update();
  return true;
}

function initializeCard(card) {
  const type = card?.dataset?.type || 'unknown';

  if (type === 'pipe-suggest') return initializePipeSuggestCard(card);
  if (type === 'dp-flow') return initializeDpFlowCard(card);
  if (type === 'ahu-temp') return initializeAhuTempCard(card);

  const input = card.querySelector('input');
  const fromSelect = card.querySelector('[data-role="from-unit"]');
  const result = card.querySelector('.result');
  const resultList = card.querySelector('[data-role="result-list"]');

  if (!conversionMap[type] || !input || !fromSelect) return false;

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
  cards.forEach((card) => initializeCard(card));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
