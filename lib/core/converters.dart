import 'dart:math';

class UnitConverters {
  static const Map<String, double> coolingToRt = {
    'RT': 1,
    'kW': 1 / 3.517,
    'kcal/h': 1 / 3024,
    'BTU/h': 1 / 12000,
  };

  static const Map<String, double> airflowToCmh = {
    'CFM': 1.69901082,
    'CMH': 1,
    'm³/s': 3600,
    'L/s': 3.6,
    'LPM': 0.06,
    'CMM': 60,
  };

  static const Map<String, double> pressureToPa = {
    'Pa': 1,
    'kPa': 1000,
    'mmAq': 9.80665,
    'bar': 100000,
    'psi': 6894.757,
    'N/m²': 1,
  };

  static const Map<String, double> powerToKw = {
    'W': 0.001,
    'kW': 1,
    'MW': 1000,
    'HP': 0.7457,
  };

  static Map<String, double> convertByBase(double value, Map<String, double> toBase) {
    final entries = <String, double>{};
    for (final e in toBase.entries) {
      entries[e.key] = value / e.value;
    }
    return entries;
  }

  static Map<String, double> convertTemp(double value, String unit) {
    if (unit == '°C') return {'°C': value, '°F': value * 9 / 5 + 32};
    return {'°C': (value - 32) * 5 / 9, '°F': value};
  }

  static Map<String, double> convertGeneric(double value, String fromUnit, Map<String, double> toBase) {
    final base = value * toBase[fromUnit]!;
    final result = <String, double>{};
    for (final e in toBase.entries) {
      result[e.key] = base / e.value;
    }
    return result;
  }

  static ({double kw, double kva}) threePhase(double v, double a, double pf) {
    final kva = sqrt(3) * v * a / 1000;
    final kw = sqrt(3) * v * a * pf / 1000;
    return (kw: kw, kva: kva);
  }

  static ({double kw, double kva}) singlePhase(double v, double a, double pf) {
    final kva = v * a / 1000;
    final kw = v * a * pf / 1000;
    return (kw: kw, kva: kva);
  }

  static double estimateCurrent({required double kw, required double v, required double pf, required bool threePhase}) {
    if (threePhase) return kw * 1000 / (sqrt(3) * v * pf);
    return kw * 1000 / (v * pf);
  }
}
