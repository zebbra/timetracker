/* global before after app describe it */
// eslint-disable-next-line node/no-unpublished-require
const supertest = require("supertest");
const moment = require("moment");
const modelHelper = require("../helpers/models");

describe("/Setpoint admin", () => {
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

  it("/create blocks for admin user", done => {
    supertest(app)
      .post("/api/setpoints")
      .set("Authorization", token.id)
      .send({
        year: new Date().getFullYear(),
        value: 1,
        elementId: element.id
      })
      .expect(401, done);
  });
});

describe("/Setpoint user", () => {
  let user;
  let element;
  let setpoint;
  let token;

  before(done => {
    modelHelper.loggedInUserElementSetpoint(
      (err, dbUser, dbElement, dbSetpoint, dbToken) => {
        if (err) {
          done(err);
        } else {
          user = dbUser;
          element = dbElement;
          setpoint = dbSetpoint;
          token = dbToken;
          done();
        }
      }
    );
  });

  after(done => {
    app.dataSources.mongoDS.automigrate(done);
  });

  it("/findAll block for all users", done => {
    supertest(app)
      .get("/api/setpoints")
      .set("Authorization", token.id)
      .expect(401, done);
  });

  it("/findOne block for non-owner", done => {
    supertest(app)
      .get("/api/setpoints/0")
      .set("Authorization", token.id)
      .expect(401, done);
  });

  it("/findOne ok for owner", done => {
    supertest(app)
      .get(`/api/setpoints/${setpoint.id}`)
      .set("Authorization", token.id)
      .expect(200, done);
  });

  it("/create does not allow multi setpoints for same element-user-year triple", done => {
    supertest(app)
      .post("/api/setpoints")
      .set("Authorization", token.id)
      .send({
        year: new Date().getFullYear(),
        value: 1,
        userId: user.id,
        elementId: element.id
      })
      .expect(422, done);
  });

  it("/create does not allow setpoints with missing elementId", done => {
    supertest(app)
      .post("/api/setpoints")
      .set("Authorization", token.id)
      .send({
        year: moment()
          .subtract(2, "years")
          .year(),
        value: 1
      })
      .expect(422, done);
  });

  it("/create does not allow setpoints with invalid elementId", done => {
    supertest(app)
      .post("/api/setpoints")
      .set("Authorization", token.id)
      .send({
        year: moment()
          .subtract(2, "years")
          .year(),
        value: 1,
        elementId: "test"
      })
      .expect(422, done);
  });

  it("/create does not allow setpoints with year in the `closed date range`", done => {
    supertest(app)
      .post("/api/setpoints")
      .set("Authorization", token.id)
      .send({
        date: moment()
          .subtract(2, "years")
          .year(),
        value: 1,
        elementId: element.id
      })
      .expect(422, done);
  });

  it("/create ok for authorized users", done => {
    supertest(app)
      .post("/api/setpoints")
      .set("Authorization", token.id)
      .send({
        year: moment()
          .add(1, "year")
          .year(),
        value: 1,
        elementId: element.id
      })
      .expect(200, done);
  });

  it("/update does not allow setpoints with date in the `closed date range`", done => {
    supertest(app)
      .patch(`/api/setpoints/${setpoint.id}`)
      .set("Authorization", token.id)
      .send({
        year: moment()
          .subtract(2, "years")
          .year(),
        value: 2
      })
      .expect(422, done);
  });

  it("/update ok for authorized users", done => {
    supertest(app)
      .patch(`/api/setpoints/${setpoint.id}`)
      .set("Authorization", token.id)
      .send({ value: 2 })
      .expect(200, done);
  });
});
