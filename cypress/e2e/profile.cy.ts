/// <reference types="cypress" />

describe("Profile E2E Tests", () => {
  const username = `u${Date.now().toString().slice(-9)}`;
  const email = `${username}@example.com`;
  const password = "TestPassword123!";

  // Mock structures matching application schema
  const mockUser = {
    id: "user-123",
    username: username,
    email: email,
    avatar_url: null,
    bio: "Developer at Flexicord",
    reputation_points: 1500,
    level: 4,
    is_banned: 0,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-02T00:00:00.000Z",
    posts_count: 2,
    followers_count: 42,
    following_count: 24,
    badges_count: 2,
    roles: [{ id: "r-1", name: "user" }],
    primary_role: { name: "user" },
    badges: [
      { id: "b-1", name: "First Post", description: "Menulis pertanyaan pertama", color: "#cd7f32" }
    ],
    posts: [
      {
        id: "post-101",
        user_id: "user-123",
        category_id: "cat-1",
        title: "Bagaimana cara deploy Next.js ke Vercel?",
        body: "Saya butuh panduan lengkap deploy Next.js.",
        status: "open",
        view_count: 120,
        vote_score: 10,
        is_answered: 1,
        created_at: "2026-01-05T10:00:00.000Z",
        likes_count: 5,
        bookmarks_count: 2,
        comments_count: 3,
        upvotes_count: 10,
        downvotes_count: 0,
        user_has_liked: false,
        user_has_bookmarked: false,
        tags: [{ id: "tag-1", name: "react", slug: "react", color: "#61dafb" }],
        category: { id: "cat-1", name: "Web Development", slug: "web-dev" }
      }
    ]
  };

  const mockOtherUser = {
    id: "user-456",
    username: "otherdev",
    email: "other@example.com",
    avatar_url: null,
    bio: "React Specialist",
    reputation_points: 900,
    level: 3,
    is_banned: 0,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-02T00:00:00.000Z",
    posts_count: 1,
    followers_count: 10,
    following_count: 15,
    badges_count: 1,
    roles: [{ id: "r-1", name: "user" }],
    primary_role: { name: "user" },
    badges: [],
    posts: []
  };

  const mockLikesResponse = {
    likes: [
      {
        id: "like-1",
        user_id: "user-123",
        target_id: "post-999",
        target_type: "post",
        created_at: "2026-01-07T00:00:00.000Z",
        post: {
          id: "post-999",
          title: "Bagaimana menggunakan Cypress E2E?",
          body: "Saya sedang mencoba Cypress untuk pertama kali.",
          status: "open",
          view_count: 12,
          vote_score: 4,
          is_answered: 0,
          created_at: "2026-01-07T00:00:00.000Z"
        },
        comment: null
      }
    ]
  };

  const mockBookmarksResponse = {
    data: [
      {
        id: "bm-1",
        user_id: "user-123",
        post_id: "post-777",
        created_at: "2026-01-09T00:00:00.000Z"
      }
    ]
  };

  const mockPost777Detail = {
    id: "post-777",
    title: "Tutorial Tailwind CSS v4",
    body: "Bagaimana mengaktifkan postcss di Tailwind CSS v4?",
    status: "open",
    view_count: 100,
    vote_score: 12,
    is_answered: 1,
    likes_count: 8,
    comments_count: 5,
    upvotes_count: 12,
    created_at: "2026-01-09T00:00:00.000Z",
    category: { id: "cat-3", name: "CSS", slug: "css" },
    tags: [{ id: "tag-tailwind", name: "tailwind", color: "#38bdf8" }],
    user: { id: "user-999", username: "cssguy", avatar_url: null }
  };

  const mockReportsResponse = {
    data: {
      data: [
        {
          id: "rep-1",
          reporter_id: "user-999",
          target_id: "user-123",
          reason: "Spamming",
          description: "User ini mengirimkan pesan spam.",
          created_at: "2026-06-14T00:00:00.000Z",
          reporter: { id: "user-999", username: "cssguy" }
        }
      ]
    }
  };

  const mockPointLogsResponse = {
    reputation_points: 1500,
    data: [
      {
        id: "log-1",
        points: 50,
        source: "post_accepted",
        description: "Jawaban Anda diterima sebagai solusi",
        created_at: "2026-06-14T01:00:00.000Z"
      },
      {
        id: "log-2",
        points: 10,
        source: "post_upvoted",
        description: "Postingan Anda mendapatkan upvote",
        created_at: "2026-06-14T00:00:00.000Z"
      }
    ]
  };

  /**
   * Registers the test user once and caches the session (including the `token` cookie).
   * Subsequent calls restore the cached cookie so that Next.js middleware
   * allows access to protected routes like /profile, /profile/edit, etc.
   */
  const setupUserSession = () => {
    cy.session([username, "profile-tests"], () => {
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
    cy.intercept("GET", `/api/profile/${username}`, { message: "Detail profil berhasil dimuat", user: mockUser, is_following: false }).as("getProfileDetail");
    cy.intercept("GET", `/api/profile/otherdev`, { message: "Detail profil berhasil dimuat", user: mockOtherUser, is_following: false }).as("getOtherProfileDetail");
    cy.intercept("GET", `/api/likes-user/${username}`, mockLikesResponse).as("getLikes");
    cy.intercept("GET", "/api/bookmark", mockBookmarksResponse).as("getBookmarks");
    cy.intercept("GET", "/api/posts/post-777", { data: mockPost777Detail }).as("getPost777");
    cy.intercept("GET", "/api/reports", mockReportsResponse).as("getReports");
    cy.intercept("GET", `/api/points-logs/user/${username}`, mockPointLogsResponse).as("getPointLogs");
  });

  it("Profile view current user", () => {
    cy.visit("/profile");
    cy.wait(["@getMe", "@getProfileDetail"]);

    cy.get("h1", { timeout: 10000 }).should("contain", username);
    cy.contains("Developer at Flexicord").should("be.visible");
  });

  it("Profile view other user", () => {
    cy.visit("/profile/otherdev");
    cy.wait(["@getMe", "@getOtherProfileDetail"]);

    cy.get("h1").should("contain", "otherdev");
    cy.contains("React Specialist").should("be.visible");
    cy.contains("900").should("be.visible");
  });

  it("Profile update personal data", () => {
    cy.visit("/profile");
    cy.wait(["@getMe", "@getProfileDetail"]);
    cy.get("h1", { timeout: 10000 }).should("contain", username);

    cy.get("#btn-edit-profile-toggle").click();
    cy.url().should("include", "/profile/edit");

    // Stub profile update API
    cy.intercept("POST", "/api/profile/update", { statusCode: 200, body: { message: "Profil akun berhasil diperbarui" } }).as("updateProfile");

    cy.get("textarea#bio", { timeout: 10000 }).should("be.visible").clear().type("New updated biography content here");
    cy.get("button[type='submit']").click();
    cy.wait("@updateProfile");

    // Verify still on edit page with the updated bio value visible
    cy.get("textarea#bio").should("contain.value", "New updated biography content here");
  });

  it("Profile update password", () => {
    cy.visit("/profile");
    cy.wait(["@getMe", "@getProfileDetail"]);

    cy.get("#btn-change-password-toggle").click();
    cy.url().should("include", "/profile/change-password");

    // Stub change password API
    cy.intercept("POST", "/api/change-password", { statusCode: 200, body: { success: true, message: "Password berhasil diperbarui" } }).as("changePassword");

    cy.get("input#current_password").type("TestPassword123!");
    cy.get("input#new_password").type("NewPassword123!");
    cy.get("input#new_password_confirmation").type("NewPassword123!");
    cy.get("button[type='submit']").click();
    cy.wait("@changePassword");
    cy.contains("Password berhasil diperbarui").should("be.visible");
  });

  it("Profile view following", () => {
    const mockFollowingResponse = [mockOtherUser];
    cy.intercept("GET", `/api/profile/${username}/following`, { data: mockFollowingResponse }).as("getFollowingList");

    cy.visit("/profile");
    cy.wait(["@getMe", "@getProfileDetail"]);

    cy.contains("mengikuti").click();
    cy.url().should("include", "/following");
  });

  it("Profile view followers", () => {
    const mockFollowersResponse = [mockOtherUser];
    cy.intercept("GET", `/api/profile/${username}/followers`, { data: mockFollowersResponse }).as("getFollowersList");

    cy.visit("/profile");
    cy.wait(["@getMe", "@getProfileDetail"]);

    cy.contains("pengikut").click();
    cy.url().should("include", "/followers");
  });

  it("Profile view like by current user", () => {
    cy.visit("/profile");
    cy.wait(["@getMe", "@getProfileDetail"]);

    cy.get("button").contains("Disukai").click();
    cy.wait("@getLikes");
    cy.contains("Bagaimana menggunakan Cypress E2E?").should("be.visible");
  });

  it("Profile view bookmark", () => {
    cy.visit("/profile");
    cy.wait(["@getMe", "@getProfileDetail"]);

    cy.get("button").contains("Bookmark").click();
    cy.wait(["@getBookmarks", "@getPost777"]);
    cy.contains("Tutorial Tailwind CSS v4").should("be.visible");
  });

  it("Profile view post by current user", () => {
    cy.visit("/profile");
    cy.wait(["@getMe", "@getProfileDetail"]);
    cy.get("h1", { timeout: 10000 }).should("contain", username);

    cy.get("button").contains("Pertanyaan").click();
    cy.contains("Bagaimana cara deploy Next.js ke Vercel?").should("be.visible");
  });

  it("Profile follow other user", () => {
    cy.intercept("POST", "/api/follows", { statusCode: 200, body: { message: "Followed successfully" } }).as("followUser");

    cy.visit("/profile/otherdev");
    cy.wait(["@getMe", "@getOtherProfileDetail"]);

    cy.get("#btn-follow-toggle").click();
    cy.wait("@followUser");
    cy.contains("Mengikuti").should("be.visible");
  });

  it("Profile unfoll other user", () => {
    // User is already followed initially
    cy.intercept("GET", `/api/profile/otherdev`, { message: "Detail profil", user: mockOtherUser, is_following: true }).as("getOtherProfileFollowed");
    cy.intercept("DELETE", "/api/follows", { statusCode: 200, body: { message: "Unfollowed successfully" } }).as("unfollowUser");

    cy.visit("/profile/otherdev");
    cy.wait(["@getMe", "@getOtherProfileFollowed"]);

    cy.get("#btn-follow-toggle").click();
    cy.wait("@unfollowUser");
    cy.contains("Ikuti").should("be.visible");
  });

  it("Profile view report by current user", () => {
    cy.visit("/profile");
    cy.wait(["@getMe", "@getProfileDetail"]);

    cy.get("button").contains("Laporan Saya").click();
    cy.wait("@getReports");
  });

  it("Profile Point log", () => {
    cy.visit("/profile");
    cy.wait(["@getMe", "@getProfileDetail"]);

    cy.get("button").contains("Histori Point").click();
    cy.wait("@getPointLogs");
    cy.contains("Jawaban Anda diterima sebagai solusi").should("be.visible");
    cy.contains("+50").should("be.visible");
    cy.contains("+10").should("be.visible");
  });
});
