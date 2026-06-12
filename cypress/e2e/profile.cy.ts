/// <reference types="cypress" />

describe("Halaman Profil & Edit Profil", () => {
  const mockUser = {
    user: {
      id: "user-123",
      username: "tester",
      email: "tester@example.com",
      avatar_url: null,
      bio: "Developer di Flexicord",
      reputation_points: 1500,
      level: 4,
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
      reputation_points: 1500,
      level: 4,
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
        {
          id: "b-2",
          name: "Gold Solved",
          description: "10 jawaban diterima",
          icon_url: null,
          tier: "gold",
          condition_type: "accept_rate",
          condition_value: 10,
          pivot: {
            user_id: "user-123",
            badge_id: "b-2",
            created_at: "2026-01-03T00:00:00.000Z",
            updated_at: "2026-01-03T00:00:00.000Z",
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
          tags: [
            {
              id: "tag-react",
              name: "react",
              slug: "react",
              color: "#61dafb",
              usage_count: 15,
              created_at: "2026-01-01T00:00:00Z",
              pivot: { post_id: "post-101", tag_id: "tag-react" },
            },
          ],
          category: {
            id: "cat-1",
            name: "Web Development",
            slug: "web-dev",
            description: "Seputar web",
            parent_id: null,
            created_at: "2026-01-01T00:00:00Z",
          },
        },
        {
          id: "post-102",
          user_id: "user-123",
          category_id: "cat-2",
          title: "Error Hydration failed di Next.js 16",
          body: "Mendapatkan error hydration saat load page.",
          status: "open",
          view_count: 55,
          vote_score: 2,
          is_answered: 0,
          accepted_answer_id: null,
          created_at: "2026-01-06T15:00:00.000Z",
          updated_at: "2026-01-06T15:00:00.000Z",
          likes_count: 1,
          bookmarks_count: 0,
          comments_count: 0,
          upvotes_count: 2,
          downvotes_count: 0,
          votes_count: 2,
          user_has_liked: false,
          user_has_bookmarked: false,
          tags: [
            {
              id: "tag-nextjs",
              name: "nextjs",
              slug: "nextjs",
              color: "#000000",
              usage_count: 25,
              created_at: "2026-01-01T00:00:00Z",
              pivot: { post_id: "post-102", tag_id: "tag-nextjs" },
            },
          ],
          category: {
            id: "cat-2",
            name: "NextJS",
            slug: "nextjs",
            description: "Frame Next",
            parent_id: null,
            created_at: "2026-01-01T00:00:00Z",
          },
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

  const mockPostDetailResponse = {
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
      comments_count: 5,
      upvotes_count: 12,
      created_at: "2026-01-09T00:00:00.000Z",
      category: { id: "cat-3", "name": "CSS", "slug": "css" },
      tags: [{ id: "tag-tailwind", "name": "tailwind", "color": "#38bdf8" }],
      user: { id: "user-999", "username": "cssguy", "avatar_url": null },
    },
  };

  beforeEach(() => {
    // Intersep/Mock semua endpoint API yang dipanggil di profile
    cy.intercept("GET", "/api/me", mockUser).as("getMe");
    cy.intercept("GET", "/api/profile/tester", mockUserDetailResponse).as("getProfileDetail");
    cy.intercept("GET", "/api/likes-user/tester", mockLikesResponse).as("getLikes");
    cy.intercept("GET", "/api/bookmark", mockBookmarksResponse).as("getBookmarks");
    cy.intercept("GET", "/api/posts/post-777", mockPostDetailResponse).as("getPost777");
  });

  it("Mengalihkan pengguna ke /login jika tidak memiliki sesi aktif", () => {
    cy.intercept("GET", "/api/me", { statusCode: 401, body: { message: "Unauthorized" } }).as("getMeUnauthorized");
    cy.visit("/profile");
    cy.url().should("include", "/login");
  });

  it("Menampilkan detail profil, statistik utama, dan bio yang benar", () => {
    cy.visit("/profile");
    cy.wait(["@getMe", "@getProfileDetail"]);

    // Cek header dan detail profile
    cy.get("h1").should("contain", "tester");
    cy.get("span").contains("user").should("be.visible");
    cy.get("p").should("contain", "@tester");
    cy.get("p").should("contain", "tester@example.com");
    cy.get("p").should("contain", "Developer di Flexicord");

    // Cek stats pengikut, mengikuti, lencana
    cy.contains("42 pengikut").should("be.visible");
    cy.contains("24 mengikuti").should("be.visible");
    cy.contains("2 lencana").should("be.visible");

    // Cek quick stats
    cy.contains("Reputasi").parent().should("contain", "1.500");
    cy.contains("Total Post").parent().should("contain", "2");
    cy.contains("Lencana").parent().should("contain", "2");
  });

  it("Bisa berpindah tab dan menampilkan data masing-masing tab", () => {
    cy.visit("/profile");
    cy.wait(["@getMe", "@getProfileDetail"]);

    // 1. Tab default: "Pertanyaan"
    cy.get("button").contains("Pertanyaan").should("have.class", "text-brand-blue");
    cy.contains("Bagaimana cara deploy Next.js ke Vercel?").should("be.visible");
    cy.contains("Error Hydration failed di Next.js 16").should("be.visible");

    // 2. Klik tab: "Aktivitas"
    cy.get("button").contains("Aktivitas").click();
    cy.contains("Total pertanyaan ditulis").parent().should("contain", "2");
    cy.contains("Post terjawab").parent().should("contain", "1");
    cy.contains("Post masih terbuka").parent().should("contain", "1");
    cy.contains("Accept rate").should("be.visible");
    cy.contains("50%").should("be.visible");
    // Verifikasi badges di section aktivitas
    cy.contains("First Post").should("be.visible");
    cy.contains("Gold Solved").should("be.visible");

    // 3. Klik tab: "Disukai"
    cy.get("button").contains("Disukai").click();
    cy.wait("@getLikes");
    // Post disukai
    cy.contains("Bagaimana menggunakan Cypress E2E?").should("be.visible");
    // Komentar disukai
    cy.contains("Coba gunakan cy.intercept untuk mempermudah mock API.").should("be.visible");

    // 4. Klik tab: "Bookmark"
    cy.get("button").contains("Bookmark").click();
    cy.wait(["@getBookmarks", "@getPost777"]);
    cy.contains("Tutorial Tailwind CSS v4").should("be.visible");

    // 5. Klik tab: "Kredensial"
    cy.get("button").contains("Kredensial").click();
    cy.contains("Identitas Akun").should("be.visible");
    cy.contains("tester@example.com").should("be.visible");
    cy.contains("Status & Keamanan").should("be.visible");
    cy.contains("Aktif").should("be.visible");
    cy.contains("Level").parent().should("contain", "Lv. 4");
    cy.contains("Reputasi").parent().should("contain", "1.500 pts");
  });

  describe("Alur Edit Profil", () => {
    beforeEach(() => {
      cy.visit("/profile");
      cy.wait(["@getMe", "@getProfileDetail"]);
      cy.get("#btn-edit-profile-toggle").click();
      cy.url().should("include", "/profile/edit");
    });

    it("Mengisi form secara otomatis dengan data profil yang ada", () => {
      cy.get("input#username").should("have.value", "tester");
      cy.get("input#email").should("have.value", "tester@example.com");
      cy.get("textarea#bio").should("have.value", "Developer di Flexicord");
    });

    it("Dapat membatalkan proses edit profil dan kembali ke /profile", () => {
      cy.get("button").contains("Batalkan").click();
      cy.url().should("eq", Cypress.config("baseUrl") + "/profile");
    });

    it("Menolak input jika validasi client gagal (format email salah atau username terlalu panjang)", () => {
      // 1. Validasi email salah
      cy.get("input#email").clear().type("bukanemail");
      cy.get("button[type='submit']").click();
      cy.contains("Format email tidak valid").should("be.visible");

      // 2. Validasi username melebihi 12 karakter
      cy.get("input#username").clear().type("testerpanjangbanget");
      cy.get("input#email").clear().type("tester@example.com");
      cy.get("button[type='submit']").click();
      cy.contains("Username maksimal 12 karakter").should("be.visible");
    });

    it("Menangani error validasi backend (status 422) dengan menampilkan field-error", () => {
      const mock422Error = {
        message: "Validasi gagal. Periksa kembali isian Anda.",
        errors: {
          username: ["Username sudah terpakai oleh pengguna lain."],
        },
      };

      cy.intercept("POST", "/api/profile/update", {
        statusCode: 422,
        body: mock422Error,
      }).as("updateProfileFail");

      cy.get("input#username").clear().type("existinguser");
      cy.get("button[type='submit']").click();
      cy.wait("@updateProfileFail");

      cy.get("p").contains("Validasi gagal. Periksa kembali isian Anda.").should("be.visible");
      cy.get("li").should("contain", "Username: Username sudah terpakai oleh pengguna lain.");
    });

    it("Menyimpan perubahan dengan sukses dan dialihkan kembali ke /profile", () => {
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

      // Mock update /api/me response untuk sync session
      cy.intercept("GET", "/api/me", updatedUser).as("getMeUpdated");
      cy.intercept("GET", "/api/profile/testernew", updatedUserDetail).as("getProfileDetailUpdated");

      // Isi form edit
      cy.get("input#username").clear().type("testernew");
      cy.get("input#email").clear().type("newemail@example.com");
      cy.get("textarea#bio").clear().type("Perubahan bio tester");

      cy.get("button[type='submit']").click();
      cy.wait("@updateProfileSuccess");

      // Cek alert sukses pada form
      cy.contains("Profil berhasil diperbarui!").should("be.visible");

      // Cek toast notifikasi dari AppContext
      cy.get("#toast-notification").should("be.visible").and("contain", "Profil berhasil diperbarui!");

      // Redireksi otomatis setelah 1.5 detik ke /profile
      cy.url().should("include", "/profile");

      // Verifikasi di halaman profile data sudah terupdate
      cy.get("h1").should("contain", "testernew");
      cy.get("p").should("contain", "@testernew");
      cy.get("p").should("contain", "newemail@example.com");
      cy.get("p").should("contain", "Perubahan bio tester");
    });
  });
});
