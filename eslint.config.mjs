import nextVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...nextVitals,
  {
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react/no-unescaped-entities': 'warn',
    },
  },
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'public/**',
    ],
  },
];

export default config;
