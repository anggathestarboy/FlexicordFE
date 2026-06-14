/// <reference types="cypress" />

describe("Category Management E2E Tests", () => {
  Cypress.on("uncaught:exception", (err, runnable) => {
    return false;
  });

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
    {
      id: "cat-1",
      name: "Programming Language",
      slug: "programming-language",
      description: "All discussions about coding languages",
      parent_id: null,
      children: [
        {
          id: "cat-child-1",
          name: "JavaScript",
          slug: "javascript",
          description: "JS frontend and backend programming",
          parent_id: "cat-1"
        }
      ]
    },
    {
      id: "cat-2",
      name: "DevOps",
      slug: "devops",
      description: "CI/CD and Cloud infrastructure",
      parent_id: null,
      children: []
    }
  ];

  const loginAsAdmin = () => {
    cy.intercept("GET", "/api/me", { statusCode: 401, body: { message: "Unauthorized" } }).as("getGuestMe");
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    
    cy.visit("/login");
    cy.wait("@getGuestMe");
    
    cy.get('input[name="username"]').should("be.visible").should("not.be.disabled").type("anggaraa");
    cy.get('input[name="password"]').should("be.visible").should("not.be.disabled").type("aksata");
    cy.get('button[type="submit"]').contains(/login|masuk/i).click();
    cy.url().should("eq", Cypress.config("baseUrl") + "/");
  };

  beforeEach(() => {
    loginAsAdmin();
    
    // Stub standard API endpoints
    cy.intercept("GET", "/api/me", { user: mockAdminUser }).as("getAdminMe");
    cy.intercept("GET", "/api/categories", { data: mockCategories }).as("getCategories");
  });

  it("Create category", () => {
    const newCategory = {
      name: "Mobile Dev",
      description: "Native and cross-platform apps development",
      parent_id: null
    };

    cy.intercept("POST", "/api/categories", {
      statusCode: 201,
      body: { success: true, message: "Kategori berhasil dibuat!" }
    }).as("createCategoryReq");

    cy.visit("/moderation/categories");
    cy.wait(["@getAdminMe", "@getCategories"]);

    // Enter manage mode
    cy.contains("Kelelola Kategori", { timeout: 10000 }).should("not.exist"); // wait until page loaded
    cy.contains("Kelola Kategori").click();

    // Open create modal
    cy.contains("Tambah Kategori").click();

    // Fill form
    cy.get('input[name="name"]').type(newCategory.name);
    cy.get('textarea[name="description"]').type(newCategory.description);
    cy.get('button[type="submit"]').contains("Buat Kategori").click();

    cy.wait("@createCategoryReq");
    cy.get("#toast-notification").should("be.visible").contains("berhasil dibuat");
  });

  it("Show category", () => {
    cy.visit("/moderation/categories");
    cy.wait(["@getAdminMe", "@getCategories"]);

    // Main category name, description and slug should be displayed
    cy.contains("Programming Language").should("exist");
    cy.contains("All discussions about coding languages").should("exist");
    cy.contains("/programming-language").should("exist");
  });

  it("Show child category", () => {
    cy.visit("/moderation/categories");
    cy.wait(["@getAdminMe", "@getCategories"]);

    // Click the subcategory toggle button (e.g. "1 Sub")
    cy.contains("1 Sub").click();

    // Child category name and description should be visible now
    cy.contains("JavaScript").should("exist");
    cy.contains("JS frontend and backend programming").should("exist");
    cy.contains("/javascript").should("exist");
  });

  it("Update category", () => {
    const updatedCategory = {
      name: "Programming Language V2",
      description: "Updated description for coding languages",
      parent_id: null
    };

    cy.intercept("PUT", "/api/categories/programming-language", {
      statusCode: 200,
      body: { success: true, message: "Kategori berhasil diperbarui!" }
    }).as("updateCategoryReq");

    cy.visit("/moderation/categories");
    cy.wait(["@getAdminMe", "@getCategories"]);

    // Enter manage mode
    cy.contains("Kelola Kategori").click();

    // Click edit button on the main category card (by title attribute)
    cy.get('button[title="Edit Kategori Utama"]').first().click({ force: true });

    // Update form values
    cy.get('input[name="name"]').clear().type(updatedCategory.name);
    cy.get('textarea[name="description"]').clear().type(updatedCategory.description);
    cy.get('button[type="submit"]').contains("Simpan Perubahan").click();

    cy.wait("@updateCategoryReq");
    cy.get("#toast-notification").should("be.visible").contains("berhasil diperbarui");
  });

  it("Delete category", () => {
    cy.intercept("DELETE", "/api/categories/programming-language", {
      statusCode: 200,
      body: { success: true, message: "Kategori berhasil dihapus!" }
    }).as("deleteCategoryReq");

    cy.visit("/moderation/categories");
    cy.wait(["@getAdminMe", "@getCategories"]);

    // Enter manage mode
    cy.contains("Kelola Kategori").click();

    // Click delete button on the main category card (by title attribute)
    cy.get('button[title="Hapus Kategori Utama"]').first().click({ force: true });

    // Confirm deletion in modal
    cy.contains("Ya, Hapus").click();

    cy.wait("@deleteCategoryReq");
    cy.get("#toast-notification").should("be.visible").contains("berhasil dihapus");
  });
});
