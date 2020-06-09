/* global before after describe it app expect */
// eslint-disable-next-line node/no-unpublished-require
const supertest = require("supertest");
const moment = require("moment-timezone");
const modelHelper = require("../helpers/models");

describe("/Element anonym", () => {
  it("/find blocks for anonym users", done => {
    supertest(app)
      .get("/api/elements")
      .expect(401, done);
  });
});

describe("/Element with user role", () => {
  let element;
  let token;

  before(done => {
    modelHelper.loggedInUserElementTrack(
      (err, dbUser, dbElement, dbTrack, dbToken) => {
        if (err) {
          done(err);
        } else {
          element = dbElement;
          token = dbToken;
          done();
        }
      }
    );
  });

  after(done => {
    app.dataSources.mongoDS.automigrate(done);
  });

  it("/find list for authorized users", done => {
    supertest(app)
      .get("/api/elements")
      .set("Authorization", token.id)
      .expect(200, done);
  });

  it("/create block for non-admin", done => {
    const customElement = {
      label: "Element",
      unit: "h",
      start: new Date()
    };

    supertest(app)
      .post("/api/elements")
      .set("Authorization", token.id)
      .send(customElement)
      .expect(401, done);
  });

  it("/delete fails for authorized non-admin", done => {
    supertest(app)
      .del(`/api/elements/${element.id}`)
      .set("Authorization", token.id)
      .expect(401, done);
  });
});

describe("/Element with admin role", () => {
  let element;
  let token;

  before(done => {
    modelHelper.loggedInAdminElement((_err, dbUser, dbElement, dbToken) => {
      element = dbElement;
      token = dbToken;
      done();
    });
  });

  after(done => {
    app.dataSources.mongoDS.automigrate(done);
  });

  it("/find list for admin", done => {
    supertest(app)
      .get("/api/elements")
      .set("Authorization", token.id)
      .expect(200, done);
  });

  it("/create success for admin", done => {
    const customElement = {
      label: "Custom-Element",
      unit: "h",
      start: new Date()
    };

    supertest(app)
      .post("/api/elements")
      .set("Authorization", token.id)
      .send(customElement)
      .expect(200, done);
  });

  it("/create fails if start is after end", done => {
    const customElement = {
      label: "Custom-Element-2",
      unit: "h",
      start: moment()
        .add(1, "day")
        .toDate(),
      end: new Date()
    };

    supertest(app)
      .post("/api/elements")
      .set("Authorization", token.id)
      .send(customElement)
      .expect(422, done);
  });

  it("/delete blocks if the element has related tracks", done => {
    modelHelper.createUser("demo", {}, (err, dbUser) => {
      expect(err).to.be(null);
      modelHelper.createTrack(
        dbUser,
        element,
        {
          date: moment()
            .add(1, "day")
            .toDate(),
          label: "test",
          value: 3
        },
        trackErr => {
          expect(trackErr).to.be(null);
          supertest(app)
            .del(`/api/elements/${element.id}`)
            .set("Authorization", token.id)
            .expect(422, done);
        }
      );
    });
  });

  it("/updates fails if the start date cuts off related tracks", done => {
    supertest(app)
      .patch(`/api/elements/${element.id}`)
      .set("Authorization", token.id)
      .send({
        start: moment()
          .add(1, "day")
          .toDate(),
        end: moment()
          .add(2, "days")
          .toDate()
      })
      .expect(422, done);
  });

  it("/updates fails if the end date cuts off related tracks", done => {
    supertest(app)
      .patch(`/api/elements/${element.id}`)
      .set("Authorization", token.id)
      .send({
        start: moment()
          .subtract(3, "days")
          .toDate(),
        end: moment()
          .subtract(2, "days")
          .toDate()
      })
      .expect(422, done);
  });

  it("/updates success if the start and end dates do not cut off related tracks", done => {
    supertest(app)
      .patch(`/api/elements/${element.id}`)
      .set("Authorization", token.id)
      .send({
        start: moment()
          .subtract(3, "days")
          .toDate(),
        end: moment()
          .add(2, "days")
          .toDate()
      })
      .expect(200, done);
  });
});
