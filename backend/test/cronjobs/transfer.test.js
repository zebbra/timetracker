/* global describe it beforeEach afterEach */
const proxyquire = require("proxyquire").noCallThru();
const sinon = require("sinon");
const moment = require("moment-timezone");
const expect = require("expect.js");

describe("Year Transition Cronjob", () => {
  let sandbox;
  let appMock;
  let mockReporting;
  let mockFormatters;
  let mockProcess;
  let mockDebug;
  let yearTransition;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(process, "exit").callsFake(() => {});

    // Mock debug function
    mockDebug = sandbox.stub();

    // Mock users data
    const mockUsers = [
      {
        id: "user1",
        username: "user.one",
        firstName: "User",
        lastName: "One",
        roles: [{ name: "employee" }],
        toJSON: function() {
          return {
            id: this.id,
            username: this.username,
            firstName: this.firstName,
            lastName: this.lastName,
            roles: this.roles
          };
        }
      },
      {
        id: "user2",
        username: "user.two",
        firstName: "User",
        lastName: "Two",
        roles: [{ name: "admin" }],
        toJSON: function() {
          return {
            id: this.id,
            username: this.username,
            firstName: this.firstName,
            lastName: this.lastName,
            roles: this.roles
          };
        }
      }
    ];

    // Mock timeseriesReporting
    mockReporting = {
      timeseriesReporting: sandbox.stub()
    };

    // Mock formatters
    mockFormatters = {
      asDecimal: sandbox.stub().callsFake(val => parseFloat(val.toFixed(2)))
    };

    // Mock app object
    appMock = {
      booting: false,
      models: {
        user: {
          find: sandbox.stub().callsFake((query, callback) => {
            // We return all users but one has an admin role which should be filtered out
            callback(null, mockUsers);
          })
        },
        "employment-profile": {
          findOne: sandbox.stub(),
          upsert: sandbox.stub()
        },
        Email: {
          send: sandbox.stub().callsFake((options, callback) => {
            callback(null);
          })
        }
      }
    };

    // Mock process
    mockProcess = {
      exit: sandbox.stub(),
      env: {}
    };

    // Require the transfer module with mocks
    const transferModule = proxyquire("../../bin/cronjobs/transfer", {
      debug: () => mockDebug,
      "moment-timezone": moment,
      async: {
        eachSeries: (array, iteratee, callback) => {
          const processItem = index => {
            if (index >= array.length) {
              return callback();
            }
            return iteratee(array[index], () => processItem(index + 1));
          };
          processItem(0);
        }
      },
      "../../server/server": appMock,
      "../../common/reporting": mockReporting,
      "../../common/formatters": mockFormatters,
      process: mockProcess
    });

    yearTransition = transferModule.yearTransition;
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

    // Override the sleep function in the module
    sandbox.stub(global, "setTimeout").callsFake(fn => {
      mockSleepCall();
      fn();
      return 123; // Return a timeout ID
    });

    // Start the transition process but don't wait for it
    const transitionPromise = yearTransition();

    await transitionPromise;

    // Verify debug was called with the correct message
    expect(mockDebug.calledWith("============ APP BOOTING ============")).to.be(
      true
    );
    expect(mockDebug.calledWith("============ APP STARTED ============")).to.be(
      true
    );
  });

  it("should filter out admin users", async () => {
    // Mock reporting to succeed
    mockReporting.timeseriesReporting.callsFake((models, params, callback) => {
      callback(null, {
        total: {
          target: 200,
          currentSaldo: 2
        }
      });
    });

    // Mock successful profile operations
    appMock.models["employment-profile"].findOne.callsFake(
      (query, callback) => {
        callback(null, null); // No existing profile
      }
    );

    appMock.models["employment-profile"].upsert.callsFake(
      (profile, callback) => {
        callback(null, profile);
      }
    );

    // Override setTimeout to execute callback immediately
    sandbox.stub(global, "setTimeout").callsFake(fn => {
      fn();
      return 123; // Return a timeout ID
    });

    await yearTransition();

    // Check that only non-admin users were processed
    expect(mockReporting.timeseriesReporting.callCount).to.be(1);
    const firstCall = mockReporting.timeseriesReporting.getCall(0);
    expect(firstCall.args[1].userId).to.be("user1");
  });

  it("should calculate correct transfer values", async () => {
    // Mock reporting with a known result
    mockReporting.timeseriesReporting.callsFake((models, params, callback) => {
      callback(null, {
        total: {
          target: 500, // 500 / 100 = 5 (max overtime)
          currentSaldo: 10 // Should be capped at 5
        }
      });
    });

    // Store the profile data
    let savedProfile = null;

    // Mock findOne to return no existing profile
    appMock.models["employment-profile"].findOne.callsFake(
      (query, callback) => {
        callback(null, null);
      }
    );

    // Mock upsert to capture the profile being saved
    appMock.models["employment-profile"].upsert.callsFake(
      (profile, callback) => {
        savedProfile = profile;
        callback(null, profile);
      }
    );

    // Override setTimeout to execute callback immediately
    sandbox.stub(global, "setTimeout").callsFake(fn => {
      fn();
      return 123;
    });

    await yearTransition();

    // Verify profile values
    expect(savedProfile).to.not.be(null);
    expect(savedProfile.transferTotalLastYear).to.be(500);
    expect(savedProfile.transferOvertime).to.be(5); // 500/100 = 5 (max overtime)
  });

  it("should handle existing employment profile", async () => {
    // Mock an existing profile
    const existingProfile = {
      id: "profile1",
      userId: "user1",
      year: moment()
        .add(1, "d")
        .year(),
      transferTotalLastYear: 300
    };

    // Mock reporting with a known result
    mockReporting.timeseriesReporting.callsFake((models, params, callback) => {
      callback(null, {
        total: {
          target: 500,
          currentSaldo: 2
        }
      });
    });

    // Store the profile data
    let savedProfile = null;

    // Mock findOne to return an existing profile
    appMock.models["employment-profile"].findOne.callsFake(
      (query, callback) => {
        callback(null, existingProfile);
      }
    );

    // Mock upsert to capture the profile being saved
    appMock.models["employment-profile"].upsert.callsFake(
      (profile, callback) => {
        savedProfile = profile;
        callback(null, profile);
      }
    );

    // Override setTimeout to execute callback immediately
    sandbox.stub(global, "setTimeout").callsFake(fn => {
      fn();
      return 123;
    });

    await yearTransition();

    // Verify the existing profile ID was preserved
    expect(savedProfile).to.not.be(null);
    expect(savedProfile.id).to.be("profile1");
    expect(savedProfile.transferTotalLastYear).to.be(500); // New value from reporting
  });

  it("should handle reporting errors", async () => {
    // Mock reporting with an error
    mockReporting.timeseriesReporting.callsFake((models, params, callback) => {
      callback(new Error("Reporting failed"));
    });

    // Override setTimeout to execute callback immediately
    sandbox.stub(global, "setTimeout").callsFake(fn => {
      fn();
      return 123;
    });

    await yearTransition();

    // Verify we attempted to process but didn't call upsert
    expect(mockReporting.timeseriesReporting.callCount).to.be(1);
    expect(appMock.models["employment-profile"].upsert.callCount).to.be(0);

    // Debug should have captured the error
    expect(mockDebug.calledWith(sinon.match(/status=failed/))).to.be(true);
  });

  it("should handle findProfile errors", async () => {
    // Mock reporting to succeed
    mockReporting.timeseriesReporting.callsFake((models, params, callback) => {
      callback(null, {
        total: {
          target: 500,
          currentSaldo: 2
        }
      });
    });

    // Mock findOne to return an error
    appMock.models["employment-profile"].findOne.callsFake(
      (query, callback) => {
        callback(new Error("Find profile failed"));
      }
    );

    // Override setTimeout to execute callback immediately
    sandbox.stub(global, "setTimeout").callsFake(fn => {
      fn();
      return 123;
    });

    await yearTransition();

    // Verify we didn't call upsert due to the findOne error
    expect(appMock.models["employment-profile"].upsert.callCount).to.be(0);

    // Debug should have captured the error
    expect(
      mockDebug.calledWith(sinon.match(/action=findProfile status=failed/))
    ).to.be(true);
  });

  it("should handle upsert errors", async () => {
    // Mock reporting to succeed
    mockReporting.timeseriesReporting.callsFake((models, params, callback) => {
      callback(null, {
        total: {
          target: 500,
          currentSaldo: 2
        }
      });
    });

    // Mock findOne to succeed
    appMock.models["employment-profile"].findOne.callsFake(
      (query, callback) => {
        callback(null, null);
      }
    );

    // Mock upsert to return an error
    appMock.models["employment-profile"].upsert.callsFake(
      (profile, callback) => {
        callback(new Error("Upsert failed"));
      }
    );

    // Override setTimeout to execute callback immediately
    sandbox.stub(global, "setTimeout").callsFake(fn => {
      fn();
      return 123;
    });

    await yearTransition();

    // Verify we attempted to upsert
    expect(appMock.models["employment-profile"].upsert.callCount).to.be(1);

    // Debug should have captured the error
    expect(mockDebug.calledWith(sinon.match(/status=done/))).to.be(true);
  });
});
