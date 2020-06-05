module.exports.INVALID_VALUE = "the value is invalid";
module.exports.RECORD_CLOSED = "the record is closed";
module.exports.RECORD_CLOSED_ERROR = Object.assign(
  new Error(module.exports.RECORD_CLOSED),
  {
    name: "RecordClosedError",
    statusCode: 422
  }
);
module.exports.DATABASE_ERROR = Object.assign(new Error("Database error"), {
  name: "DatabaseError",
  statusCode: 500
});

module.exports.customValidationError = (context, codes, messages) =>
  Object.assign(new Error(`The \`${context}\` instance is not valid`), {
    statusCode: 422,
    name: "ValidationError",
    details: {
      codes,
      messages
    }
  });
