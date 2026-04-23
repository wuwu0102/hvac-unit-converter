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
        'L/s': 0.001
      };
      return value * toM3s[fromUnit];
    },
    fromBase(value, toUnit) {
      const fromM3s = {
        CFM: 1 / 0.000471947,
        CMH: 3600,
        'm3/s': 1,
        'L/s': 1000
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
        bar: 100000
      };
      return value * toPa[fromUnit];
    },
    fromBase(value, toUnit) {
      const fromPa = {
        Pa: 1,
        kPa: 1 / 1000,
        mmAq: 1 / 9.80665,
        bar: 1 / 100000
      };
      return value * fromPa[toUnit];
    }
  }
};

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return '-';
  }
  return Number(value.toFixed(4)).toString();
}

document.querySelectorAll('.card').forEach((card) => {
  const type = card.dataset.type;
  const input = card.querySelector('input');
  const fromSelect = card.querySelector('[data-role="from-unit"]');
  const toSelect = card.querySelector('[data-role="to-unit"]');
  const result = card.querySelector('.result');

  function update() {
    const raw = input.value;

    if (raw.trim() === '') {
      result.textContent = 'Result: -';
      return;
    }

    const value = Number(raw);
    if (Number.isNaN(value)) {
      result.textContent = 'Result: Invalid input';
      return;
    }

    const converter = conversionMap[type];
    const baseValue = converter.toBase(value, fromSelect.value);
    const convertedValue = converter.fromBase(baseValue, toSelect.value);
    result.textContent = `Result: ${formatNumber(convertedValue)} ${toSelect.value}`;
  }

  input.addEventListener('input', update);
  fromSelect.addEventListener('change', update);
  toSelect.addEventListener('change', update);
});
