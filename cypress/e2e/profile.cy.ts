/// <reference types="cypress" />

describe("Halaman Profil & Edit Profil - Fitur Utama", () => {
  // ─── Mock Data ─────────────────────────────────────────────────────────────

  const mockUser = {
    user: {
      id: "user-123",
      username: "tester",
      email: "tester@example.com",
      avatar_url: null,
      bio: "Developer di Flexicord",
      reputation_points: 0,
      level: 1,
      is_banned: 0,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-02T00:00:00.000Z",
      posts_count: 2,
      followers_count: 42,
      following_count: 24,
      badges_count: 2,
      roles: [
        {
          id: "r-1",
          name: "user",
          permissions: null,
          created_at: "2026-01-01T00:00:00Z",
          pivot: { user_id: "user-123", role_id: "r-1" },
        },
      ],
    },
  };

  const mockUserDetailResponse = {
    message: "Detail profil berhasil dimuat",
    user: {
      id: "user-123",
      username: "tester",
      email: "tester@example.com",
      avatar_url: null,
      bio: "Developer di Flexicord",
      reputation_points: 0,
      level: 1,
      is_banned: 0,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-02T00:00:00.000Z",
      posts_count: 2,
      followers_count: 42,
      following_count: 24,
      badges_count: 2,
      roles: [
        {
          id: "r-1",
          name: "user",
          permissions: null,
          created_at: "2026-01-01T00:00:00Z",
          pivot: { user_id: "user-123", role_id: "r-1" },
        },
      ],
      badges: [
        {
          id: "b-1",
          name: "First Post",
          description: "Menulis pertanyaan pertama",
          icon_url: null,
          tier: "bronze",
          condition_type: "post_count",
          condition_value: 1,
          pivot: {
            user_id: "user-123",
            badge_id: "b-1",
            created_at: "2026-01-02T00:00:00.000Z",
            updated_at: "2026-01-02T00:00:00.000Z",
          },
        },
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
          accepted_answer_id: "ans-201",
          created_at: "2026-01-05T10:00:00.000Z",
          updated_at: "2026-01-05T10:00:00.000Z",
          likes_count: 5,
          bookmarks_count: 2,
          comments_count: 3,
          upvotes_count: 10,
          downvotes_count: 0,
          votes_count: 10,
          user_has_liked: false,
          user_has_bookmarked: false,
          tags: [],
          category: { id: "cat-1", name: "Web Dev", slug: "web-dev" },
        },
      ],
    },
    is_following: false,
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
          created_at: "2026-01-07T00:00:00.000Z",
        },
        comment: null,
      },
      {
        id: "like-2",
        user_id: "user-123",
        target_id: "comment-888",
        target_type: "comment",
        created_at: "2026-01-08T00:00:00.000Z",
        post: null,
        comment: {
          id: "comment-888",
          post_id: "post-999",
          body: "Coba gunakan cy.intercept untuk mempermudah mock API.",
          vote_score: 8,
          is_accepted: 1,
          created_at: "2026-01-08T00:00:00.000Z",
        },
      },
    ],
  };

  const mockBookmarksResponse = {
    message: "Bookmark fetched successfully",
    data: [
      {
        id: "bm-1",
        user_id: "user-123",
        post_id: "post-777",
        created_at: "2026-01-09T00:00:00.000Z",
      },
    ],
  };

  // Detail post-101 (milik user sendiri) — butuh field user & category lengkap
  const mockPost101Detail = {
    message: "Post detail fetched",
    data: {
      id: "post-101",
      user_id: "user-123",
      category_id: "cat-1",
      title: "Bagaimana cara deploy Next.js ke Vercel?",
      body: "Saya butuh panduan lengkap deploy Next.js.",
      status: "open",
      view_count: 120,
      vote_score: 10,
      is_answered: 1,
      accepted_answer_id: "ans-201",
      created_at: "2026-01-05T10:00:00.000Z",
      updated_at: "2026-01-05T10:00:00.000Z",
      likes_count: 5,
      bookmarks_count: 2,
      comments_count: 0,
      upvotes_count: 10,
      downvotes_count: 0,
      votes_count: 10,
      user_has_liked: false,
      user_has_bookmarked: false,
      tags: [],
      category: { id: "cat-1", name: "Web Dev", slug: "web-dev" },
      user: { id: "user-123", username: "tester", avatar_url: null, reputation_points: 0 },
      comments: [],
    },
  };

  // Detail post-999 (liked post — user_has_liked: true)
  const mockLikedPostDetail = {
    message: "Post detail fetched",
    data: {
      id: "post-999",
      title: "Bagaimana menggunakan Cypress E2E?",
      body: "Saya sedang mencoba Cypress untuk pertama kali.",
      status: "open",
      view_count: 12,
      vote_score: 4,
      is_answered: 0,
      likes_count: 5,
      bookmarks_count: 1,
      comments_count: 1,
      upvotes_count: 4,
      created_at: "2026-01-07T00:00:00.000Z",
      category: { id: "cat-1", name: "Testing", slug: "testing" },
      tags: [],
      user: { id: "user-123", username: "tester", avatar_url: null, reputation_points: 0 },
      user_has_liked: true,
      user_has_bookmarked: false,
      comments: [
        {
          id: "comment-888",
          body: "Coba gunakan cy.intercept untuk mempermudah mock API.",
          vote_score: 8,
          is_accepted: 1,
          created_at: "2026-01-08T00:00:00.000Z",
          user_has_liked: false,
          likes_count: 2,
          user: { id: "user-456", username: "helper", avatar_url: null, reputation_points: 200 },
          replies: [],
        },
      ],
    },
  };

  // Detail post-777 (bookmarked post — user_has_bookmarked: true, bookmark_id: "bm-1")
  const mockBookmarkedPostDetail = {
    message: "Post detail fetched",
    data: {
      id: "post-777",
      title: "Tutorial Tailwind CSS v4",
      body: "Bagaimana mengaktifkan postcss di Tailwind CSS v4?",
      status: "open",
      view_count: 100,
      vote_score: 12,
      is_answered: 1,
      likes_count: 8,
      bookmarks_count: 2,
      comments_count: 0,
      upvotes_count: 12,
      created_at: "2026-01-09T00:00:00.000Z",
      category: { id: "cat-3", name: "CSS", slug: "css" },
      tags: [],
      user: { id: "user-999", username: "cssguy", avatar_url: null, reputation_points: 800 },
      user_has_liked: false,
      user_has_bookmarked: true,
      bookmark_id: "bm-1",
      comments: [],
    },
  };

  // ─── beforeEach ────────────────────────────────────────────────────────────

  beforeEach(() => {
    cy.intercept("GET", "/api/me", mockUser).as("getMe");
    cy.intercept("GET", "/api/profile/tester", mockUserDetailResponse).as("getProfileDetail");
    cy.intercept("GET", "/api/likes-user/tester", mockLikesResponse).as("getLikes");

    // /api/bookmark dipakai oleh: Tab Bookmark (list), DAN post detail page (fetch bookmark_id)
    cy.intercept("GET", "/api/bookmark", mockBookmarksResponse).as("getBookmarks");

    cy.intercept("GET", "/api/posts/post-101", mockPost101Detail).as("getPost101");
    cy.intercept("GET", "/api/posts/post-999", mockLikedPostDetail).as("getPost999");
    cy.intercept("GET", "/api/posts/post-777", mockBookmarkedPostDetail).as("getPost777");

    cy.intercept("DELETE", "/api/unlikes", {
      statusCode: 200,
      body: { message: "Unliked successfully" },
    }).as("unlikePost");

    cy.intercept("DELETE", "/api/bookmark/bm-1", {
      statusCode: 200,
      body: { message: "Bookmark deleted" },
    }).as("deleteBookmark");
  });

  // ─── Test 1: Edit Profil ───────────────────────────────────────────────────

  it("1. Menguji alur edit profil", () => {
    cy.visit("/profile");
    cy.wait(["@getMe", "@getProfileDetail"]);

    cy.get("#btn-edit-profile-toggle").click();
    cy.url().should("include", "/profile/edit");

    const updatedUser = {
      user: {
        ...mockUser.user,
        username: "testernew",
        email: "newemail@example.com",
        bio: "Perubahan bio tester",
      },
    };

    const updatedUserDetail = {
      ...mockUserDetailResponse,
      user: {
        ...mockUserDetailResponse.user,
        username: "testernew",
        email: "newemail@example.com",
        bio: "Perubahan bio tester",
      },
    };

    cy.intercept("POST", "/api/profile/update", {
      statusCode: 200,
      body: { message: "Profil akun berhasil diperbarui" },
    }).as("updateProfileSuccess");

    cy.intercept("GET", "/api/me", updatedUser).as("getMeUpdated");
    cy.intercept("GET", "/api/profile/testernew", updatedUserDetail).as("getProfileDetailUpdated");

    cy.get("input#username").clear().type("testernew");
    cy.get("input#email").clear().type("newemail@example.com");
    cy.get("textarea#bio").clear().type("Perubahan bio tester");

    cy.get("button[type='submit']").click();
    cy.wait("@updateProfileSuccess");

    cy.url().should("include", "/profile");
    cy.get("h1").should("contain", "testernew");
    cy.get("p").should("contain", "Perubahan bio tester");
  });

  // ─── Test 2: Tab Posts — View Detail Post ──────────────────────────────────

  it("2. Tab Pertanyaan: klik post untuk melihat detail post", () => {
    cy.visit("/profile");
    cy.wait(["@getMe", "@getProfileDetail"]);

    // Pindah ke tab Pertanyaan (sudah aktif by default, tapi klik untuk pasti)
    cy.get("#tab-posts").should("be.visible").click();

    // Verifikasi list post tampil
    cy.get(".space-y-2").should("be.visible");
    cy.contains("Bagaimana cara deploy Next.js ke Vercel?").should("be.visible");

    // Klik post pertama → navigasi ke detail
    cy.get(".space-y-2").find(".cursor-pointer").first().click();

    // Tunggu request post detail selesai
    cy.wait("@getPost101");

    // Tunggu loading state hilang (text dari post detail page: "Memuat pertanyaan...")
    cy.contains("Memuat pertanyaan").should("not.exist");

    // Verifikasi URL dan konten halaman detail
    cy.url().should("include", "/posts/post-101");
    cy.contains("Bagaimana cara deploy Next.js ke Vercel?").should("be.visible");
  });

  // ─── Test 3: Tab Likes — View Detail Post yang Di-like ────────────────────

  it("3. Tab Disukai: melihat daftar like dan klik detail post yang di-like", () => {
    cy.visit("/profile");
    cy.wait(["@getMe", "@getProfileDetail"]);

    // Pindah ke tab Disukai
    cy.get("#tab-likes").should("be.visible").click();
    cy.wait("@getLikes");

    // Verifikasi daftar like tampil — badge "Post" dan judul post terlihat
    cy.get(".space-y-2").should("be.visible");
    cy.contains("Post").should("be.visible");
    cy.contains("Bagaimana menggunakan Cypress E2E?").should("be.visible");

    // Klik liked post (item pertama, tipe post)
    cy.get(".space-y-2").find(".cursor-pointer.group").first().click();

    // Tunggu request post detail
    cy.wait("@getPost999");
    cy.contains("Memuat pertanyaan").should("not.exist");

    // Verifikasi URL dan konten halaman detail post
    cy.url().should("include", "/posts/post-999");
    cy.contains("Bagaimana menggunakan Cypress E2E?").should("be.visible");
  });

  // ─── Test 4: Tab Likes — View Detail Comment yang Di-like ─────────────────

  it("4. Tab Disukai: klik comment yang di-like untuk melihat post yang berisi comment itu", () => {
    cy.visit("/profile");
    cy.wait(["@getMe", "@getProfileDetail"]);

    // Pindah ke tab Disukai
    cy.get("#tab-likes").should("be.visible").click();
    cy.wait("@getLikes");

    // Verifikasi item ke-2 adalah tipe Komentar:
    // badge "Komentar" ada di outer card div (di atas .cursor-pointer.group)
    cy.get(".space-y-2").children().eq(1).within(() => {
      cy.contains("Komentar").should("be.visible");
    });
    // Isi komentar & label navigasi ada di dalam .cursor-pointer.group
    cy.get(".space-y-2").find(".cursor-pointer.group").eq(1).within(() => {
      cy.contains("Coba gunakan cy.intercept untuk mempermudah mock API.").should("be.visible");
      cy.contains("klik untuk lihat post").should("be.visible");
    });

    // Klik liked comment (item ke-2) → navigasi ke post yang berisi komentar
    cy.get(".space-y-2").find(".cursor-pointer.group").eq(1).click();

    // Tunggu request post detail (comment.post_id = "post-999")
    cy.wait("@getPost999");
    cy.contains("Memuat pertanyaan").should("not.exist");

    // Verifikasi berada di halaman detail post yang memuat comment tersebut
    cy.url().should("include", "/posts/post-999");
    cy.contains("Coba gunakan cy.intercept untuk mempermudah mock API.").should("be.visible");
  });

  // ─── Test 5: Tab Likes — Unlike Post dari Halaman Detail ──────────────────

  it("5. Tab Disukai: masuk ke detail liked post lalu unlike", () => {
    cy.visit("/profile");
    cy.wait(["@getMe", "@getProfileDetail"]);

    // Buka tab Disukai dan klik liked post
    cy.get("#tab-likes").click();
    cy.wait("@getLikes");

    cy.get(".space-y-2").find(".cursor-pointer.group").first().click();
    cy.wait("@getPost999");
    cy.contains("Memuat pertanyaan").should("not.exist");

    // Verifikasi tombol like aktif (merah) — post sudah di-like
    cy.get('button[title="Like pertanyaan ini"]').should("have.class", "text-red-500");

    // Lakukan unlike
    cy.get('button[title="Like pertanyaan ini"]').click();
    cy.wait("@unlikePost");

    // Optimistic UI: span hitungan like adalah sibling langsung setelah button
    cy.get('button[title="Like pertanyaan ini"]').next("span").should("contain", "4");
  });

  // ─── Test 6: Tab Bookmarks — View & Unbookmark ────────────────────────────

  it("6. Tab Bookmark: melihat daftar bookmark, view detail post, lalu unbookmark", () => {
    cy.visit("/profile");
    cy.wait(["@getMe", "@getProfileDetail"]);

    // Pindah ke tab Bookmark
    cy.get("#tab-bookmarks").should("be.visible").click();

    // Tunggu request list bookmark DAN detail post-777 (dimuat paralel)
    cy.wait("@getBookmarks");
    cy.wait("@getPost777");

    // Verifikasi item bookmark tampil dengan judul post
    cy.get(".space-y-2").should("be.visible");
    cy.contains("Tutorial Tailwind CSS v4").should("be.visible");

    // Klik bookmark item → navigasi ke detail post
    cy.get(".space-y-2").find(".cursor-pointer").first().click();
    cy.contains("Memuat pertanyaan").should("not.exist");

    // Verifikasi URL dan konten halaman detail post bookmarked
    cy.url().should("include", "/posts/post-777");
    cy.contains("Tutorial Tailwind CSS v4").should("be.visible");

    // Verifikasi tombol bookmark aktif (kuning)
    cy.get('button[title="Bookmark pertanyaan ini"]').should("have.class", "text-yellow-500");

    // Lakukan unbookmark
    cy.get('button[title="Bookmark pertanyaan ini"]').click();
    cy.wait("@deleteBookmark");

    // Optimistic UI: span hitungan bookmark adalah sibling langsung setelah button
    cy.get('button[title="Bookmark pertanyaan ini"]').next("span").should("contain", "1");
  });

  // ─── Test 7: Tab Kredensial — View Only ───────────────────────────────────

  it("7. Tab Kredensial: klik tab lalu tampilkan view kredensial", () => {
    cy.visit("/profile");
    cy.wait(["@getMe", "@getProfileDetail"]);

    // Klik tab Kredensial
    cy.get("#tab-credentials").should("be.visible").click();

    // Verifikasi tampilan kredensial muncul
    cy.contains("Identitas Akun").should("be.visible");
    cy.contains("tester@example.com").should("be.visible");
  });

  it("8. Logout dari Halaman Profil", () => {
    let loggedIn = true;

    // Intercept GET /api/me secara dinamis
    cy.intercept("GET", "/api/me", (req) => {
      if (loggedIn) {
        req.reply(mockUser);
      } else {
        req.reply({
          statusCode: 401,
          body: { message: "Unauthorized" },
        });
      }
    }).as("getMeDynamic");

    // Intercept POST /api/logout
    cy.intercept("POST", "/api/logout", {
      statusCode: 200,
      body: { message: "Logout berhasil" },
    }).as("logout");

    // Intercept GET /api/posts untuk homepage pasca redirect
    cy.intercept("GET", "/api/posts*", {
      statusCode: 200,
      body: { data: [], last_page: 1, total: 0 },
    }).as("getPosts");

    cy.visit("/profile");
    cy.wait(["@getMeDynamic", "@getProfileDetail"]);

    // Pindah ke tab Kredensial terlebih dahulu
    cy.get("#tab-credentials").should("be.visible").click();
    cy.contains("Identitas Akun").should("be.visible");
    cy.contains("tester@example.com").should("be.visible");

    // Ubah status login ke false sesaat sebelum logout dilakukan
    cy.then(() => {
      loggedIn = false;
    });

    // Klik tombol logout dari keadaan sedang di tab Kredensial
    cy.contains("Keluar (Logout)").should("be.visible").click();
    cy.wait("@logout");

    // Verifikasi kembali ke homepage dan menampilkan tombol "Masuk"
    cy.url().should("eq", Cypress.config("baseUrl") + "/");
    cy.contains("Masuk").should("be.visible");
  });
});


