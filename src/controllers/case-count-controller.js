import { RESPONSE_CODES } from '../constants';

// get all case counts in the database
const getAllCaseCounts = () => {
	return new Promise((resolve, reject) => {
		// get all users
		global.connection.query('SELECT * FROM COVID19_sp20.CaseCount', (error, results, fields) => {
			if (error) {
				reject({ code: RESPONSE_CODES.INTERNAL_ERROR, error });
			} else {
				resolve(results);
			}
		});
	});
};

// get all case counts in the database
const getAllCaseCountsWithCountyName = () => {
	return new Promise((resolve, reject) => {
		// get all users
		global.connection.query('SELECT cc.*, c.CountyName FROM COVID19_sp20.CaseCount cc LEFT JOIN COVID19_sp20.Counties c ON cc.CountyID = c.countyID ', (error, results, fields) => {
			if (error) {
				reject({ code: RESPONSE_CODES.INTERNAL_ERROR, error });
			} else {
				resolve(results);
			}
		});
	});
};

const getCountyStateCaseCountAll = () => {
	return new Promise((resolve, reject) => {
		// get user
		global.connection.query(
			'SELECT CountyID, StateName, SUM(CaseCount) AS CaseCountSum, SUM(DeathCount) AS DeathCountSum FROM CaseCount GROUP BY StateName, CountyID',
			(error, results, fields) => {
				// send appropriate response
				if (error) {
					reject({ code: RESPONSE_CODES.INTERNAL_ERROR, error });
				} else if (results.length === 0) {
					reject({ code: RESPONSE_CODES.NOT_FOUND, error: { message: RESPONSE_CODES.NOT_FOUND.message } });
				} else {
					resolve(results);
				}
			},
		);
	});
};

// get a specific case count by countyID in the database
const getCountyCaseCount = (countyID) => {
	return new Promise((resolve, reject) => {
		// get user
		global.connection.query(
			'SELECT * FROM COVID19_sp20.CaseCount WHERE CountyID = ?',
			[countyID],
			(error, results, fields) => {
				// send appropriate response
				if (error) {
					reject({ code: RESPONSE_CODES.INTERNAL_ERROR, error });
				} else if (results.length === 0) {
					reject({ code: RESPONSE_CODES.NOT_FOUND, error: { message: RESPONSE_CODES.NOT_FOUND.message } });
				} else {
					resolve(results[0]);
				}
			},
		);
	});
};

const getAllStateCountsOverTime = () => {
	return new Promise((resolve, reject) => {
		// get user
		global.connection.query(
			'SELECT Date, StateName, SUM(CaseCount) AS CaseCountSum, SUM(DeathCount) AS DeathCountSum FROM CaseCount GROUP BY StateName, Date ORDER BY Date ASC',
			(error, results, fields) => {
				// send appropriate response
				if (error) {
					reject({ code: RESPONSE_CODES.INTERNAL_ERROR, error });
				} else if (results.length === 0) {
					reject({ code: RESPONSE_CODES.NOT_FOUND, error: { message: RESPONSE_CODES.NOT_FOUND.message } });
				} else {
					resolve(results);
				}
			},
		);
	});
};
const getAllCountsOverTime = () => {
	return new Promise((resolve, reject) => {
		// get user
		global.connection.query(
			'SELECT Date, SUM(CaseCount) AS CaseCountSum, SUM(DeathCount) AS DeathCountSum FROM CaseCount GROUP BY  Date ORDER BY Date ASC',
			(error, results, fields) => {
				// send appropriate response
				if (error) {
					reject({ code: RESPONSE_CODES.INTERNAL_ERROR, error });
				} else if (results.length === 0) {
					reject({ code: RESPONSE_CODES.NOT_FOUND, error: { message: RESPONSE_CODES.NOT_FOUND.message } });
				} else {
					resolve(results);
				}
			},
		);
	});
};

// get case count for a specific state
const getStateCaseCount = (StateName) => {
	return new Promise((resolve, reject) => {
		// get user
		global.connection.query(
			'SELECT * FROM COVID19_sp20.CaseCount WHERE StateName = ?',
			[StateName],
			(error, results, fields) => {
				// send appropriate response
				if (error) {
					reject({ code: RESPONSE_CODES.INTERNAL_ERROR, error });
				} else if (results.length === 0) {
					reject({ code: RESPONSE_CODES.NOT_FOUND, error: { message: RESPONSE_CODES.NOT_FOUND.message } });
				} else {
					resolve(results[0]);
				}
			},
		);
	});
};

