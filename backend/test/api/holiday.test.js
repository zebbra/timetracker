/* global before after app describe it expect */
// eslint-disable-next-line node/no-unpublished-require
const supertest = require("supertest");
const moment = require("moment-timezone");
const modelHelper = require("../helpers/models");

describe("/Holiday admin", () => {
  let element;
  let holidayElement;
  let token;
  let user;

  before(done => {
    modelHelper.loggedInAdminElement((err, dbUser, dbElement, dbToken) => {
      if (err) {
        done(err);
      } else {
        user = dbUser;
        element = dbElement;
        token = dbToken;
        done();
      }
    });
  });

  after(done => {
    app.dataSources.mongoDS.automigrate(done);
  });

  it("/create blocks for admin user on non-holiday element", done => {
    supertest(app)
      .post("/api/holidays")
      .set("Authorization", token.id)
      .send({
        date: moment()
          .add(1, "day")
          .toDate(),
        value: 1,
        elementId: element.id
      })
      .expect(422, done);
  });

  it("/create success for admin user on holiday element", done => {
    modelHelper.createElement("holidayElement", {}, (err, dbElement) => {
      expect(err).to.be(null);
      holidayElement = dbElement;
      supertest(app)
        .post("/api/holidays")
        .set("Authorization", token.id)
        .send({
          label: "Holiday",
          date: moment()
            .add(1, "day")
            .toDate(),
          value: 1,
          elementId: dbElement.id
        })
        .expect(200, done);
    });
  });

  it("/findAll success for admins", done => {
    supertest(app)
      .get("/api/holidays")
      .set("Authorization", token.id)
      .expect(200, done);
  });

  it("/findOne success for admins", done => {
    modelHelper.createHoliday(
      user,
      holidayElement,
      {
        label: "Xmas",
        date: moment()
          .add(1, "day")
          .toDate(),
        value: 1
      },
      (err, holiday) => {
        expect(err).to.be(null);
        supertest(app)
          .get(`/api/holidays/${holiday.id}`)
          .set("Authorization", token.id)
          .expect(200, done);
      }
    );
  });

  it("/create does not allow multi holidays for same element-user-date triple", done => {
    supertest(app)
      .post("/api/holidays")
      .set("Authorization", token.id)
      .send({
        date: new Date(),
        value: 1,
        userId: user.id,
        elementId: holidayElement.id
      })
      .expect(422, done);
  });

  it("/create does not allow holidays with missing elementId", done => {
    supertest(app)
      .post("/api/holidays")
      .set("Authorization", token.id)
      .send({
        date: moment()
          .subtract(2, "years")
          .toDate(),
        value: 1
      })
      .expect(422, done);
  });

  it("/create does not allow holidays with invalid elementId", done => {
    supertest(app)
      .post("/api/holidays")
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

  it("/create does not allow holidays with date in the `closed date range`", done => {
    supertest(app)
      .post("/api/holidays")
      .set("Authorization", token.id)
      .send({
        date: moment()
          .subtract(2, "years")
          .toDate(),
        value: 1,
        elementId: holidayElement.id
      })
      .expect(422, done);
  });
});

describe("/Holiday user", () => {
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

  it("/findAll success for users", done => {
    supertest(app)
      .get("/api/holidays")
      .set("Authorization", token.id)
      .expect(200, done);
  });

  it("/create blocks for users", done => {
    modelHelper.createElement("holidayElement", {}, (err, dbElement) => {
      expect(err).to.be(null);
      supertest(app)
        .post("/api/holidays")
        .set("Authorization", token.id)
        .send({
          label: "Holiday",
          date: moment()
            .add(1, "day")
            .toDate(),
          value: 1,
          elementId: dbElement.id
        })
        .expect(401, done);
    });
  });
});
