// Wave 0 stub — SEED-05: runtimeVersion fingerprint
// Uses fs.readFileSync to verify config values without triggering
// Expo runtime module scope issues from require().
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');

describe('app.config.js', () => {
  test('runtimeVersion uses fingerprint policy', () => {
    const configPath = path.resolve(__dirname, '../app.config.js');
    const content = fs.readFileSync(configPath, 'utf8');
    expect(content).toContain('fingerprint');
    expect(content).toContain('policy');
  });

  test('android softwareKeyboardLayoutMode is resize', () => {
    const configPath = path.resolve(__dirname, '../app.config.js');
    const content = fs.readFileSync(configPath, 'utf8');
    expect(content).toContain('softwareKeyboardLayoutMode');
    expect(content).toContain('resize');
  });
});
