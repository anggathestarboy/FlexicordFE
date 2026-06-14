/// <reference types="cypress" />

describe("Comment E2E Tests", () => {
  Cypress.on("uncaught:exception", () => false);

  // ─── Shared Mock Data ───────────────────────────────────────────────────────
  const mockUser = {
    id: "user-123",
    username: "comment_user",
    email: "comment_user@mail.com",
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

  const mockPost = {
    id: "post-101",
    user_id: "user-999",
    category_id: "cat-1",
    title: "Bagaimana cara melakukan testing Cypress dengan baik?",
    body: "<p>Saya sedang membuat test suite E2E menggunakan Cypress pada aplikasi Next.js.</p>",
    status: "open",
    view_count: 42,
    vote_score: 5,
    is_answered: 0,
    accepted_answer_id: null,
    created_at: "2026-06-14T00:00:00.000Z",
    updated_at: "2026-06-14T00:00:00.000Z",
    likes_count: 3,
    bookmarks_count: 2,
    comments_count: 1,
    upvotes_count: 5,
    downvotes_count: 0,
    user_has_liked: false,
    user_has_bookmarked: false,
    user_vote_type: null,
    category: { id: "cat-1", name: "Web Development", slug: "web-dev" },
    tags: [{ id: "tag-1", name: "react", slug: "react", color: "#61dafb" }],
    user: { id: "user-999", username: "post_owner", reputation_points: 50, avatar_url: null },
    comments: [
      {
        id: "comm-201",
        post_id: "post-101",
        user_id: "user-123", // own comment
        parent_id: null,
        body: "Ini adalah komentar saya sendiri yang bisa diedit.",
        vote_score: 2,
        is_accepted: 0,
        created_at: "2026-06-14T01:00:00.000Z",
        user: { id: "user-123", username: "comment_user", reputation_points: 100, avatar_url: null },
        replies: [],
      },
      {
        id: "comm-202",
        post_id: "post-101",
        user_id: "user-different-999", // different comment
        parent_id: null,
        body: "Ini adalah komentar orang lain.",
        vote_score: 0,
        is_accepted: 0,
        created_at: "2026-06-14T01:05:00.000Z",
        user: { id: "user-different-999", username: "other_user", reputation_points: 50, avatar_url: null },
        replies: [],
      }
    ],
  };

  const mockCommentDetail = {
    id: "comm-201",
    post_id: "post-101",
    user_id: "user-123",
    parent_id: null,
    body: "Ini adalah komentar saya sendiri yang bisa diedit.",
    vote_score: 2,
    is_accepted: 0,
    created_at: "2026-06-14T01:00:00.000Z",
    updated_at: "2026-06-14T01:00:00.000Z",
    is_edited: true,
    user_has_liked: false,
    user_has_voted: false,
    user_vote_type: null,
    user: {
      id: "user-123",
      username: "comment_user",
      email: "comment_user@mail.com",
      avatar_url: null,
      bio: "Developer at Flexicord",
      reputation_points: 100,
      level: 1,
      is_banned: 0,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    },
    replies: [
      {
        id: "reply-301",
        post_id: "post-101",
        user_id: "user-different-999",
        parent_id: "comm-201",
        body: "Ini adalah balasan untuk komentar ini.",
        vote_score: 1,
        is_accepted: 0,
        created_at: "2026-06-14T01:10:00.000Z",
        updated_at: "2026-06-14T01:10:00.000Z",
        is_edited: false,
        user_has_liked: false,
        user_has_voted: false,
        user_vote_type: null,
        user: {
          id: "user-different-999",
          username: "other_user",
          email: "other_user@mail.com",
          avatar_url: null,
          bio: "React Specialist",
          reputation_points: 50,
          level: 1,
          is_banned: 0,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
        likes_count: 0,
        upvotes_count: 1,
        downvotes_count: 0,
        votes_count: 1,
      }
    ],
    comment_edit_histories: [
      {
        id: "hist-401",
        comment_id: "comm-201",
        edited_by: "comment_user",
        body_before: "Komentar sebelum diedit.",
        body_after: "Ini adalah komentar saya sendiri yang bisa diedit.",
        reason: "Perbaikan typo",
        edited_at: "2026-06-14T02:00:00.000Z",
      }
    ],
    likes_count: 1,
    upvotes_count: 2,
    downvotes_count: 0,
    votes_count: 2,
  };

  const mockCommentHistoriesResponse = {
    histories: [
      {
        id: "hist-401",
        comment_id: "comm-201",
        edited_by: "comment_user",
        body_before: "Komentar sebelum diedit.",
        body_after: "Ini adalah komentar saya sendiri yang bisa diedit.",
        edited_at: "2026-06-14T02:00:00.000Z",
      }
    ]
  };

  beforeEach(() => {
    // Set cookie to mock logged-in state by default
    cy.setCookie("token", "mock-token-123");

    // Standard API Intercepts
    cy.intercept("GET", "/api/me", { user: mockUser }).as("getMe");
    cy.intercept("GET", `/api/posts/${mockPost.id}`, { data: mockPost }).as("getPostDetail");
    cy.intercept("GET", `/api/comment/${mockCommentDetail.id}`, { data: mockCommentDetail }).as("getCommentDetail");
  });

  // ─── Comment View ──────────────────────────────────────────────────────────
  it("Comment view di post detail", () => {
    cy.visit(`/posts/${mockPost.id}`, {
      onBeforeLoad(win) {
        win.localStorage.setItem("devoverflow-user", JSON.stringify(mockUser));
      }
    });
    cy.wait(["@getMe", "@getPostDetail"]);

    cy.contains("Ini adalah komentar saya sendiri yang bisa diedit.").should("be.visible");
    cy.contains("Ini adalah komentar orang lain.").should("be.visible");
  });

  // ─── Comment Like ──────────────────────────────────────────────────────────
  it("Comment like & unlike di comment detail", () => {
    cy.intercept("POST", "/api/likes", { statusCode: 200, body: { message: "Status suka berhasil diperbarui" } }).as("likeComment");
    cy.intercept("DELETE", "/api/unlikes", { statusCode: 200, body: { message: "Status suka berhasil diperbarui" } }).as("unlikeComment");

    cy.visit(`/comment/${mockCommentDetail.id}`, {
      onBeforeLoad(win) {
        win.localStorage.setItem("devoverflow-user", JSON.stringify(mockUser));
      }
    });
    cy.wait(["@getMe", "@getCommentDetail"]);

    // Like
    cy.get("button").contains("Sukai").click();
    cy.wait("@likeComment");

    // Unlike
    cy.intercept("GET", `/api/comment/${mockCommentDetail.id}`, {
      data: { ...mockCommentDetail, user_has_liked: true }
    }).as("getCommentDetailLiked");

    cy.visit(`/comment/${mockCommentDetail.id}`, {
      onBeforeLoad(win) {
        win.localStorage.setItem("devoverflow-user", JSON.stringify(mockUser));
      }
    });
    cy.wait(["@getMe", "@getCommentDetailLiked"]);

    cy.get("button").contains("Disukai").click();
    cy.wait("@unlikeComment");
  });

  // ─── Comment Upvote ────────────────────────────────────────────────────────
  it("Comment upvote di comment detail", () => {
    cy.intercept("POST", "/api/vote", { statusCode: 200, body: { vote_score: 3, action: "upvoted" } }).as("upvoteComment");

    cy.visit(`/comment/${mockCommentDetail.id}`, {
      onBeforeLoad(win) {
        win.localStorage.setItem("devoverflow-user", JSON.stringify(mockUser));
      }
    });
    cy.wait(["@getMe", "@getCommentDetail"]);

    cy.get('button[title="Dukung"]').first().click();
    cy.wait("@upvoteComment");
  });

  // ─── Comment Downvote ──────────────────────────────────────────────────────
  it("Comment downvote di comment detail", () => {
    cy.intercept("POST", "/api/downvote", { statusCode: 200, body: { vote_score: 1, action: "downvoted" } }).as("downvoteComment");

    cy.visit(`/comment/${mockCommentDetail.id}`, {
      onBeforeLoad(win) {
        win.localStorage.setItem("devoverflow-user", JSON.stringify(mockUser));
      }
    });
    cy.wait(["@getMe", "@getCommentDetail"]);

    cy.get('button[title="Tolak"]').first().click();
    cy.wait("@downvoteComment");
  });

  // ─── Comment Report ────────────────────────────────────────────────────────
  it("Comment report di comment detail", () => {
    cy.intercept("POST", "/api/reports", { statusCode: 200, body: { message: "Laporan berhasil dikirim!" } }).as("reportComment");

    cy.visit(`/comment/${mockCommentDetail.id}`, {
      onBeforeLoad(win) {
        win.localStorage.setItem("devoverflow-user", JSON.stringify(mockUser));
      }
    });
    cy.wait(["@getMe", "@getCommentDetail"]);

    cy.get("button").contains("Laporkan").click();
    cy.get("input[placeholder*='Spam']").should("be.visible").type("Komentar mengandung spam link.");
    cy.get("button[type='submit']").contains("Kirim Laporan").click();
    cy.wait("@reportComment");
  });

  // ─── Comment Reply ─────────────────────────────────────────────────────────
  it("Comment reply (Kirim balasan) di comment detail", () => {
    cy.intercept("POST", "/api/comment", { statusCode: 200, body: { message: "Balasan berhasil dikirim!" } }).as("sendReply");

    cy.visit(`/comment/${mockCommentDetail.id}`, {
      onBeforeLoad(win) {
        win.localStorage.setItem("devoverflow-user", JSON.stringify(mockUser));
      }
    });
    cy.wait(["@getMe", "@getCommentDetail"]);

    cy.get("textarea[placeholder*='Tulis tanggapan']").type("Ini adalah balasan baru untuk komentar.");
    cy.get("button[type='submit']").contains("Kirim Solusi").click();
    cy.wait("@sendReply");
  });

  // ─── Comment Update (Edit) ─────────────────────────────────────────────────
  it("Comment update (edit) di post detail", () => {
    cy.intercept("PUT", `/api/comment/${mockCommentDetail.id}`, { statusCode: 200, body: { message: "Comment updated successfully" } }).as("updateComment");

    cy.visit(`/posts/${mockPost.id}`, {
      onBeforeLoad(win) {
        win.localStorage.setItem("devoverflow-user", JSON.stringify(mockUser));
      }
    });
    cy.wait(["@getMe", "@getPostDetail"]);

    // Klik tombol Edit di bawah komentar milik sendiri
    cy.get("button").contains("Edit").first().click();
    // Cari form yang mengandung tombol Simpan untuk mengisi textarea edit komentar
    cy.get("form").contains("Simpan").parents("form").find("textarea").clear().type("Isi komentar yang sudah diedit.");
    cy.get("form").contains("Simpan").click();
    cy.wait("@updateComment");
  });

  // ─── Comment Detail View ───────────────────────────────────────────────────
  it("Comment detail view", () => {
    cy.visit(`/comment/${mockCommentDetail.id}`, {
      onBeforeLoad(win) {
        win.localStorage.setItem("devoverflow-user", JSON.stringify(mockUser));
      }
    });
    cy.wait(["@getMe", "@getCommentDetail"]);

    cy.contains("Detail Komentar").should("be.visible");
    cy.contains("Ini adalah komentar saya sendiri yang bisa diedit.").should("be.visible");
    cy.contains("Balasan / Diskusi (1)").should("be.visible");
    cy.contains("Ini adalah balasan untuk komentar ini.").should("be.visible");
  });

  // ─── Comment View History ──────────────────────────────────────────────────
  it("Comment view history (Hanya untuk Admin/Moderator)", () => {
    // Override /api/me to return admin role
    cy.intercept("GET", "/api/me", { user: mockAdminUser }).as("getAdminMe");
    cy.intercept("GET", `/api/comment-histories/${mockCommentDetail.id}`, mockCommentHistoriesResponse).as("getHistories");

    cy.visit(`/comment/${mockCommentDetail.id}/history`, {
      onBeforeLoad(win) {
        win.localStorage.setItem("devoverflow-user", JSON.stringify(mockAdminUser));
      }
    });
    cy.wait(["@getAdminMe", "@getHistories"]);

    cy.contains("Riwayat Suntingan Komentar").should("be.visible");
    cy.contains("Komentar sebelum diedit.").should("be.visible");
    cy.contains("Ini adalah komentar saya sendiri yang bisa diedit.").should("be.visible");
  });

  // ─── Comment Delete (Admin/Moderator) ──────────────────────────────────────
  it("Comment delete sebagai Admin", () => {
    cy.intercept("GET", "/api/me", { user: mockAdminUser }).as("getAdminMe");
    cy.intercept("DELETE", `/api/comment/${mockCommentDetail.id}`, { statusCode: 200, body: { message: "Comment deleted successfully" } }).as("deleteComment");

    cy.visit(`/posts/${mockPost.id}`, {
      onBeforeLoad(win) {
        win.localStorage.setItem("devoverflow-user", JSON.stringify(mockAdminUser));
      }
    });
    cy.wait(["@getAdminMe", "@getPostDetail"]);

    // Pastikan kita mengklik tombol Hapus di bagian komentar, bukan tombol Hapus di bagian Post
    cy.get("div.divide-y").find("button").contains("Hapus").first().click();
    cy.wait("@deleteComment");
  });
});
