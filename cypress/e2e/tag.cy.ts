/// <reference types="cypress" />

describe("Tag E2E Tests", () => {
  Cypress.on("uncaught:exception", (err, runnable) => {
    return false;
  });

  const uniqueUserSuffix = Date.now().toString().slice(-6);
  const username = `u_tag_${uniqueUserSuffix}`;
  const email = `${username}@example.com`;
  const password = "TestPassword123!";

  const mockUser = {
    id: "user-123",
    username: username,
    email: email,
    avatar_url: null,
    bio: "Developer at Flexicord",
    reputation_points: 100,
    level: 1,
    is_banned: 0,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    roles: [{ id: "r-1", name: "user" }],
    primary_role: { name: "user" },
  };

  const mockAdminUser = {
    id: "admin-123",
    username: "anggaraa",
    email: "anggaraa@example.com",
    avatar_url: null,
    bio: "Administrator",
    reputation_points: 999,
    level: 10,
    is_banned: 0,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    roles: [{ id: "r-2", name: "admin" }],
    primary_role: { name: "admin" },
  };

  const mockCategories = [
    { id: "cat-1", name: "Web Development", slug: "web-dev", description: "Web Dev Topic", parent_id: null, children: [] }
  ];

  const mockTags = [
    { id: "tag-1", name: "react", slug: "react", color: "#3b82f6", usage_count: 5, created_at: "2026-06-14 12:00:00" },
    { id: "tag-2", name: "nextjs", slug: "nextjs", color: "#10b981", usage_count: 2, created_at: "2026-06-14 12:00:00" }
  ];

  // Helper for normal user registration (direct register to be 100% reliable)
  const registerAndLoginUser = () => {
    cy.intercept("GET", "/api/me", { statusCode: 401, body: { message: "Unauthorized" } }).as("getGuestMe");
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    cy.visit("/register");
    cy.get('input[name="username"]').type(username);
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').contains(/register|daftar/i).click();
    cy.url().should("eq", Cypress.config("baseUrl") + "/");
  };

  // Helper for admin login (direct login to be 100% reliable)
  const loginAsAdmin = () => {
    cy.intercept("GET", "/api/me", { statusCode: 401, body: { message: "Unauthorized" } }).as("getGuestMe");
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    cy.visit("/login");
    
    // wait for guest check
    cy.wait("@getGuestMe");
    
    cy.get('input[name="username"]').should("be.visible").should("not.be.disabled").type("anggaraa");
    cy.get('input[name="password"]').should("be.visible").should("not.be.disabled").type("aksata");
    cy.get('button[type="submit"]').contains(/login|masuk/i).click();
    cy.url().should("eq", Cypress.config("baseUrl") + "/");
  };

  it("Create tag by user", () => {
    registerAndLoginUser();

    cy.intercept("GET", "/api/me", { user: mockUser }).as("getUserMe");
    cy.intercept("GET", "/api/categories", { data: mockCategories }).as("getCategories");
    cy.intercept("GET", "/api/tags", { data: mockTags }).as("getTags");
    
    // Intercept tag creation
    cy.intercept("POST", "/api/tags", {
      statusCode: 201,
      body: {
        id: "tag-new",
        name: "tailwind",
        slug: "tailwind",
        color: "#3b82f6",
        usage_count: 0,
        created_at: "2026-06-14 12:00:00"
      }
    }).as("createTagReq");

    cy.visit("/ask");
    cy.wait(["@getUserMe", "@getCategories", "@getTags"]);

    // Type new tag name in search box
    cy.get("input#q-tags").type("tailwind");

    // Click on suggestion dropdown item to create new tag
    cy.contains("Buat tag baru").click();

    // Verify tag request was sent and tag chip was added
    cy.wait("@createTagReq");
    cy.get(".inline-flex.items-center").contains("#tailwind").should("exist");
  });

  it("Show list tag by admin", () => {
    loginAsAdmin();

    cy.intercept("GET", "/api/me", { user: mockAdminUser }).as("getAdminMe");
    cy.intercept("GET", "/api/tags", { data: mockTags }).as("getTags");

    cy.visit("/tags");
    cy.wait(["@getAdminMe", "@getTags"]);

    // Verify tag cards are displayed
    cy.contains("react").should("exist");
    cy.contains("#react").should("exist");
    cy.contains("nextjs").should("exist");
    cy.contains("#nextjs").should("exist");
  });

  it("Update tag by admin", () => {
    loginAsAdmin();

    cy.intercept("GET", "/api/me", { user: mockAdminUser }).as("getAdminMe");
    cy.intercept("GET", "/api/tags", { data: mockTags }).as("getTags");
    cy.intercept("PUT", "/api/tags/react", {
      statusCode: 200,
      body: { success: true, message: "Tag berhasil diperbarui!" }
    }).as("updateTagReq");

    cy.visit("/tags");
    cy.wait(["@getAdminMe", "@getTags"]);

    // Click "Kelola Tag" to enter manage mode
    cy.contains("Kelola Tag").click();

    // Click edit on the first tag card
    cy.get('button[title="Edit Tag"]').first().click({ force: true });

    // Fill the updated details
    cy.get('input[name="name"]').clear().type("react-native");
    cy.get('input[name="color"]').clear().type("#8b5cf6");
    cy.get('button[type="submit"]').contains("Simpan Perubahan").click();

    cy.wait("@updateTagReq");
    cy.get("#toast-notification").should("be.visible").contains("berhasil diperbarui");
  });

  it("Delete tag by admin", () => {
    loginAsAdmin();

    cy.intercept("GET", "/api/me", { user: mockAdminUser }).as("getAdminMe");
    cy.intercept("GET", "/api/tags", { data: mockTags }).as("getTags");
    cy.intercept("DELETE", "/api/tags/react", {
      statusCode: 200,
      body: { success: true, message: "Tag berhasil dihapus!" }
    }).as("deleteTagReq");

    cy.visit("/tags");
    cy.wait(["@getAdminMe", "@getTags"]);

    // Click "Kelola Tag" to enter manage mode
    cy.contains("Kelola Tag").click();

    // Click delete on the first tag card
    cy.get('button[title="Hapus Tag"]').first().click({ force: true });

    // Confirm deletion in modal
    cy.contains("Ya, Hapus").click();

    cy.wait("@deleteTagReq");
    cy.get("#toast-notification").should("be.visible").contains("berhasil dihapus");
  });
});
