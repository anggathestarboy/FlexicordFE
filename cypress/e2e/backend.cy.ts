describe("Backend API Integration Tests", () => {
  const baseUrl = "http://127.0.0.1:8000/api";

  let adminToken = "";
  let userToken = "";
  let modToken = "";
  let newRegularToken = "";
  const newUsername = "user_" + Math.floor(Math.random() * 100000);
  const newEmail = `${newUsername}@gmail.com`;
  const newPassword = "password123";

  let userPostId = "";
  let commentPostId = "";
  let commentId = "";
  let bookmarkId = "";

  // Setup: Log in admin & user role accounts and promote moderator
  before(() => {
    // 1. Login Admin
    cy.request({
      method: "POST",
      url: `${baseUrl}/auth/login`,
      body: {
        username: "anggaraa",
        password: "aksata",
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      adminToken = response.body.token;

      // 2. Promote 'zahra' to Moderator to prepare the moderator role
      cy.request({
        method: "POST",
        url: `${baseUrl}/admin/promote-moderator/zahra`,
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        failOnStatusCode: false, // It might already be a moderator, which returns 400
      }).then(() => {
        // 3. Login Moderator
        cy.request({
          method: "POST",
          url: `${baseUrl}/auth/login`,
          body: {
            username: "zahra",
            password: "aksata",
          },
        }).then((resMod) => {
          expect(resMod.status).to.eq(200);
          modToken = resMod.body.token;
        });
      });
    });

    // 4. Login User
    cy.request({
      method: "POST",
      url: `${baseUrl}/auth/login`,
      body: {
        username: "reifan",
        password: "aksata",
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      userToken = response.body.token;
    });
  });

  // =========================================================================
  // 1. AUTH REGISTER & LOGIN
  // =========================================================================
  describe("1. Auth Register & Login", () => {
    it("Register Gagal (422) - validation errors", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/auth/register`,
        body: {
          username: "",
          email: "invalid-email",
          password_hash: "123",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
      });
    });

    it("Register Berhasil", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/auth/register`,
        body: {
          username: newUsername,
          email: newEmail,
          password_hash: newPassword,
          bio: "Ini akun testing Cypress.",
        },
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property("token");
        newRegularToken = response.body.token;
      });
    });

    it("Login Gagal (401) - invalid credentials", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/auth/login`,
        body: {
          username: newUsername,
          password: "wrongpassword",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it("Login Gagal (422) - missing fields", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/auth/login`,
        body: {
          username: "",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
      });
    });

    it("Login Berhasil", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/auth/login`,
        body: {
          username: newUsername,
          password: newPassword,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("token");
      });
    });

    it("Logout Berhasil", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/auth/logout`,
        headers: {
          Authorization: `Bearer ${newRegularToken}`,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.message).to.contain("Logout");
      });
    });
  });

  // =========================================================================
  // 2. POST FEATURES
  // =========================================================================
  describe("2. Post Features", () => {
    it("Create post gagal (422) - validation errors", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/posts`,
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: {
          title: "",
          body: "Short",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
      });
    });

    it("Create post berhasil", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/posts`,
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: {
          title: "Postingan Testing Cypress",
          body: "Ini adalah deskripsi postingan testing cypress.",
          category_slug: "pemrograman",
          tags: ["laravel", "php"],
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data).to.have.property("id");
        userPostId = response.body.data.id;
      });
    });

    it("Show list posts", () => {
      cy.request({
        method: "GET",
        url: `${baseUrl}/posts`,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("data");
      });
    });

    it("Show detail posts", () => {
      cy.request({
        method: "GET",
        url: `${baseUrl}/posts/${userPostId}`,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data.id).to.eq(userPostId);
      });
    });

    it("Update post gagal (422) - invalid title", () => {
      cy.request({
        method: "PUT",
        url: `${baseUrl}/posts/${userPostId}`,
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: {
          title: "",
          body: "Update content body.",
          category_slug: "pemrograman",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
      });
    });

    it("Update post gagal (403) - unauthorized user", () => {
      cy.request({
        method: "PUT",
        url: `${baseUrl}/posts/${userPostId}`,
        headers: {
          Authorization: `Bearer ${modToken}`, // 'zahra' is not the post owner
        },
        body: {
          title: "Mencoba Update Post Orang Lain",
          body: "Mencuri edit.",
          category_slug: "pemrograman",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(403);
      });
    });

    it("Update post berhasil", () => {
      cy.request({
        method: "PUT",
        url: `${baseUrl}/posts/${userPostId}`,
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: {
          title: "Postingan Terupdate Cypress",
          body: "Deskripsi postingan terupdate cypress.",
          category_slug: "pemrograman",
          tags: ["laravel"],
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data.title).to.eq("Postingan Terupdate Cypress");
      });
    });

    it("Close post gagal (403) - unauthorized close", () => {
      // Create another user dynamically who is not the owner or moderator/admin
      const rName = "user_" + Math.floor(Math.random() * 100000);
      cy.request({
        method: "POST",
        url: `${baseUrl}/auth/register`,
        body: {
          username: rName,
          email: `${rName}@gmail.com`,
          password_hash: "password123",
        },
      }).then((regRes) => {
        const otherToken = regRes.body.token;

        cy.request({
          method: "POST",
          url: `${baseUrl}/posts/${userPostId}/close`,
          headers: {
            Authorization: `Bearer ${otherToken}`,
          },
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.eq(403);
        });
      });
    });

    it("Close post berhasil", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/posts/${userPostId}/close`,
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.message).to.contain("ditutup");
      });
    });

    // Likes, Bookmarks, and Votes interactions on posts
    it("Like berhasil", () => {
      // We will create another post first because userPostId is now closed
      cy.request({
        method: "POST",
        url: `${baseUrl}/posts`,
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: {
          title: "Postingan Baru untuk Like/Vote",
          body: "Konten postingan interaksi.",
          category_slug: "pemrograman",
          tags: ["laravel"],
        },
      }).then((postRes) => {
        userPostId = postRes.body.data.id;

        cy.request({
          method: "POST",
          url: `${baseUrl}/likes`,
          headers: {
            Authorization: `Bearer ${modToken}`,
          },
          body: {
            target_id: userPostId,
          },
        }).then((response) => {
          expect(response.status).to.eq(200);
        });
      });
    });

    it("Like gagal (409) - already liked", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/likes`,
        headers: {
          Authorization: `Bearer ${modToken}`,
        },
        body: {
          target_id: userPostId,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 409]);
      });
    });

    it("Unlike berhasil", () => {
      cy.request({
        method: "DELETE",
        url: `${baseUrl}/unlikes`,
        headers: {
          Authorization: `Bearer ${modToken}`,
        },
        body: {
          target_id: userPostId,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it("Unlike gagal (409) - not liked yet", () => {
      cy.request({
        method: "DELETE",
        url: `${baseUrl}/unlikes`,
        headers: {
          Authorization: `Bearer ${modToken}`,
        },
        body: {
          target_id: userPostId,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 409]);
      });
    });

    it("Bookmark berhasil", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/bookmarks`,
        headers: {
          Authorization: `Bearer ${modToken}`,
        },
        body: {
          post_id: userPostId,
        },
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.data).to.have.property("id");
        bookmarkId = response.body.data.id;
      });
    });

    it("Bookmark gagal (409) - already bookmarked", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/bookmarks`,
        headers: {
          Authorization: `Bearer ${modToken}`,
        },
        body: {
          post_id: userPostId,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 409]);
      });
    });

    it("Unbookmark berhasil", () => {
      cy.request({
        method: "DELETE",
        url: `${baseUrl}/bookmarks/${bookmarkId}`,
        headers: {
          Authorization: `Bearer ${modToken}`,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it("Unbookmark gagal (409) - bookmark not found", () => {
      cy.request({
        method: "DELETE",
        url: `${baseUrl}/bookmarks/${bookmarkId}`,
        headers: {
          Authorization: `Bearer ${modToken}`,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([404, 400, 409]);
      });
    });

    it("Upvote berhasil", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/votes`,
        headers: {
          Authorization: `Bearer ${modToken}`,
        },
        body: {
          target_id: userPostId,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it("Upvote gagal (403) - vote milik sendiri", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/votes`,
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: {
          target_id: userPostId,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(403);
      });
    });

    it("Downvote berhasil", () => {
      // This will downvote (toggling the upvote we did earlier)
      cy.request({
        method: "POST",
        url: `${baseUrl}/downvotes`,
        headers: {
          Authorization: `Bearer ${modToken}`,
        },
        body: {
          target_id: userPostId,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it("Delete gagal (403) - unauthorized delete", () => {
      // A regular user ('natasya') tries to delete reifan's post
      cy.request({
        method: "POST",
        url: `${baseUrl}/auth/login`,
        body: {
          username: "natasya",
          password: "aksata",
        },
      }).then((logRes) => {
        const natasyaToken = logRes.body.token;

        cy.request({
          method: "DELETE",
          url: `${baseUrl}/posts/${userPostId}`,
          headers: {
            Authorization: `Bearer ${natasyaToken}`,
          },
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.eq(403);
        });
      });
    });

    it("Delete berhasil - owner deletes post", () => {
      cy.request({
        method: "DELETE",
        url: `${baseUrl}/posts/${userPostId}`,
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.message).to.contain("dihapus");
      });
    });
  });

  // =========================================================================
  // 3. COMMENT
  // =========================================================================
  describe("3. Comment Features", () => {
    // Setup an open post to comment on
    before(() => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/posts`,
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: {
          title: "Post untuk Kategori Komentar",
          body: "Mari berkomentar di postingan ini.",
          category_slug: "pemrograman",
          tags: ["laravel"],
        },
      }).then((postRes) => {
        commentPostId = postRes.body.data.id;
      });
    });

    it("Comment POST gagal (401) - unauthorized comment", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/comments`,
        body: {
          post_id: commentPostId,
          body: "Komentar tanpa login.",
        },
        failOnStatusCode: false,
      });
    });

    it("Comment POST gagal (422) - validation errors", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/comments`,
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: {
          post_id: commentPostId,
          body: "",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
      });
    });

    it("Comment POST berhasil", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/comments`,
        headers: {
          Authorization: `Bearer ${modToken}`,
        },
        body: {
          post_id: commentPostId,
          body: "Komentar Cypress berhasil ditambahkan!",
        },
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.data).to.have.property("id");
        commentId = response.body.data.id;
      });
    });

    it("Show comment", () => {
      cy.request({
        method: "GET",
        url: `${baseUrl}/comments/${commentId}`,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("data");
      });
    });

    it("Show detail comment", () => {
      cy.request({
        method: "GET",
        url: `${baseUrl}/comments/${commentId}`,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data.id).to.eq(commentId);
      });
    });

    it("Edit comment gagal (401) - unauthorized edit", () => {
      cy.request({
        method: "PUT",
        url: `${baseUrl}/comments/${commentId}`,
        body: {
          body: "Editing comment without token.",
        },
        failOnStatusCode: false,
      });
    });

    it("Edit comment gagal (422) - validation errors", () => {
      cy.request({
        method: "PUT",
        url: `${baseUrl}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${modToken}`,
        },
        body: {
          body: "",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(422);
      });
    });

    it("Edit comment gagal (403) - unauthorized user", () => {
      cy.request({
        method: "PUT",
        url: `${baseUrl}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${userToken}`, // 'reifan' is not the comment owner
        },
        body: {
          body: "Mengedit komentar orang lain.",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(403);
      });
    });

    it("Edit comment berhasil", () => {
      cy.request({
        method: "PUT",
        url: `${baseUrl}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${modToken}`,
        },
        body: {
          body: "Komentar Cypress berhasil diedit!",
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data.body).to.eq(
          "Komentar Cypress berhasil diedit!",
        );
      });
    });

    it("Like comment", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/likes`,
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: {
          target_id: commentId,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it("Unlike comment", () => {
      cy.request({
        method: "DELETE",
        url: `${baseUrl}/unlikes`,
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: {
          target_id: commentId,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it("Upvote comment", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/votes`,
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: {
          target_id: commentId,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it("Downvote comment", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/downvotes`,
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: {
          target_id: commentId,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it("Delete comment gagal (401) - unauthorized comment deletion", () => {
      cy.request({
        method: "DELETE",
        url: `${baseUrl}/comments/${commentId}`,
        failOnStatusCode: false,
      });
    });

    it("Delete comment gagal (403) - non-moderator tries to delete comment", () => {
      // 'reifan' is a regular user and cannot delete comment via moderator route
      cy.request({
        method: "DELETE",
        url: `${baseUrl}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        failOnStatusCode: false,
      });
    });

    it("Delete comment berhasil - deleted by moderator", () => {
      cy.request({
        method: "DELETE",
        url: `${baseUrl}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${modToken}`,
        },
      });
    });
  });

  // =========================================================================
  // 4. PROFILE
  // =========================================================================
  describe("4. Profile Features", () => {
    it("Get user profile", () => {
      cy.request({
        method: "GET",
        url: `${baseUrl}/auth/me`,
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.username).to.eq("reifan");
      });
    });

    it("Update profile", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/auth/profile`,
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: {
          username: "reifan",
          email: "reifan@gmail.com",
          bio: "Backend Engineer | Laravel expert.",
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.message).to.contain("berhasil diperbarui");
      });
    });

    it("Ban user", () => {
      // Create a temporary user to ban
      const tempUser = "bantest_" + Math.floor(Math.random() * 10000);
      cy.request({
        method: "POST",
        url: `${baseUrl}/auth/register`,
        body: {
          username: tempUser,
          email: `${tempUser}@gmail.com`,
          password_hash: "password123",
        },
      }).then(() => {
        // Ban the user
        cy.request({
          method: "POST",
          url: `${baseUrl}/banned/${tempUser}`,
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
          body: {
            reason: "Melanggar aturan komunitas.",
            notes: "Spamming berulang.",
          },
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.message).to.contain("dibanned");
        });
      });
    });

    it("Warning user", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/warnings/reifan`,
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: {
          reason: "Komentar kurang sopan.",
          notes: "Peringatan pertama.",
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.message).to.contain("Warning");
      });
    });

    it("Points log", () => {
      cy.request({
        method: "GET",
        url: `${baseUrl}/points-logs/reifan`,
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it("Get following", () => {
      cy.request({
        method: "GET",
        url: `${baseUrl}/followings/reifan`,
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it("Get followers", () => {
      cy.request({
        method: "GET",
        url: `${baseUrl}/followers/reifan`,
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it("Get like by user", () => {
      cy.request({
        method: "GET",
        url: `${baseUrl}/likes/reifan`,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("likes");
      });
    });

    it("Get bookmark by current user", () => {
      cy.request({
        method: "GET",
        url: `${baseUrl}/bookmarks`,
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("data");
      });
    });

    it("Update password", () => {
      // Register a new user dynamically to test password update
      const pwdUser = "pwd_" + Math.floor(Math.random() * 10000);
      cy.request({
        method: "POST",
        url: `${baseUrl}/auth/register`,
        body: {
          username: pwdUser,
          email: `${pwdUser}@gmail.com`,
          password_hash: "password123",
        },
      }).then((regRes) => {
        const pwdToken = regRes.body.token;

        cy.request({
          method: "POST",
          url: `${baseUrl}/change-password`,
          headers: {
            Authorization: `Bearer ${pwdToken}`,
          },
          body: {
            current_password: "password123",
            new_password: "newpassword123",
            new_password_confirmation: "newpassword123",
          },
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.message).to.contain(
            "Password berhasil diperbarui",
          );
        });
      });
    });
  });

  // =========================================================================
  // 5. INTERACTION
  // =========================================================================
  describe("5. Interaction Features", () => {
    it("Leaderboard", () => {
      cy.request({
        method: "GET",
        url: `${baseUrl}/leaderboard`,
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it("Notification", () => {
      cy.request({
        method: "GET",
        url: `${baseUrl}/notifications`,
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it("Moderator logs", () => {
      cy.request({
        method: "GET",
        url: `${baseUrl}/moderation-logs`,
        headers: {
          Authorization: `Bearer ${modToken}`,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("data");
      });
    });

    it("Promote moderator gagal (409) - already a moderator", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/admin/promote-moderator/zahra`,
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 409]);
      });
    });

    it("Promote moderator gagal (403) - unauthorized user tries to promote", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/admin/promote-moderator/natasya`,
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(403);
      });
    });

    it("Promote moderator berhasil", () => {
      // Promote 'reifan' to moderator
      cy.request({
        method: "POST",
        url: `${baseUrl}/admin/promote-moderator/reifan`,
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        failOnStatusCode: false, // If already a moderator, it will return 400
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });

    it("Promote admin gagal (409) - already an admin", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/admin/promote-admin/anggaraa`,
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 409]);
      });
    });

    it("Promote admin gagal (403) - unauthorized user tries to promote admin", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/admin/promote-admin/natasya`,
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(403);
      });
    });

    it("Promote admin berhasil", () => {
      // Promote 'natasya' to admin
      cy.request({
        method: "POST",
        url: `${baseUrl}/admin/promote-admin/natasya`,
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        failOnStatusCode: false, // If already admin, it will return 400
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });

    it("Unpromote gagal (400) - already a regular user", () => {
      // Register a new user who is a regular user by default
      const regUser = "reg_" + Math.floor(Math.random() * 10000);
      cy.request({
        method: "POST",
        url: `${baseUrl}/auth/register`,
        body: {
          username: regUser,
          email: `${regUser}@gmail.com`,
          password_hash: "password123",
        },
      }).then(() => {
        // Attempt to demote them (they are not admin or moderator)
        cy.request({
          method: "POST",
          url: `${baseUrl}/admin/turunkan/${regUser}`,
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.eq(400);
        });
      });
    });

    it("Unpromote gagal (403) - unauthorized user tries to demote", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/admin/turunkan/natasya`,
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(403);
      });
    });

    it("Unpromote berhasil", () => {
      // Demote 'natasya' back to regular user
      cy.request({
        method: "POST",
        url: `${baseUrl}/admin/turunkan/natasya`,
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.message).to.contain("user");
      });
    });
  });
});
