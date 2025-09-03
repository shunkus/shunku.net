import '@testing-library/jest-dom';

// Suppress React DOM warnings about non-boolean attributes and empty src during testing
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' && 
    (args[0].includes('Received `true` for a non-boolean attribute') ||
     args[0].includes('validateProperty') ||
     args[0].includes('non-boolean attribute') ||
     args[0].includes('An empty string ("") was passed to the src attribute'))
  ) {
    return;
  }
  originalConsoleError(...args);
};