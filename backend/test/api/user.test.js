/* global after before describe it app expect */
// eslint-disable-next-line node/no-unpublished-require
const supertest = require("supertest");
const modelHelper = require("../helpers/models");

describe("/User anonym", () => {
  before(done => {
    modelHelper.createRoles(done);
  });

  after(done => {
    app.dataSources.mongoDS.automigrate(done);
  });

  it("/create with default role user", done => {
    const userData = {
      username: "john",
      password: "john1234",
      email: "john.doe@medi.ch",
      firstName: "John",
      lastName: "Doe"
    };
    supertest(app)
      .post("/api/users")
      .send(userData)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be(null);
        app.models.Role.findOne({ name: "user" }, (roleErr, userRole) => {
          if (roleErr) {
            done(roleErr);
          } else {
            app.models.RoleMapping.findOne(
              { roleId: userRole.id, principalId: res.body.id },
              (userErr, user) => {
                if (userErr) {
                  done(userErr);
                } else {
                  // eslint-disable-next-line no-undefined
                  expect(user).to.not.be(undefined);
                  done();
                }
              }
            );
          }
        });
      });
  });
});

describe("/User with user role", () => {
  let token;

  before(done => {
    modelHelper.loggedInUserElementTrack(
      (_err, dbUser, dbElement, dbTrack, dbToken) => {
        token = dbToken;
        done();
      }
    );
  });

  after(done => {
    app.dataSources.mongoDS.automigrate(done);
  });

  it("/findAll block", done => {
    supertest(app)
      .get("/api/users")
      .set("Authorization", token.id)
      .expect(401, done);
  });

  it("/findOne block for non-owner", done => {
    supertest(app)
      .get("/api/users/0")
      .set("Authorization", token.id)
      .expect(401, done);
  });

  it("/findOne list for owner", done => {
    supertest(app)
      .get("/api/users/me")
      .set("Authorization", token.id)
      .expect(200, done);
  });

  it("/update block for non-owner", done => {
    supertest(app)
      .patch("/api/users/randomid")
      .set("Authorization", token.id)
      .send({ firstName: "John" })
      .expect(401, done);
  });

  it("/update ok for owner", done => {
    supertest(app)
      .patch("/api/users/me")
      .set("Authorization", token.id)
      .send({ firstName: "John" })
      .expect(200)
      .end((_err, res) => {
        expect(res.body.firstName).to.be("John");
        done();
      });
  });

  it("/find/{id}/tracks lists all related tracks", done => {
    supertest(app)
      .get("/api/users/me/tracks")
      .set("Authorization", token.id)
      .expect(200, done);
  });

  it("/destroy removes all related tracks", done => {
    supertest(app)
      .del("/api/users/me")
      .set("Authorization", token.id)
      .expect(200, done);
  });
});

describe("/User with admin role", () => {
  let token;

  before(done => {
    modelHelper.loggedInAdminElement((_err, dbUser, dbElement, dbToken) => {
      token = dbToken;
      done();
    });
  });

  after(done => {
    app.dataSources.mongoDS.automigrate(done);
  });

  it("/findAll allow", done => {
    supertest(app)
      .get("/api/users")
      .set("Authorization", token.id)
      .expect(200, done);
  });

  it("/findOne block for non-owner", done => {
    supertest(app)
      .get("/api/users/0")
      .set("Authorization", token.id)
      .expect(401, done);
  });

  it("/findOne list for owner", done => {
    supertest(app)
      .get("/api/users/me")
      .set("Authorization", token.id)
      .expect(200, done);
  });

  it("/update ok for owner", done => {
    supertest(app)
      .patch("/api/users/me")
      .set("Authorization", token.id)
      .send({ firstName: "John" })
      .expect(200)
      .end((_err, res) => {
        expect(res.body.firstName).to.be("John");
        done();
      });
  });
});
