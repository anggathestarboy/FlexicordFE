// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Prevent Cypress from failing the test on React hydration warnings/mismatches.
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore specific hydration mismatch error
  if (err.message && err.message.includes('Hydration failed')) {
    return false; // prevent the test from failing
  }
  // You can add more conditions if needed
  return true; // let other errors fail the test
});