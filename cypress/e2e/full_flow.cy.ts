/// <reference types="cypress" />

describe('Full user flow', () => {
  const username = `u${Date.now().toString().slice(-11)}`;
  const email = `${username}@example.com`;
  const password = 'TestPassword123!';

  it('Registers a new user', () => {
    cy.visit('/register');
    // Assuming input fields have name attributes or placeholders
    cy.get('input[name="username"]').type(username);
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').contains(/register|daftar/i).click();
    // Should redirect to homepage after registration
    cy.url().should('eq', Cypress.config('baseUrl') + '/');
    cy.contains('Logout').should('be.visible');
  });

  it('Logs out after registration', () => {
    cy.contains('Logout').click();
    cy.contains('Login').should('be.visible');
  });

  it('Logs in with newly created credentials', () => {
    cy.visit('/login');
    cy.get('input[name="username"]').type(username);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').contains(/login|masuk/i).click();
    cy.url().should('eq', Cypress.config('baseUrl') + '/');
    cy.contains('Logout').should('be.visible');
  });

  it('Navigates to a post detail, likes and bookmarks', () => {
    // Assuming there is at least one post on the homepage
    cy.get('a').contains(/detail|view|baca/i).first().click();
    cy.url().should('include', '/posts/');
    // Like the post
    cy.get('button[title="Like pertanyaan ini"]').click();
    // Verify like count increased (optional: capture before value)
    // Bookmark the post
    cy.get('button[title="Bookmark pertanyaan ini"]').click();
    // Verify bookmark count increased
    // Unlike (remove like) – toggle the same button
    cy.get('button[title="Like pertanyaan ini"]').click();
    // Remove bookmark
    cy.get('button[title="Bookmark pertanyaan ini"]').click();
  });

  it('Visits profile page and performs actions', () => {
    // Go to profile via menu or direct URL
    cy.visit('/profile');
    cy.contains(username).should('be.visible');
    // Example: edit profile name (if UI exists)
    cy.get('button').contains(/edit|ubah/i).first().click();
    const newName = `${username}_edited`;
    cy.get('input[name="name"]').clear().type(newName);
    cy.get('button').contains(/save|simpan/i).click();
    cy.contains(newName).should('be.visible');
    // Follow/unfollow a user (if UI present)
    // Assume a follow button exists on profile
    cy.get('button').contains(/follow|ikuti/i).click();
    cy.get('button').contains(/unfollow|batal ikuti/i).should('be.visible');
  });

  it('Logs out at the end', () => {
    cy.contains('Logout').click();
    cy.contains('Login').should('be.visible');
  });
});
