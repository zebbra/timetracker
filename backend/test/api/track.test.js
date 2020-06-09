/* global before after app describe it expect */
// eslint-disable-next-line node/no-unpublished-require
const supertest = require("supertest");
const moment = require("moment-timezone");
const modelHelper = require("../helpers/models");

describe("/Track admin", () => {
  let element;
  let token;

  before(done => {
    modelHelper.loggedInAdminElement((err, dbUser, dbElement, dbToken) => {
      if (err) {
        done(err);
      } else {
        element = dbElement;
        token = dbToken;
        done();
      }
    });
  });

  after(done => {
    app.dataSources.mongoDS.automigrate(done);
  });

  it("/create blocks for admin user", done => {
    supertest(app)
      .post("/api/tracks")
      .set("Authorization", token.id)
      .send({
        date: new Date(),
        value: 1,
        elementId: element.id
      })
      .expect(401, done);
  });
});

describe("/Track user", () => {
  let user;
  let element;
  let track;
  let token;

  before(done => {
    modelHelper.loggedInUserElementTrack(
      (_err, dbUser, dbElement, dbTrack, dbToken) => {
        user = dbUser;
        element = dbElement;
        track = dbTrack;
        token = dbToken;
        done();
      }
    );
  });

  after(done => {
    app.dataSources.mongoDS.automigrate(done);
  });

  it("/findAll block for all users", done => {
    supertest(app)
      .get("/api/tracks")
      .set("Authorization", token.id)
      .expect(401, done);
  });

  it("/findOne block for non-owner", done => {
    supertest(app)
      .get("/api/tracks/0")
      .set("Authorization", token.id)
      .expect(401, done);
  });

  it("/findOne ok for owner", done => {
    supertest(app)
      .get(`/api/tracks/${track.id}`)
      .set("Authorization", token.id)
      .expect(200, done);
  });

  it("/create does not allow multi tracks for same element-user-date triple", done => {
    supertest(app)
      .post("/api/tracks")
      .set("Authorization", token.id)
      .send({
        date: new Date(),
        value: 1,
        userId: user.id,
        elementId: element.id
      })
      .expect(422, done);
  });

  it("/create does not allow tracks with missing elementId", done => {
    supertest(app)
      .post("/api/tracks")
      .set("Authorization", token.id)
      .send({
        date: moment()
          .subtract(2, "years")
          .toDate(),
        value: 1
      })
      .expect(422, done);
  });

  it("/create does not allow tracks with invalid elementId", done => {
    supertest(app)
      .post("/api/tracks")
      .set("Authorization", token.id)
      .send({
        date: moment()
          .subtract(2, "years")
          .toDate(),
        value: 1,
        elementId: "test"
      })
      .expect(422, done);
  });

  it("/create does not allow tracks with date in the `closed date range`", done => {
    supertest(app)
      .post("/api/tracks")
      .set("Authorization", token.id)
      .send({
        date: moment()
          .subtract(2, "years")
          .toDate(),
        value: 1,
        elementId: element.id
      })
      .expect(422, done);
  });

  it("/create fails for holiday element", done => {
    modelHelper.createElement("holidayElement", {}, (err, dbElement) => {
      expect(err).to.be(null);

      supertest(app)
        .post("/api/tracks")
        .set("Authorization", token.id)
        .send({
          date: moment()
            .add(1, "day")
            .toDate(),
          value: 1,
          elementId: dbElement.id
        })
        .expect(422, done);
    });
  });

  it("/create ok for authorized users and calculates the duration", done => {
    supertest(app)
      .post("/api/tracks")
      .set("Authorization", token.id)
      .send({
        date: moment()
          .add(1, "day")
          .toDate(),
        value: 1,
        elementId: element.id
      })
      .expect(200)
      .end((err, res) => {
        expect(err).to.be(null);
        expect(res.body.duration).to.be(3600);
        done();
      });
  });

  it("/update does not allow tracks with date in the `closed date range`", done => {
    supertest(app)
      .patch(`/api/tracks/${track.id}`)
      .set("Authorization", token.id)
      .send({
        date: moment()
          .subtract(2, "years")
          .toDate(),
        value: 2
      })
      .expect(422, done);
  });

  it("/update ok for authorized users and re-calculates the duration", done => {
    supertest(app)
      .patch(`/api/tracks/${track.id}`)
      .set("Authorization", token.id)
      .send({ value: 2 })
      .expect(200)
      .end((err, res) => {
        expect(err).to.be(null);
        expect(res.body.duration).to.be(7200);
        done();
      });
  });
});
