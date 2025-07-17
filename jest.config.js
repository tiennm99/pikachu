export default {
  // Use ES modules
  preset: 'node',
  extensionsToTreatAsEsm: ['.js'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  transform: {},
  
  // Test environment
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '**/test/**/*.test.js',
    '**/test/**/test-*.js'
  ],
  
  // Coverage settings
  collectCoverageFrom: [
    'src/game/logic/**/*.js',
    '!src/game/logic/**/*.test.js'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Verbose output
  verbose: true,
  
  // Module file extensions
  moduleFileExtensions: ['js', 'json'],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/test/setup.js']
};