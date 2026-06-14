/// <reference types="cypress" />

describe("Full user flow", () => {
  Cypress.on("uncaught:exception", (err, runnable) => {
    return false;
  });

  // Use a fixed unique username for the duration of this test suite run
  const uniqueId = Date.now().toString().slice(-9);
  const username = `halo${uniqueId}`;
  const email = `${username}@example.com`;
  const password = "TestPassword1234!";

  it("Register gagal", () => {
    cy.visit("/register");
    // Invalid username (too short) and short password
    cy.get('input[name="username"]').should("be.visible").clear().type("a");
    cy.get('input[name="email"]').should("be.visible").clear().type("invalid-email");
    cy.get('input[name="password"]').should("be.visible").clear().type("123");
    cy.get('button[type="submit"]').contains(/daftar|register/i).click();

    // Verify validation error messages are displayed
    cy.contains("Username minimal 3 karakter").should("be.visible");
    cy.contains("Format email tidak valid").should("be.visible");
    cy.contains("Kata sandi minimal 5 karakter").should("be.visible");
  });

  it("Register berhasil", () => {
    cy.visit("/register");
    cy.intercept("POST", "/api/register").as("registerRequest");

    cy.get('input[name="username"]').should("be.visible").clear().type(username);
    cy.get('input[name="email"]').should("be.visible").clear().type(email);
    cy.get('input[name="password"]').should("be.visible").clear().type(password);
    cy.get('button[type="submit"]').contains(/daftar|register/i).click();

    cy.wait("@registerRequest");

    // Redirect to homepage on success and show Logout
    cy.url().should("eq", Cypress.config("baseUrl") + "/");
    cy.contains("Logout").should("be.visible");
  });

  it("Login gagal", () => {
    // Clear cookies first to log out from the previous test
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();

    cy.visit("/login");
    cy.intercept("POST", "/api/login").as("loginFailRequest");

    cy.get('input[name="username"]').should("be.visible").clear().type(username);
    cy.get('input[name="password"]').should("be.visible").clear().type("WrongPassword123!");
    cy.get('button[type="submit"]').contains(/login|masuk/i).click();

    cy.wait("@loginFailRequest");

    // Verification: should display an error message (like "Kata sandi salah" or similar server error alert)
    // and remain on the login page
    cy.url().should("include", "/login");
    cy.get(".bg-red-50, .text-red-600, .text-red-500").should("be.visible");
  });

  it("Login berhasil", () => {
    // Clear any temporary states from failed login
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();

    cy.visit("/login");
    cy.intercept("POST", "/api/login").as("loginRequest");

    cy.get('input[name="username"]').should("be.visible").clear().type(username);
    cy.get('input[name="password"]').should("be.visible").clear().type(password);
    cy.get('button[type="submit"]').contains(/login|masuk/i).click();

    // Wait for the login API call to finish
    cy.wait("@loginRequest");

    // Redirect to homepage on success and show Logout
    cy.url().should("eq", Cypress.config("baseUrl") + "/");
    cy.contains("Logout").should("be.visible");
  });

  it("Logout", () => {
    // Click the logout button
    cy.contains("Keluar (Logout)").click();

    // Verify it redirects back to login page or shows login button
    cy.contains("Login").should("be.visible");
  });
});
