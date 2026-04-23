const conversionMap = {
  temp: {
    convert(value, unit) {
      if (unit === 'C') {
        return { value: value * (9 / 5) + 32, unit: 'F' };
      }
      return { value: (value - 32) * (5 / 9), unit: 'C' };
    }
  },
  airflow: {
    convert(value, unit) {
      if (unit === 'CFM') {
        return { value: value * 1.699, unit: 'CMH' };
      }
      return { value: value / 1.699, unit: 'CFM' };
    }
  },
  cooling: {
    convert(value, unit) {
      if (unit === 'RT') {
        return { value: value * 3.517, unit: 'kW' };
      }
      return { value: value / 3.517, unit: 'RT' };
    }
  },
  pressure: {
    convert(value, unit) {
      if (unit === 'Pa') {
        return { value: value / 9.80665, unit: 'mmAq' };
      }
      return { value: value * 9.80665, unit: 'Pa' };
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
  const select = card.querySelector('select');
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

    const converted = conversionMap[type].convert(value, select.value);
    result.textContent = `Result: ${formatNumber(converted.value)} ${converted.unit}`;
  }

  input.addEventListener('input', update);
  select.addEventListener('change', update);
});
