module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['dotenv/config'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    // Support for CSS imports (optional, for Next.js)
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  // Ignore Next.js build output and node_modules
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
};
