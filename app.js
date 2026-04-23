const conversionMap = {
  temp: {
    toBase(value, fromUnit) {
      if (fromUnit === 'C') {
        return value;
      }
      return (value - 32) * (5 / 9);
    },
    fromBase(value, toUnit) {
      if (toUnit === 'C') {
        return value;
      }
      return value * (9 / 5) + 32;
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
        'ft/s': 1 / 3.28084
      };
      return value * toMs[fromUnit];
    },
    fromBase(value, toUnit) {
      const fromMs = {
        'm/s': 1,
        'ft/s': 3.28084
      };
      return value * fromMs[toUnit];
    }
  }
};

const unitMap = {
  airflow: ['CFM', 'CMH', 'm3/s', 'L/s', 'LPM', 'CMM'],
  pressure: ['Pa', 'kPa', 'mmAq', 'bar', 'psi', 'N/m2']
};

const WATER_PIPE_MAX_VELOCITY = 3.0;

const flowToM3sMap = {
  LPM: 1 / 60000,
  'L/s': 0.001,
  'm3/h': 1 / 3600,
  GPM: 0.0000630902
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

const debugState = {
  appLoaded: true,
  cardsInitializedCount: 0,
  lastUpdatedCard: '-',
  lastInputValue: '-',
  lastSelectedUnit: '-',
  lastError: '-'
};

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return '-';
  }
  return value.toFixed(4);
}

function renderList(resultList, units, textByUnit) {
  resultList.innerHTML = units
    .map((unit) => {
      return `<li class="result-row"><span class="result-unit">${unit}</span><span class="result-colon">:</span><span class="result-value">${textByUnit(unit)}</span></li>`;
    })
    .join('');
}

function updatePipeResultRow(pipeResult, label, value) {
  const rows = Array.from(pipeResult.querySelectorAll('li'));
  const row = rows.find((item) => {
    const key = item.querySelector('.pipe-result-key')?.textContent || '';
    return key.trim() === label;
  });

  if (!row) {
    return;
  }

  const valueEl = row.querySelector('.pipe-result-value');
  if (valueEl) {
    valueEl.textContent = value;
  }
}

function updateDebugPanel() {
  const panel = document.querySelector('[data-role="debug-panel"]');
  if (!panel) {
    return;
  }

  const appLoadedEl = panel.querySelector('[data-role="debug-app-loaded"]');
  const countEl = panel.querySelector('[data-role="debug-cards-count"]');
  const cardEl = panel.querySelector('[data-role="debug-last-card"]');
  const valueEl = panel.querySelector('[data-role="debug-last-value"]');
  const unitEl = panel.querySelector('[data-role="debug-last-unit"]');
  const errorEl = panel.querySelector('[data-role="debug-last-error"]');

  if (appLoadedEl) appLoadedEl.textContent = String(debugState.appLoaded);
  if (countEl) countEl.textContent = String(debugState.cardsInitializedCount);
  if (cardEl) cardEl.textContent = debugState.lastUpdatedCard;
  if (valueEl) valueEl.textContent = debugState.lastInputValue;
  if (unitEl) unitEl.textContent = debugState.lastSelectedUnit;
  if (errorEl) errorEl.textContent = debugState.lastError;
}

function setLastError(message) {
  debugState.lastError = message;
  updateDebugPanel();
}

function logMissingElement(type, elementName) {
  const message = `${type} card missing ${elementName}`;
  console.error(message);
  setLastError(message);
}

