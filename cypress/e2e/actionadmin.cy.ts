/// <reference types="cypress" />

describe("Admin & Moderator Actions E2E Tests", () => {
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

  const mockTargetUser = {
    id: "user-target-999",
    username: "targetuser",
    email: "targetuser@example.com",
    avatar_url: null,
    bio: "Just a regular member",
    reputation_points: 120,
    level: 2,
    is_banned: 0,
    created_at: "2026-01-01T00:00:00Z",
    posts_count: 0,
    followers_count: 0,
    following_count: 0,
    badges_count: 0,
    roles: [{ id: "r-1", name: "user" }],
    badges: [],
    posts: []
  };

  const mockTargetModerator = {
    ...mockTargetUser,
    roles: [{ id: "r-3", name: "moderator" }]
  };

  const mockReports = [
    {
      id: "rep-101",
      reporter_id: "user-123",
      target_id: "post-101",
      target_type: "post",
      reason: "Spam content",
      description: "This post is advertising unrelated sites.",
      status: "open",
      resolved_at: null,
      created_at: "2026-06-14T12:00:00.000Z",
      resolved_by: null,
      reporter: { id: "user-123", username: "reporter_dev", email: "reporter@example.com", avatar_url: "" },
      post: { id: "post-101", user_id: "user-target-999", category_id: "cat-1", title: "Awesome coding tips", body: "Spam advertising link...", status: "open", view_count: 5, vote_score: 1, is_answered: 0, accepted_answer_id: null, created_at: "2026-06-14T00:00:00.000Z", updated_at: "2026-06-14T00:00:00.000Z" },
      comment: null,
      user: null
    }
  ];

  const mockModerationLogs = [
    {
      id: "log-501",
      moderator_id: "admin-123",
      target_user_id: "user-target-999",
      action_type: "warning",
      reason: "Inappropriate language used in comments",
      notes: "First warning issued.",
      created_at: "2026-06-14T13:00:00.000Z",
      moderator: { id: "admin-123", username: "anggaraa", email: "admin@example.com" },
      user: { id: "user-target-999", username: "targetuser", email: "targetuser@example.com" }
    }
  ];

  const mockBadges = [
    {
      id: "badge-1",
      name: "Top Contributor",
      description: "Given to users with high reputation",
      tier: "gold",
      condition_type: "reputation_points",
      condition_value: 1000,
      icon_url: null
    }
  ];

  // Helper for admin login (direct login to be 100% reliable)
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

  it("Update Report", () => {
    loginAsAdmin();

    // Stub report endpoints
    cy.intercept("GET", "/api/me", { user: mockAdminUser }).as("getAdminMe");
    cy.intercept("GET", "/api/reports/all?page=1", {
      success: true,
      data: { data: mockReports, current_page: 1, last_page: 1, total: 1 }
    }).as("getAllReports");

    cy.intercept("PATCH", `/api/reports/${mockReports[0].id}`, {
      statusCode: 200,
      body: { success: true, message: "Report status updated successfully" }
    }).as("patchReportReq");

    cy.visit("/moderation/reports");
    cy.wait(["@getAdminMe", "@getAllReports"]);

    // Click on the report card to open modal
    cy.contains("Detail").first().click();

    // Select status update resolved
    cy.get("button").contains("resolved").click();

    cy.wait("@patchReportReq");
  });

  it("Promote admin", () => {
    loginAsAdmin();

    cy.intercept("GET", "/api/me", { user: mockAdminUser }).as("getAdminMe");
    cy.intercept("GET", `/api/profile/${mockTargetUser.username}`, {
      message: "Fetched profile",
      user: mockTargetUser,
      is_following: false
    }).as("getTargetProfile");

    cy.intercept("POST", `/api/admin/promote-admin/${mockTargetUser.username}`, {
      statusCode: 200,
      body: { success: true, message: "User promoted to admin successfully" }
    }).as("promoteAdminReq");

    cy.visit(`/profile/${mockTargetUser.username}`);
    cy.wait(["@getAdminMe", "@getTargetProfile"]);

    // Click Promote Admin button
    cy.contains("Promote Admin").should("exist").click();

    cy.wait("@promoteAdminReq");
    cy.contains("promoted to admin").should("exist");
  });

  it("Unpromote moderator by admin", () => {
    loginAsAdmin();

    cy.intercept("GET", "/api/me", { user: mockAdminUser }).as("getAdminMe");
    cy.intercept("GET", `/api/profile/${mockTargetModerator.username}`, {
      message: "Fetched profile",
      user: mockTargetModerator,
      is_following: false
    }).as("getTargetModProfile");

    cy.intercept("POST", `/api/admin/turunkan/${mockTargetModerator.username}`, {
      statusCode: 200,
      body: { success: true, message: "User demoted successfully" }
    }).as("demoteReq");

    cy.visit(`/profile/${mockTargetModerator.username}`);
    cy.wait(["@getAdminMe", "@getTargetModProfile"]);

    // Click Turunkan Jabatan
    cy.contains("Turunkan Jabatan").should("exist").click();

    cy.wait("@demoteReq");
    cy.contains("demoted successfully").should("exist");
  });

  it("Promote moderator", () => {
    loginAsAdmin();

    cy.intercept("GET", "/api/me", { user: mockAdminUser }).as("getAdminMe");
    cy.intercept("GET", `/api/profile/${mockTargetUser.username}`, {
      message: "Fetched profile",
      user: mockTargetUser,
      is_following: false
    }).as("getTargetProfile");

    cy.intercept("POST", `/api/admin/promote-moderator/${mockTargetUser.username}`, {
      statusCode: 200,
      body: { success: true, message: "User promoted to moderator successfully" }
    }).as("promoteModReq");

    cy.visit(`/profile/${mockTargetUser.username}`);
    cy.wait(["@getAdminMe", "@getTargetProfile"]);

    // Click Promote Moderator
    cy.contains("Promote Moderator").should("exist").click();

    cy.wait("@promoteModReq");
    cy.contains("promoted to moderator").should("exist");
  });

  it("Moderation logs", () => {
    loginAsAdmin();

    cy.intercept("GET", "/api/me", { user: mockAdminUser }).as("getAdminMe");
    cy.intercept("GET", "/api/moderation-logs", {
      success: true,
      data: mockModerationLogs
    }).as("getModLogs");

    cy.visit("/moderation/logs");
    cy.wait(["@getAdminMe", "@getModLogs"]);

    // Logs table content check
    cy.contains("Inappropriate language").should("exist");

    // Click view detail eye icon button
    cy.get('button[title="Lihat Detail Lengkap Log"]').first().click();

    // Verify modal pops up
    cy.contains("Detail Log Tindakan Moderasi").should("exist");
    cy.contains("First warning issued.").should("exist");
  });

  it("Crud badge", () => {
    loginAsAdmin();

    cy.intercept("GET", "/api/me", { user: mockAdminUser }).as("getAdminMe");
    cy.intercept("GET", "/api/badges", { success: true, data: mockBadges }).as("getBadges");

    cy.intercept("POST", "/api/badges", {
      statusCode: 201,
      body: { success: true, message: "Badge berhasil dibuat!" }
    }).as("createBadgeReq");

    cy.intercept("POST", `/api/badges/${mockBadges[0].id}`, {
      statusCode: 200,
      body: { success: true, message: "Badge berhasil diperbarui!" }
    }).as("updateBadgeReq");

    cy.intercept("DELETE", `/api/badges/${mockBadges[0].id}`, {
      statusCode: 200,
      body: { success: true, message: "Badge berhasil dihapus!" }
    }).as("deleteBadgeReq");

    cy.visit("/badges");
    cy.wait(["@getAdminMe", "@getBadges"]);

    // Toggle management mode
    cy.contains("Kelola Badge").click();

    // 1. Create Badge
    cy.contains("Tambah Badge").click();
    cy.get('input[placeholder="Cth: Penjawab Teratas"]').type("Bronze Contributor");
    cy.get('textarea[placeholder*="kontribusi"]').type("Description here");
    cy.get('input[type="number"]').clear().type("50");
    cy.get('button[type="submit"]').contains("Buat Badge").click();
    cy.wait("@createBadgeReq");
    cy.get("#toast-notification").should("exist").contains("berhasil dibuat");

    // 2. Edit Badge
    cy.get('button[title="Edit Badge"]').first().click({ force: true });
    cy.get('input[placeholder="Cth: Penjawab Teratas"]').clear().type("Top Contributor Updated");
    cy.get('button[type="submit"]').contains("Simpan Perubahan").click();
    cy.wait("@updateBadgeReq");
    cy.get("#toast-notification").should("exist").contains("berhasil diperbarui");

    // 3. Delete Badge
    cy.get('button[title="Hapus Badge"]').first().click({ force: true });
    cy.contains("Ya, Hapus").click();
    cy.wait("@deleteBadgeReq");
    cy.get("#toast-notification").should("exist").contains("berhasil dihapus");
  });

  it("Create warning to user", () => {
    loginAsAdmin();

    cy.intercept("GET", "/api/me", { user: mockAdminUser }).as("getAdminMe");
    cy.intercept("GET", `/api/profile/${mockTargetUser.username}`, {
      message: "Fetched profile",
      user: mockTargetUser,
      is_following: false
    }).as("getTargetProfile");

    cy.intercept("POST", `/api/warnings/${mockTargetUser.username}`, {
      statusCode: 201,
      body: { success: true, message: "Warning successfully given." }
    }).as("postWarningReq");

    cy.visit(`/profile/${mockTargetUser.username}`);
    cy.wait(["@getAdminMe", "@getTargetProfile"]);

    // Click Warning button to toggle warning popover
    cy.contains("Warning").should("exist").click();

    // Fill warning form
    cy.get('input[placeholder="Alasan warning..."]').type("Stop spamming comments.");
    cy.get('textarea[placeholder="Catatan internal..."]').type("Internal notes detail.");
    cy.get('button[type="submit"]').contains("Kirim").click();

    cy.wait("@postWarningReq");
    cy.contains("Warning Terkirim").should("exist");
  });
});
