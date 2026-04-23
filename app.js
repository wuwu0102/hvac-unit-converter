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

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return '-';
  }
  return Number(value.toFixed(4)).toString();
}

function renderList(resultList, units, textByUnit) {
  resultList.innerHTML = units.map((unit) => `<li>${unit}: ${textByUnit(unit)}</li>`).join('');
}

document.querySelectorAll('.card').forEach((card) => {
  const type = card.dataset.type;
  const input = card.querySelector('input');
  const fromSelect = card.querySelector('[data-role="from-unit"]');
  const result = card.querySelector('.result');
  const resultList = card.querySelector('[data-role="result-list"]');

  function update() {
    const raw = input.value;

    if (raw.trim() === '') {
      if (resultList) {
        const outputUnits = unitMap[type].filter((unit) => unit !== fromSelect.value);
        renderList(resultList, outputUnits, () => '-');
      } else {
        const targetUnit = fromSelect.value === 'C' ? 'F' : 'C';
        result.textContent = `${targetUnit}: -`;
      }
      return;
    }

    const value = Number(raw);
    if (Number.isNaN(value)) {
      if (resultList) {
        const outputUnits = unitMap[type].filter((unit) => unit !== fromSelect.value);
        renderList(resultList, outputUnits, () => 'Invalid input');
      } else {
        result.textContent = 'Invalid input';
      }
      return;
    }

    const converter = conversionMap[type];
    const baseValue = converter.toBase(value, fromSelect.value);

    if (resultList) {
      const outputUnits = unitMap[type].filter((unit) => unit !== fromSelect.value);
      renderList(resultList, outputUnits, (unit) => formatNumber(converter.fromBase(baseValue, unit)));
      return;
    }

    const targetUnit = fromSelect.value === 'C' ? 'F' : 'C';
    const convertedValue = converter.fromBase(baseValue, targetUnit);
    result.textContent = `${targetUnit}: ${formatNumber(convertedValue)}`;
  }

  input.addEventListener('input', update);
  fromSelect.addEventListener('change', update);
  update();
});
