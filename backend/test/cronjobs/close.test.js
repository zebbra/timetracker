/* global describe it beforeEach afterEach */
const proxyquire = require("proxyquire").noCallThru();
const sinon = require("sinon");
const moment = require("moment-timezone");
const expect = require("expect.js");

describe("Close Models Cronjob", () => {
  let sandbox;
  let appMock;
  let mockAsync;
  let mockProcess;
  let mockDebug;
  let closeModule;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(process, "exit").callsFake(() => {});

    // Mock debug function
    mockDebug = sandbox.stub();

    // Mock app object with model stubs
    appMock = {
      booting: false,
      models: {
        "employment-profile": {
          update: sandbox.stub()
        },
        employment: {
          update: sandbox.stub()
        },
        track: {
          update: sandbox.stub()
        },
        holiday: {
          update: sandbox.stub()
        },
        setpoint: {
          update: sandbox.stub()
        },
        Email: {
          send: sandbox.stub().callsFake((options, callback) => {
            callback(null);
          })
        }
      }
    };

    // Set up common update behavior
    Object.values(appMock.models).forEach(model => {
      if (model.update) {
        model.update.callsFake((query, fields, callback) => {
          callback(null, { count: 5 });
        });
      }
    });

    // Mock process
    mockProcess = {
      exit: sandbox.stub(),
      env: {}
    };

    // Mock Async
    mockAsync = {
      eachSeries: sandbox.stub().callsFake((items, iterator, callback) => {
        const processItem = index => {
          if (index >= items.length) {
            return callback();
          }
          return iterator(items[index], () => processItem(index + 1));
        };
        processItem(0);
      })
    };

    // Override setTimeout to execute callback immediately
    sandbox.stub(global, "setTimeout").callsFake((fn, ms) => {
      fn();
      return 123; // Return a timeout ID
    });

    // Require the close module with mocks
    closeModule = proxyquire("../../bin/cronjobs/close", {
      debug: () => mockDebug,
      "moment-timezone": moment,
      async: mockAsync,
      "../../server/server": appMock,
      process: mockProcess
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should wait while app is booting", async () => {
    // Set app initially to booting state
    appMock.booting = true;

    // After the first sleep check, set booting to false
    const mockSleepCall = sandbox.stub().callsFake(() => {
      appMock.booting = false;
      return Promise.resolve();
    });

    // Replace the existing setTimeout stub
    global.setTimeout.restore();
    sandbox.stub(global, "setTimeout").callsFake(fn => {
      if (appMock.booting) {
        mockSleepCall();
        fn();
      } else {
        fn();
      }
      return 123; // Return a timeout ID
    });

    // Start the close process
    await closeModule.closeAllModels();

    // Verify debug was called with the correct messages
    expect(mockDebug.calledWith("============ APP BOOTING ============")).to.be(
      true
    );
    expect(mockDebug.calledWith("============ APP STARTED ============")).to.be(
      true
    );
  });

  it("should close models with the correct queries", async () => {
    await closeModule.closeAllModels();

    // Employment-profile should use year filter
    const epCall = appMock.models["employment-profile"].update.getCall(0);
    expect(epCall.args[0].closed).to.be(false);
    expect(epCall.args[0].year.lt).to.be.a("number");

    // Track should use date filter
    const trackCall = appMock.models.track.update.getCall(0);
    expect(trackCall.args[0].closed).to.be(false);
    expect(trackCall.args[0].date.lt).to.be.a("object"); // moment object

    // Employment should use end filter
    const empCall = appMock.models.employment.update.getCall(0);
    expect(empCall.args[0].closed).to.be(false);
    expect(empCall.args[0].end.lt).to.be.a("object"); // moment object
  });

  it("should handle model update errors", async () => {
    // Make employment model fail
    appMock.models.employment.update.callsFake((query, fields, callback) => {
      callback(new Error("Update failed"));
    });

    await closeModule.closeAllModels();

    // Verify debug captured the error
    expect(mockDebug.calledWith(sinon.match(/status=failed/))).to.be(true);

    // Process should still complete
    expect(
      mockDebug.calledWith(sinon.match(/job=closeAllModels status=done/))
    ).to.be(true);
  });

  it("should close a specific model with closeModel function", done => {
    const testQuery = { closed: false, test: true };

    closeModule.closeModel("employment", testQuery, err => {
      expect(err).to.be(null);

      // Verify the update was called with correct parameters
      expect(appMock.models.employment.update.callCount).to.be(1);
      expect(appMock.models.employment.update.firstCall.args[0]).to.eql(
        testQuery
      );
      expect(appMock.models.employment.update.firstCall.args[1]).to.eql({
        closed: true
      });

      done();
    });
  });

  it("should handle closeModel errors properly", done => {
    const testQuery = { closed: false };

    // Force an error
    appMock.models.employment.update.callsFake((query, fields, callback) => {
      callback(new Error("Update failed"));
    });

    closeModule.closeModel("employment", testQuery, err => {
      expect(err).to.be.an(Error);
      expect(err.message).to.be("Update failed");

      // Verify debug captured the error
      expect(mockDebug.calledWith(sinon.match(/status=failed/))).to.be(true);

      done();
    });
  });
});
