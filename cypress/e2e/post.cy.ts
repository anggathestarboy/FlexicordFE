/// <reference types="cypress" />

describe("Post E2E Tests", () => {
  // Ignore uncaught exceptions from Next.js/React hydration/hot-reloading
  Cypress.on("uncaught:exception", (err, runnable) => {
    return false;
  });

  const username = `u${Date.now().toString().slice(-11)}`;
  const email = `${username}@example.com`;
  const password = "TestPassword123!";

  // Mock Data
  const mockCategories = [
    { id: "cat-1", name: "Web Development", slug: "web-dev", description: "Diskusi seputar pengembangan web", parent_id: null, children: [] },
    { id: "cat-2", name: "Mobile Development", slug: "mobile-dev", description: "Diskusi seputar mobile apps", parent_id: null, children: [] },
  ];

  const mockTags = [
    { id: "tag-1", name: "react", slug: "react", color: "#61dafb", usage_count: 15 },
    { id: "tag-2", name: "nextjs", slug: "nextjs", color: "#000000", usage_count: 10 },
  ];

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

  const mockPost = {
    id: "post-101",
    user_id: "user-123",
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
    category: mockCategories[0],
    tags: [mockTags[0]],
    user: mockUser,
    comments: [
      {
        id: "comm-201",
        post_id: "post-101",
        user_id: "user-999",
        parent_id: null,
        body: "Anda dapat menggunakan cy.intercept untuk mempermudah mocking API.",
        vote_score: 2,
        is_accepted: 0,
        created_at: "2026-06-14T01:00:00.000Z",
        user: { id: "user-999", username: "helper_dev", reputation_points: 50, avatar_url: null },
        replies: [],
      },
    ],
  };

  /**
   * Registers the test user once and caches the session (including the `token` cookie).
   * Subsequent calls within the same test run restore the cached cookie so that
   * Next.js middleware allows access to protected routes.
   */
  const setupUserSession = () => {
    cy.session([username, "post-tests"], () => {
      cy.visit("/register");
      cy.get('input[name="username"]').type(username);
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type(password);
      cy.get('button[type="submit"]').contains(/register|daftar/i).click();
      cy.url().should("eq", Cypress.config("baseUrl") + "/");
    });
  };

  beforeEach(() => {
    // Restore token cookie so middleware allows access to protected routes
    setupUserSession();

    // Standard API intercepts
    cy.intercept("GET", "/api/me", { user: mockUser }).as("getMe");
    cy.intercept("GET", "/api/categories", { data: mockCategories }).as("getCategories");
    cy.intercept("GET", "/api/tags", { data: mockTags }).as("getTags");
    cy.intercept("GET", "/api/bookmark", { data: [] }).as("getBookmark");
    cy.intercept("GET", "/api/posts?*", { data: [mockPost], last_page: 1, total: 1 }).as("getPosts");
    cy.intercept("GET", `/api/posts/${mockPost.id}`, { data: mockPost }).as("getPostDetail");
  });

  it("Post list view", () => {
    cy.visit("/homepage");
    cy.wait(["@getMe", "@getPosts"]);
    cy.contains("Semua Pertanyaan").should("be.visible");
    cy.contains(mockPost.title).should("be.visible");
  });

  it("Post list by category", () => {
    cy.intercept("GET", `/api/posts/category/${mockCategories[0].slug}?*`, { data: [mockPost], last_page: 1, total: 1 }).as("getPostsByCategory");
    cy.visit(`/category?slug=${mockCategories[0].slug}`);
    cy.wait(["@getMe", "@getCategories", "@getPostsByCategory"]);
    cy.contains(`Kategori: ${mockCategories[0].name}`).should("be.visible");
    cy.contains(mockPost.title).should("be.visible");
  });

  it("Post list by tag", () => {
    cy.intercept("GET", `/api/posts/tag/${mockTags[0].slug}?*`, { data: [mockPost], last_page: 1, total: 1 }).as("getPostsByTag");
    cy.visit(`/tag?slug=${mockTags[0].slug}`);
    cy.wait(["@getMe", "@getTags", "@getPostsByTag"]);
    cy.contains(`Diskusi Tag: ${mockTags[0].name}`).should("be.visible");
    cy.contains(mockPost.title).should("be.visible");
  });

  it("Post create gagal", () => {
    cy.visit("/ask");
    cy.wait(["@getMe", "@getCategories", "@getTags"]);

    cy.get("input#q-title").type("Pendek");
    cy.get("select#q-category").select(mockCategories[0].name);
    cy.get("#btn-submit-question").click();
    cy.contains("Judul harus spesifik").should("be.visible");
  });

  it("Post create berhasil", () => {
    cy.intercept("POST", "/api/posts", {
      statusCode: 201,
      body: { message: "Pertanyaan publik baru Anda berhasil diterbitkan!", data: mockPost },
    }).as("createPost");

    cy.visit("/ask");
    cy.wait(["@getMe", "@getCategories", "@getTags"]);

    cy.get("input#q-title").type("Ini adalah contoh pertanyaan baru berdurasi 15 karakter lebih");
    cy.get("select#q-category").select(mockCategories[0].name);
    cy.get(".ql-editor").type("Detail pertanyaan harus minimal 40 karakter agar lolos validasi client-side.");
    cy.get("input#q-tags").type("react");
    cy.contains("#react").click();

    cy.get("#btn-submit-question").click();
    cy.wait("@createPost");
    cy.url().should("include", "/homepage");
  });

  it("Post detail view", () => {
    cy.visit(`/posts/${mockPost.id}`);
    cy.wait(["@getMe", "@getPostDetail"]);
    cy.contains(mockPost.title).should("be.visible");
    cy.contains("Ditanyakan:").should("be.visible");
  });

  it("Post like", () => {
    cy.intercept("POST", "/api/likes", { statusCode: 200, body: { message: "Liked successfully" } }).as("likePost");

    cy.visit(`/posts/${mockPost.id}`);
    cy.wait(["@getMe", "@getPostDetail"]);

    cy.get('button[title="Like pertanyaan ini"]').click();
    cy.wait("@likePost");
  });

  it("Post unlike", () => {
    const likedPost = { ...mockPost, user_has_liked: true };
    cy.intercept("GET", `/api/posts/${mockPost.id}`, { data: likedPost }).as("getLikedPostDetail");
    cy.intercept("DELETE", "/api/unlikes", { statusCode: 200, body: { message: "Unliked successfully" } }).as("unlikePost");

    cy.visit(`/posts/${mockPost.id}`);
    cy.wait(["@getMe", "@getLikedPostDetail"]);

    cy.get('button[title="Like pertanyaan ini"]').click();
    cy.wait("@unlikePost");
  });

  it("Post bookmark", () => {
    cy.intercept("POST", "/api/bookmark", { statusCode: 200, body: { message: "Bookmarked successfully", data: { id: "bm-999" } } }).as("bookmarkPost");

    cy.visit(`/posts/${mockPost.id}`);
    cy.wait(["@getMe", "@getPostDetail"]);

    cy.get('button[title="Bookmark pertanyaan ini"]').click();
    cy.wait("@bookmarkPost");
  });

  it("Post unbookmark", () => {
    const bookmarkedPost = { ...mockPost, user_has_bookmarked: true, bookmark_id: "bm-999" };
    cy.intercept("GET", `/api/posts/${mockPost.id}`, { data: bookmarkedPost }).as("getBookmarkedPostDetail");
    cy.intercept("DELETE", "/api/bookmark/bm-999", { statusCode: 200, body: { message: "Unbookmarked successfully" } }).as("unbookmarkPost");

    cy.visit(`/posts/${mockPost.id}`);
    cy.wait(["@getMe", "@getBookmarkedPostDetail"]);

    cy.get('button[title="Bookmark pertanyaan ini"]').click();
    cy.wait("@unbookmarkPost");
  });

  it("Post upvote", () => {
    cy.intercept("POST", "/api/vote", { statusCode: 200, body: { vote_score: 6, action: "upvoted" } }).as("upvotePost");

    cy.visit(`/posts/${mockPost.id}`);
    cy.wait(["@getMe", "@getPostDetail"]);

    cy.get('button[title="Sangat berkontribusi (Mendukung)"]').click();
    cy.wait("@upvotePost");
  });

  it("Post downvote", () => {
    cy.intercept("POST", "/api/downvote", { statusCode: 200, body: { vote_score: 4, action: "downvoted" } }).as("downvotePost");

    cy.visit(`/posts/${mockPost.id}`);
    cy.wait(["@getMe", "@getPostDetail"]);

    cy.get('button[title="Kurang berkontribusi (Menolak)"]').click();
    cy.wait("@downvotePost");
  });

  it("Post comment", () => {
    cy.intercept("POST", "/api/comment", { statusCode: 200, body: { message: "Comment added successfully" } }).as("addComment");

    cy.visit(`/posts/${mockPost.id}`);
    cy.wait(["@getMe", "@getPostDetail"]);

    cy.get("#answer-body-textarea").type("Ini adalah komentar balasan baru yang ditulis di post detail.");
    cy.get("#btn-submit-answer").click();
    cy.wait("@addComment");
  });

  it("Post update", () => {
    cy.intercept("PUT", `/api/posts/${mockPost.id}`, { statusCode: 200, body: { message: "post berhasil diperbarui" } }).as("updatePost");

    cy.visit(`/posts/${mockPost.id}`);
    cy.wait(["@getMe", "@getPostDetail"]);

    cy.get("button").contains("Edit").click();
    cy.get("input[value='Bagaimana cara melakukan testing Cypress dengan baik?']").clear().type("Update Judul Baru Untuk Postingan Ini");
    cy.get("button[type='submit']").contains("Simpan Perubahan").click();
    cy.wait("@updatePost");
  });

  it("Post view history update", () => {
    cy.visit(`/posts/${mockPost.id}`);
    cy.wait(["@getMe", "@getPostDetail"]);
    cy.contains("42 kali").should("be.visible");
  });

  it("Post mark as answer", () => {
    cy.intercept("POST", `/api/posts/${mockPost.id}/answer`, { statusCode: 200, body: { message: "Answer accepted" } }).as("acceptAnswer");

    cy.visit(`/posts/${mockPost.id}`);
    cy.wait(["@getMe", "@getPostDetail"]);

    cy.get('button[title="Tandai sebagai solusi/jawaban terbaik"]').first().click();
    cy.wait("@acceptAnswer");
  });

  it("Post report", () => {
    cy.intercept("POST", "/api/reports", { statusCode: 200, body: { message: "Report submitted successfully" } }).as("submitReport");

    cy.visit(`/posts/${mockPost.id}`);
    cy.wait(["@getMe", "@getPostDetail"]);

    cy.get("#cy-btn-report").click();
    cy.get("input[placeholder*='Spam']").type("Spamming post content");
    cy.get("button[type='submit']").contains("Kirim Laporan").click();
    cy.wait("@submitReport");
  });

  it("Post close", () => {
    cy.intercept("POST", `/api/posts/${mockPost.id}/close`, { statusCode: 200, body: { message: "Post closed successfully" } }).as("closePost");

    cy.visit(`/posts/${mockPost.id}`);
    cy.wait(["@getMe", "@getPostDetail"]);

    cy.get("button").contains("Tutup").click();
    cy.wait("@closePost");
  });

  it("Post delete", () => {
    cy.intercept("DELETE", `/api/posts/${mockPost.id}`, { statusCode: 200, body: { message: "Post deleted successfully" } }).as("deletePost");

    cy.visit(`/posts/${mockPost.id}`);
    cy.wait(["@getMe", "@getPostDetail"]);

    cy.get('button[title="Hapus Postingan"]').click();
    cy.wait("@deletePost");
  });

  it("Post delete other users - Admin", () => {
    const otherUserPost = {
      ...mockPost,
      user_id: "user-different-999",
      user: { ...mockUser, id: "user-different-999", username: "other_user" },
    };

    // Override /api/me to return 401/null user so we are a guest on /login page
    cy.intercept("GET", "/api/me", { statusCode: 401, body: { message: "Unauthorized" } }).as("getGuestMe");
    cy.intercept("GET", `/api/posts/${mockPost.id}`, { data: otherUserPost }).as("getOtherPostDetail");
    cy.intercept("DELETE", `/api/posts/${mockPost.id}`, { statusCode: 200, body: { message: "Post deleted successfully" } }).as("deleteOtherPost");

    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    cy.visit("/login");
    
    cy.get('input[name="username"]').should("be.visible").should("not.be.disabled").type("anggaraa");
    cy.get('input[name="password"]').should("be.visible").should("not.be.disabled").type("aksata");
    cy.get('button[type="submit"]').contains(/login|masuk/i).click();
    cy.url().should("eq", Cypress.config("baseUrl") + "/");

    // Real login as admin (gets real token cookie for middleware)
    // Now intercept /api/me to return the admin user details
    cy.intercept("GET", "/api/me", {
      user: {
        ...mockUser,
        id: "admin-123",
        username: "anggaraa",
        roles: [{ id: "r-2", name: "admin" }],
        primary_role: { name: "admin" },
      },
    }).as("getAdminMe");

    cy.visit(`/posts/${mockPost.id}`);
    cy.wait(["@getAdminMe", "@getOtherPostDetail"]);
    cy.get('button[title="Hapus Postingan"]').click();
    cy.wait("@deleteOtherPost");
  });

  it("Post delete other users - Moderator", () => {
    const otherUserPost = {
      ...mockPost,
      user_id: "user-different-999",
      user: { ...mockUser, id: "user-different-999", username: "other_user" },
    };

    // Override /api/me to return 401/null user so we are a guest on /login page
    cy.intercept("GET", "/api/me", { statusCode: 401, body: { message: "Unauthorized" } }).as("getGuestMe");
    cy.intercept("GET", `/api/posts/${mockPost.id}`, { data: otherUserPost }).as("getOtherPostDetail");
    cy.intercept("DELETE", `/api/posts/${mockPost.id}`, { statusCode: 200, body: { message: "Post deleted successfully" } }).as("deleteOtherPost");

    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    cy.visit("/login");
    cy.wait("@getGuestMe");

    cy.get('input[name="username"]').should("be.visible").should("not.be.disabled").type("reifan");
    cy.get('input[name="password"]').should("be.visible").should("not.be.disabled").type("aksata");
    cy.get('button[type="submit"]').contains(/login|masuk/i).click();
    cy.url().should("eq", Cypress.config("baseUrl") + "/");

    // Real login as moderator (gets real token cookie for middleware)
    // Now intercept /api/me to return the moderator user details
    cy.intercept("GET", "/api/me", {
      user: {
        ...mockUser,
        id: "mod-123",
        username: "reifan",
        roles: [{ id: "r-3", name: "moderator" }],
        primary_role: { name: "moderator" },
      },
    }).as("getModMe");

    cy.visit(`/posts/${mockPost.id}`);
    cy.wait(["@getModMe", "@getOtherPostDetail"]);
    cy.get('button[title="Hapus Postingan"]').click();
    cy.wait("@deleteOtherPost");
  });
});

