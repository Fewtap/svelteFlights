// cypress/integration/login.spec.js

describe('Login', () => {
  beforeEach(() => {
    // Visit the application's home page
    cy.visit('http://localhost:5173/');
  });

  it('logs in and logs out a user', () => {
    // Fill out and submit the login form
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password');
    cy.get('button[type="submit"]').click();

    // Verify that the user is logged in
    cy.contains('Logged in as test@example.com');

    // Log out the user
    cy.get('button[type="button"]').click();

    // Verify that the user is logged out
    cy.contains('Not logged in');
  });
});
