# Safe Sync Policy

- Production repository (`wuwu0102/hvac-unit-converter`) is the only official source for release code.
- Test repository (`wuwu0102/hvac-unit-converter-test`) may only be merged through the `safe-sync-test-to-production` workflow.
- Never overwrite production `index.html` with test `index.html` as a full-file replacement.
- Production must always retain safe area protection, dark mode support, and feedback features (feedback page, Google Form, and email fallback).
