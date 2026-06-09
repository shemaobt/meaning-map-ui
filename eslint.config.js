import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    // Complexity/size quality gate. Core ESLint rules only (no new plugins).
    // Phase 0 = current worst value (green now); ratchet over time — see
    // obt/.claude/quality-gates-plan.md.
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      complexity: ['error', { max: 36 }], // ratchet -> 15 -> 10
      'max-depth': ['error', 4],
      'max-params': ['error', 4],
      'max-lines-per-function': ['error', { max: 270, skipBlankLines: true, skipComments: true }], // ratchet -> 200 -> 150
      'max-lines': ['error', { max: 427, skipBlankLines: true, skipComments: true }], // ratchet -> 400 -> 300
    },
  },
])
