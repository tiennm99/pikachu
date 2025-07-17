/**
 * Jest setup file for Pikachu game tests
 */

// Global test configuration
global.TEST_CONFIG = {
    verbose: true,
    timeout: 10000
};

// Custom matchers for Pikachu game testing
expect.extend({
    toBeValidMove(received) {
        const pass = received.valid === true;
        if (pass) {
            return {
                message: () => `Expected move to be invalid, but it was valid with pattern: ${received.details?.pattern}`,
                pass: true
            };
        } else {
            return {
                message: () => `Expected move to be valid, but it was invalid: ${received.error}`,
                pass: false
            };
        }
    },
    
    toHavePattern(received, expectedPattern) {
        const pass = received.valid && received.details?.pattern === expectedPattern;
        if (pass) {
            return {
                message: () => `Expected pattern to not be ${expectedPattern}, but it was`,
                pass: true
            };
        } else {
            return {
                message: () => `Expected pattern to be ${expectedPattern}, but got ${received.details?.pattern || 'none'}`,
                pass: false
            };
        }
    }
});

// Console styling for better test output
const originalConsoleLog = console.log;
console.log = (...args) => {
    // Add timestamp to logs during tests
    const timestamp = new Date().toISOString().substr(11, 8);
    originalConsoleLog(`[${timestamp}]`, ...args);
};