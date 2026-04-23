console.log('app.js loaded');

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

const pipeSizeList = [
  { nominal: 'DN15 / 1/2"', innerDiameterMm: 15.8 },
  { nominal: 'DN20 / 3/4"', innerDiameterMm: 20.9 },
  { nominal: 'DN25 / 1"', innerDiameterMm: 26.6 },
  { nominal: 'DN32 / 1-1/4"', innerDiameterMm: 35.1 },
  { nominal: 'DN40 / 1-1/2"', innerDiameterMm: 40.9 },
  { nominal: 'DN50 / 2"', innerDiameterMm: 52.5 },
  { nominal: 'DN65 / 2-1/2"', innerDiameterMm: 62.7 },
  { nominal: 'DN80 / 3"', innerDiameterMm: 77.9 },
  { nominal: 'DN100 / 4"', innerDiameterMm: 102.3 },
  { nominal: 'DN125 / 5"', innerDiameterMm: 128.2 },
  { nominal: 'DN150 / 6"', innerDiameterMm: 154.1 }
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
  const maxVelocityInput = card.querySelector('[data-role="max-velocity"]');
  const pipeResult = card.querySelector('[data-role="pipe-result"]');

  if (!flowInput) {
    logMissingElement('pipe-sizing', 'flow input');
    return false;
  }

  if (!flowUnit) {
    logMissingElement('pipe-sizing', 'flow-unit selector');
    return false;
  }

  if (!maxVelocityInput) {
    logMissingElement('pipe-sizing', 'max velocity input');
    return false;
  }

  if (!pipeResult) {
    logMissingElement('pipe-sizing', 'pipe result container');
    return false;
  }

  function updatePipeSizing() {
    const rawFlow = flowInput.value ?? '';
    const selectedUnit = flowUnit.value ?? '';
    const rawMaxVelocity = maxVelocityInput.value ?? '';

    debugState.lastUpdatedCard = 'pipe-sizing';
    debugState.lastInputValue = rawFlow === '' ? '(empty)' : rawFlow;
    debugState.lastSelectedUnit = selectedUnit || '-';
    updateDebugPanel();

    if (rawFlow.trim() === '' || rawMaxVelocity.trim() === '') {
      updatePipeResultRow(pipeResult, 'Recommended size', '-');
      updatePipeResultRow(pipeResult, 'Approx. inside diameter', '-');
      updatePipeResultRow(pipeResult, 'Estimated velocity', '-');
      return;
    }

    const flowValue = Number(rawFlow);
    const maxVelocity = Number(rawMaxVelocity);

    if (!Number.isFinite(flowValue) || !Number.isFinite(maxVelocity) || flowValue <= 0 || maxVelocity <= 0) {
      updatePipeResultRow(pipeResult, 'Recommended size', 'Invalid input');
      updatePipeResultRow(pipeResult, 'Approx. inside diameter', '-');
      updatePipeResultRow(pipeResult, 'Estimated velocity', '-');
      return;
    }

    const flowM3s = conversionMap.airflow.toBase(flowValue, selectedUnit);

    const matchedPipe = pipeSizeList.find((pipe) => {
      const diameterM = pipe.innerDiameterMm / 1000;
      const area = Math.PI * (diameterM ** 2) / 4;
      const velocity = flowM3s / area;
      return velocity <= maxVelocity;
    });

    if (!matchedPipe) {
      updatePipeResultRow(pipeResult, 'Recommended size', 'Flow too high for current built-in size list');
      updatePipeResultRow(pipeResult, 'Approx. inside diameter', '-');
      updatePipeResultRow(pipeResult, 'Estimated velocity', '-');
      return;
    }

    const matchedDiameterM = matchedPipe.innerDiameterMm / 1000;
    const matchedArea = Math.PI * (matchedDiameterM ** 2) / 4;
    const estimatedVelocity = flowM3s / matchedArea;

    updatePipeResultRow(pipeResult, 'Recommended size', matchedPipe.nominal);
    updatePipeResultRow(pipeResult, 'Approx. inside diameter', `${matchedPipe.innerDiameterMm.toFixed(1)} mm`);
    updatePipeResultRow(pipeResult, 'Estimated velocity', `${formatNumber(estimatedVelocity)} m/s`);
  }

  flowInput.addEventListener('input', updatePipeSizing);
  flowUnit.addEventListener('change', updatePipeSizing);
  maxVelocityInput.addEventListener('input', updatePipeSizing);
  updatePipeSizing();

  return true;
}

function initializeCard(card) {
  const type = card?.dataset?.type || 'unknown';
  console.log(`init card: ${type}`);

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
    console.log('update called', type, raw, selectedUnit);

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
        result.textContent = `${targetUnit}: -`;
      }
      return;
    }

    const value = Number(raw);
    if (Number.isNaN(value)) {
      if (resultList && unitMap[type]) {
        const outputUnits = unitMap[type].filter((unit) => unit !== selectedUnit);
        renderList(resultList, outputUnits, () => 'Invalid input');
      } else if (result) {
        result.textContent = 'Invalid input';
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
        result.textContent = `${targetUnit}: ${formatNumber(convertedValue)}`;
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
  console.log(`cards found: ${cards.length}`);

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
