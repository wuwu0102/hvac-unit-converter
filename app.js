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
  }
};

const unitMap = {
  airflow: ['CFM', 'CMH', 'm3/s', 'L/s', 'LPM', 'CMM'],
  pressure: ['Pa', 'kPa', 'mmAq', 'bar', 'psi', 'N/m2']
};

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
  return Number(value.toFixed(4)).toString();
}

function renderList(resultList, units, textByUnit) {
  resultList.innerHTML = units.map((unit) => `<li>${unit}: ${textByUnit(unit)}</li>`).join('');
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

function initializeCard(card) {
  const type = card?.dataset?.type || 'unknown';
  console.log(`init card: ${type}`);

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

  if (type === 'temp' && !result) {
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
        const targetUnit = selectedUnit === 'C' ? 'F' : 'C';
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
        const targetUnit = selectedUnit === 'C' ? 'F' : 'C';
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
