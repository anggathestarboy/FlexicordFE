/// <reference types="cypress" />

describe("Feature: Leaderboard & Notifikasi", () => {
  Cypress.on("uncaught:exception", () => false);

  // ─── Shared mock data ───────────────────────────────────────────────────────

  const mockUser = {
    id: "user-001",
    username: "anggaraa",
    email: "anggaraa@mail.com",
    avatar_url: null,
    bio: null,
    reputation_points: 100,
    level: 3,
    is_banned: 0,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    roles: [{ id: "r-1", name: "user" }],
    primary_role: { name: "user" },
  };

  const mockLeaderboard = [
    { id: "u-1", username: "topuser1", avatar_url: null, bio: null, reputation_points: 5000, level: 10 },
    { id: "u-2", username: "topuser2", avatar_url: null, bio: null, reputation_points: 4200, level: 9 },
    { id: "u-3", username: "topuser3", avatar_url: null, bio: null, reputation_points: 3700, level: 8 },
    { id: "u-4", username: "topuser4", avatar_url: null, bio: null, reputation_points: 2900, level: 7 },
    { id: "u-5", username: "topuser5", avatar_url: null, bio: null, reputation_points: 1800, level: 6 },
  ];

  const mockNotificationsResponse = {
    success: true,
    status: "ok",
    data: {
      current_page: 1,
      data: [
        {
          id: "notif-001",
          user_id: "user-001",
          actor_id: "actor-001",
          type: "like",
          reference_id: "post-abc",
          reference_type: "post",
          is_read: 0,
          created_at: "2025-06-14T10:00:00Z",
          updated_at: "2025-06-14T10:00:00Z",
          actor: {
            id: "actor-001",
            username: "suka_liker",
            email: "liker@mail.com",
            avatar_url: null,
            bio: null,
            reputation_points: 300,
            level: 2,
            is_banned: 0,
            created_at: "2025-01-01T00:00:00Z",
            updated_at: "2025-01-01T00:00:00Z",
          },
        },
        {
          id: "notif-002",
          user_id: "user-001",
          actor_id: "actor-002",
          type: "follow",
          reference_id: null,
          reference_type: null,
          is_read: 1,
          created_at: "2025-06-13T08:00:00Z",
          updated_at: "2025-06-13T08:00:00Z",
          actor: {
            id: "actor-002",
            username: "follower_user",
            email: "follower@mail.com",
            avatar_url: null,
            bio: null,
            reputation_points: 50,
            level: 1,
            is_banned: 0,
            created_at: "2025-01-01T00:00:00Z",
            updated_at: "2025-01-01T00:00:00Z",
          },
        },
        {
          id: "notif-003",
          user_id: "user-001",
          actor_id: "actor-001",
          type: "bookmark",
          reference_id: "post-xyz",
          reference_type: "post",
          is_read: 1,
          created_at: "2025-06-12T06:00:00Z",
          updated_at: "2025-06-12T06:00:00Z",
          actor: {
            id: "actor-001",
            username: "suka_liker",
            email: "liker@mail.com",
            avatar_url: null,
            bio: null,
            reputation_points: 300,
            level: 2,
            is_banned: 0,
            created_at: "2025-01-01T00:00:00Z",
            updated_at: "2025-01-01T00:00:00Z",
          },
        },
      ],
      from: 1,
      last_page: 1,
      last_page_url: null,
      links: [],
      next_page_url: null,
      path: "/api/notifications",
      per_page: 15,
      prev_page_url: null,
      to: 3,
      total: 3,
      first_page_url: null,
    },
  };

  // ─── Setup: intercept semua request ─────────────────────────────────────────

  beforeEach(() => {
    cy.intercept(
      "GET",
      "https://pegaduanmasyarakat.alwaysdata.net/api/leaderboard",
      { statusCode: 200, body: mockLeaderboard }
    ).as("getLeaderboard");

    cy.intercept("GET", "/api/me", { user: mockUser }).as("getMe");

    cy.intercept("GET", "/api/tags*", {
      statusCode: 200,
      body: { data: [] },
    }).as("getTags");

    cy.intercept("GET", "/api/posts*", {
      statusCode: 200,
      body: { data: [] },
    }).as("getPosts");

    cy.intercept("GET", "/api/notifications*", {
      statusCode: 200,
      body: mockNotificationsResponse,
    }).as("getNotifications");
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // LEADERBOARD
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Leaderboard", () => {
    it("Menampilkan judul Leaderboard di sidebar kanan", () => {
      cy.viewport(1440, 900);
      cy.visit("/");
      cy.contains("Leaderboard").should("be.visible");
    });

    it("Menampilkan daftar username user di leaderboard", () => {
      cy.viewport(1440, 900);
      cy.visit("/");

      cy.contains("Leaderboard").should("be.visible");
      cy.contains("topuser1").should("be.visible");
      cy.contains("topuser2").should("be.visible");
      cy.contains("topuser3").should("be.visible");
      cy.contains("topuser4").should("be.visible");
      cy.contains("topuser5").should("be.visible");
    });

    it("Menampilkan poin reputasi tiap user di leaderboard", () => {
      cy.viewport(1440, 900);
      cy.visit("/");

      cy.contains("Leaderboard").should("be.visible");
      cy.contains("5,000 pts").should("be.visible");
      cy.contains("4,200 pts").should("be.visible");
      cy.contains("3,700 pts").should("be.visible");
    });

    it("Menampilkan level tiap user di leaderboard", () => {
      cy.viewport(1440, 900);
      cy.visit("/");

      cy.contains("Leaderboard").should("be.visible");
      cy.contains("Level 10").should("be.visible");
      cy.contains("Level 9").should("be.visible");
      cy.contains("Level 8").should("be.visible");
    });

    it("Menampilkan pesan error saat leaderboard gagal dimuat", () => {
      cy.intercept(
        "GET",
        "https://pegaduanmasyarakat.alwaysdata.net/api/leaderboard",
        { statusCode: 500 }
      ).as("getLeaderboardError");

      cy.viewport(1440, 900);
      cy.visit("/");

      cy.contains("Gagal memuat leaderboard.").should("be.visible");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // NOTIFIKASI
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Notifikasi", () => {
    it("Menampilkan halaman notifikasi dengan header yang benar", () => {
      cy.visit("/notifications");

      cy.contains("Notifikasi").should("be.visible");
      cy.contains("Lihat aktivitas terbaru mengenai postingan dan interaksi Anda.").should("be.visible");
    });

    it("Menampilkan daftar notifikasi (like, follow, bookmark)", () => {
      cy.visit("/notifications");

      // Like
      cy.contains("suka_liker").should("be.visible");
      cy.contains("menyukai postingan Anda.").should("be.visible");

      // Follow
      cy.contains("follower_user").should("be.visible");
      cy.contains("mulai mengikuti Anda.").should("be.visible");

      // Bookmark
      cy.contains("menyimpan postingan Anda ke bookmark.").should("be.visible");
    });

    it("Menampilkan total jumlah notifikasi di header", () => {
      cy.visit("/notifications");

      // total = 3, ada badge angka di heading
      cy.get("h1").contains("Notifikasi").should("be.visible");
      cy.contains("3").should("be.visible");
    });

    it("Menampilkan indikator unread (titik biru) pada notifikasi yang belum dibaca", () => {
      cy.visit("/notifications");

      // span dot unread
      cy.get("span.rounded-full.bg-brand-blue").should("exist");
    });

    it("Menampilkan tombol Tandai Semua Terbaca saat ada notifikasi unread", () => {
      cy.visit("/notifications");

      cy.contains("Tandai Semua Terbaca").should("be.visible");
    });

    it("Menampilkan empty state saat tidak ada notifikasi", () => {
      cy.intercept("GET", "/api/notifications*", {
        statusCode: 200,
        body: {
          success: true,
          status: "ok",
          data: {
            current_page: 1,
            data: [],
            from: null,
            last_page: 1,
            last_page_url: null,
            links: [],
            next_page_url: null,
            path: "/api/notifications",
            per_page: 15,
            prev_page_url: null,
            to: null,
            total: 0,
            first_page_url: null,
          },
        },
      }).as("getEmptyNotifications");

      cy.visit("/notifications");

      cy.contains("Tidak ada notifikasi baru").should("be.visible");
      cy.contains("Anda belum menerima pemberitahuan apa pun saat ini.").should("be.visible");
    });

    it("Menampilkan pesan login jika user belum login", () => {
      cy.intercept("GET", "/api/me", { statusCode: 401, body: {} }).as("getMeUnauth");

      cy.visit("/notifications");

      cy.contains("Silakan Login Terlebih Dahulu").should("be.visible");
      cy.contains("Masuk ke Akun").should("be.visible");
    });
  });
});
