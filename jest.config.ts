import type { Config } from '@jest/types';


const config: Config.InitialOptions = {
  transform: {
    '.(ts|tsx)': 'ts-jest'
  },
  testEnvironment: 'node',
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|js)$',
  moduleFileExtensions: [
    'ts',
    'js'
  ]
};

export default config;