function initializePipeSizingCard(card) {
  const flowInput = card.querySelector('[data-role="flow-input"]');
  const flowUnit = card.querySelector('[data-role="flow-unit"]');
  const pipeResult = card.querySelector('[data-role="pipe-result"]');

  if (!flowInput) {
    logMissingElement('pipe-sizing', 'flow input');
    return false;
  }

  if (!flowUnit) {
    logMissingElement('pipe-sizing', 'flow-unit selector');
    return false;
  }

  if (!pipeResult) {
    logMissingElement('pipe-sizing', 'pipe result container');
    return false;
  }

  function updatePipeSizing() {
    const rawFlow = flowInput.value ?? '';
    const selectedUnit = flowUnit.value ?? '';

    debugState.lastUpdatedCard = 'pipe-sizing';
    debugState.lastInputValue = rawFlow === '' ? '(empty)' : rawFlow;
    debugState.lastSelectedUnit = selectedUnit || '-';
    updateDebugPanel();

    if (rawFlow.trim() === '') {
      updatePipeResultRow(pipeResult, '建議管徑', '-');
      updatePipeResultRow(pipeResult, '參考尺寸', '-');
      updatePipeResultRow(pipeResult, '估算內徑', '-');
      updatePipeResultRow(pipeResult, '估算流速', '-');
      updatePipeResultRow(pipeResult, '設計條件', '-');
      updatePipeResultRow(pipeResult, '判定', '-');
      return;
    }

    const flowValue = Number(rawFlow);

    if (!Number.isFinite(flowValue) || flowValue <= 0) {
      updatePipeResultRow(pipeResult, '建議管徑', '-');
      updatePipeResultRow(pipeResult, '參考尺寸', '-');
      updatePipeResultRow(pipeResult, '估算內徑', '-');
      updatePipeResultRow(pipeResult, '估算流速', '-');
      updatePipeResultRow(pipeResult, '設計條件', '-');
      updatePipeResultRow(pipeResult, '判定', '-');
      return;
    }

    const flowM3s = flowValue * flowToM3sMap[selectedUnit];

    const matchedPipe = pipeSizeList.find((pipe) => {
      const diameterM = pipe.innerDiameterMm / 1000;
      const area = Math.PI * (diameterM ** 2) / 4;
      const velocity = flowM3s / area;
      return velocity <= WATER_PIPE_MAX_VELOCITY;
    });

    if (!matchedPipe) {
      updatePipeResultRow(pipeResult, '建議管徑', '目前內建管徑範圍不足，請選更大管徑');
      updatePipeResultRow(pipeResult, '參考尺寸', '-');
      updatePipeResultRow(pipeResult, '估算內徑', '-');
      updatePipeResultRow(pipeResult, '估算流速', '-');
      updatePipeResultRow(pipeResult, '設計條件', `水 / 一般鍍鋅鋼管 / 最大流速 ${WATER_PIPE_MAX_VELOCITY.toFixed(1)} m/s`);
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
    updatePipeResultRow(pipeResult, '設計條件', `水 / 一般鍍鋅鋼管 / 最大流速 ${WATER_PIPE_MAX_VELOCITY.toFixed(1)} m/s`);
    updatePipeResultRow(pipeResult, '判定', '符合流速上限');
  }

  flowInput.addEventListener('input', updatePipeSizing);
  flowUnit.addEventListener('change', updatePipeSizing);
  updatePipeSizing();

  return true;
}

function initializeCard(card) {
  const type = card?.dataset?.type || 'unknown';

  if (type === 'pipe-sizing') {
    return initializePipeSizingCard(card);
  }

  const input = card.querySelector('input');
  const fromSelect = card.querySelector('[data-role="from-unit"]');
  const result = card.querySelector('.result');
  const resultList = card.querySelector('[data-role="result-list"]');

  if (!conversionMap[type]) {
    logMissingElement(type, 'valid converter');
    return false;
  }

  if (!input) {
    logMissingElement(type, 'input');
    return false;
  }

  if (!fromSelect) {
    logMissingElement(type, 'from-unit selector');
    return false;
  }

  if ((type === 'temp' || type === 'velocity') && !result) {
    logMissingElement(type, 'result');
    return false;
  }

  if ((type === 'airflow' || type === 'pressure') && !resultList) {
    logMissingElement(type, 'result-list');
    return false;
  }

  function update() {
    const raw = input.value ?? '';
    const selectedUnit = fromSelect.value ?? '';

    debugState.lastUpdatedCard = type;
    debugState.lastInputValue = raw === '' ? '(empty)' : raw;
    debugState.lastSelectedUnit = selectedUnit || '-';
    updateDebugPanel();

    if (raw.trim() === '') {
      if (resultList && unitMap[type]) {
        const outputUnits = unitMap[type].filter((unit) => unit !== selectedUnit);
        renderList(resultList, outputUnits, () => '-');
      } else if (result) {
        const targetUnit = selectedUnit === 'C' ? 'F' : selectedUnit === 'F' ? 'C' : selectedUnit === 'm/s' ? 'ft/s' : 'm/s';
        result.textContent = `${targetUnit}：-`;
      }
      return;
    }

    const value = Number(raw);
    if (Number.isNaN(value)) {
      if (resultList && unitMap[type]) {
        const outputUnits = unitMap[type].filter((unit) => unit !== selectedUnit);
        renderList(resultList, outputUnits, () => '輸入無效');
      } else if (result) {
        result.textContent = '輸入無效';
      }
      return;
    }

    try {
      const converter = conversionMap[type];
      const baseValue = converter.toBase(value, selectedUnit);

      if (resultList && unitMap[type]) {
        const outputUnits = unitMap[type].filter((unit) => unit !== selectedUnit);
        renderList(resultList, outputUnits, (unit) => formatNumber(converter.fromBase(baseValue, unit)));
        return;
      }

      if (result) {
        const targetUnit = selectedUnit === 'C' ? 'F' : selectedUnit === 'F' ? 'C' : selectedUnit === 'm/s' ? 'ft/s' : 'm/s';
        const convertedValue = converter.fromBase(baseValue, targetUnit);
        result.textContent = `${targetUnit}：${formatNumber(convertedValue)}`;
      }
    } catch (error) {
      const message = `${type} card update error: ${error instanceof Error ? error.message : String(error)}`;
      console.error(message);
      setLastError(message);
    }
  }

  input.addEventListener('input', update);
  fromSelect.addEventListener('change', update);
  update();

  return true;
}

function startApp() {
  const cards = Array.from(document.querySelectorAll('.card'));
  let initializedCount = 0;

  cards.forEach((card) => {
    try {
      const initialized = initializeCard(card);
      if (initialized) {
        initializedCount += 1;
      }
    } catch (error) {
      const type = card?.dataset?.type || 'unknown';
      const message = `${type} card init error: ${error instanceof Error ? error.message : String(error)}`;
      console.error(message);
      setLastError(message);
    }
  });

  debugState.cardsInitializedCount = initializedCount;
  updateDebugPanel();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
