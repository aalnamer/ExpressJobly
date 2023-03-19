const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

// the function below is used in the async update function which is used in the update route. When this function is called, it organizes the data for the SQL query. It sends the columns to be updated as an object, setCols, and sends the values to be put into each column as values.

// This function recieves the data from the update function in the /models/user.js. The data is then saved into an object. The keys to this object are equal to the data recieved. For example, firstName would be the first key, lastName would be the second and so on. Next, the columns are mapped and turned into a string.

// the req.body sent is an object. keys is equal to the object's keys. For example, firstName, lastName. Next the keys are mapped to be the correct format for SQL. Values is equal to the values of the req.body object sent.

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