// create case count in the database
const createCaseCount = (fields) => {
	return new Promise((resolve, reject) => {
		// ensure got required inputs
		if (!(fields.CountyID && fields.StateName)) {
			reject({
				code: RESPONSE_CODES.BAD_REQUEST,
				error: { message: 'Please provide CountyID and StateName' },
			});
		}

		const stateValues = [
			fields.CountyID,
			fields.StateName,
			fields.Date ? new Date(fields.Date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
			fields.CaseCount || 0,
			fields.DeathCount || 0,
		];

		// create user
		global.connection.query(
			'INSERT INTO COVID19_sp20.CaseCount'
            + '(CountyID, StateName, Date, CaseCount, DeathCount) VALUES'
            + '(?, ?, ?, ?, ?)',
			stateValues,
			(error, results) => {
				// send appropriate response
				if (error) {
					reject({ code: RESPONSE_CODES.INTERNAL_ERROR, error });
				} else {
					resolve(results);
				}
			},
		);
	});
};

// update the case count object in the database
// admin users calling this function can alter more fields
const updateCaseCount = (countyID, date, fields) => {
	return new Promise((resolve, reject) => {
		// ensure got required inputs
		if (!(countyID && date)) {
			reject({
				code: RESPONSE_CODES.BAD_REQUEST,
				error: { message: 'Please provide CountyID and Date' },
			});
		}

		// define the possible attributes the user could have supplied
		const possibleAttributes = ['CaseCount', 'DeathCount'];

		// create lists for valid keys and values user could provide
		const queryKeys = [];
		const queryValues = [];

		// fill lists with user entry
		possibleAttributes.forEach((attribute) => {
			if (Object.keys(fields).includes(attribute)) {
				queryKeys.push(attribute);
				queryValues.push(fields[attribute]);
			}
		});

		queryValues.push(countyID);
		queryValues.push(date);

		if (queryKeys.length > 0) {
			// update user
			global.connection.query(
				`UPDATE COVID19_sp20.CaseCount SET ${
					queryKeys.map((attribute) => {
						return `${attribute} = ?`;
					})
				} WHERE CountyID = ? AND Date = ?`,
				queryValues,
				(error, results) => {
					// send appropriate response
					if (error) {
						reject({ code: RESPONSE_CODES.INTERNAL_ERROR, error });
					} else {
						resolve(results);
					}
				},
			);
		} else {
			reject({ code: RESPONSE_CODES.NO_CONTENT, error: null });
		}
	});
};

// delete the case count object from the database
const deleteCaseCount = (countyID, date) => {
	return new Promise((resolve, reject) => {
		// ensure got required inputs
		if (!(countyID && date)) {
			reject({
				code: RESPONSE_CODES.BAD_REQUEST,
				error: { message: 'Please provide CountyID and Date' },
			});
		}

		// delete case count based on county id and date
		global.connection.query(
			'DELETE FROM COVID19_sp20.CaseCount WHERE countyID = ? AND Date = ?',
			[countyID, date],
			(error, results, fields) => {
				// send appropriate response
				if (error) {
					reject({ code: RESPONSE_CODES.INTERNAL_ERROR, error });
				} else if (results.length === 0) {
					reject({ code: RESPONSE_CODES.NOT_FOUND, error: { message: RESPONSE_CODES.NOT_FOUND.message } });
				} else {
					resolve(results);
				}
			},
		);
	});
};

const deleteAllCaseCounts = () => {
	return new Promise((resolve, reject) => {
		// delete all counties
		global.connection.query(
			'CALL TruncateCaseCounts()',
			(error, results, fields) => {
				// send appropriate response
				if (error) {
					reject({ code: RESPONSE_CODES.INTERNAL_ERROR, error });
				} else if (results.length === 0) {
					reject({ code: RESPONSE_CODES.NOT_FOUND, error: { message: RESPONSE_CODES.NOT_FOUND.message } });
				} else {
					resolve(results);
				}
			},
		);
	});
};

export {
	getAllCaseCounts,
	getAllCaseCountsWithCountyName,
	getCountyStateCaseCountAll,
	getCountyCaseCount,
	getStateCaseCount,
	deleteCaseCount,
	updateCaseCount,
	createCaseCount,
	deleteAllCaseCounts,
	getAllStateCountsOverTime,
	getAllCountsOverTime,
};
