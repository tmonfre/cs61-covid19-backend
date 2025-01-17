import { RESPONSE_CODES } from '../constants';

// get all counties in the database
const getAllCounties = () => {
	return new Promise((resolve, reject) => {
		// get all users
		global.connection.query('SELECT * FROM COVID19_sp20.Counties', (error, results, fields) => {
			if (error) {
				reject({ code: RESPONSE_CODES.INTERNAL_ERROR, error });
			} else {
				resolve(results);
			}
		});
	});
};

// get a specific county by countyID in the database
const getCounty = (countyID) => {
	return new Promise((resolve, reject) => {
		// get user
		global.connection.query(
			'SELECT * FROM COVID19_sp20.Counties WHERE CountyID = ?',
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

// get a specific county by county name and state name in the database
const getCountyByNameAndState = (countyName, stateName) => {
	return new Promise((resolve, reject) => {
		// get user
		global.connection.query(
			'SELECT * FROM COVID19_sp20.Counties WHERE CountyName AND StateName = ?',
			[countyName, stateName],
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

// create county in the database
const createCounty = (fields) => {
	return new Promise((resolve, reject) => {
		// ensure got required inputs
		if (!Object.keys(fields).includes('CountyName')
		|| !Object.keys(fields).includes('StateName')
		|| !Object.keys(fields).includes('Population')) {
			reject({
				code: RESPONSE_CODES.BAD_REQUEST,
				error: { message: 'Please provide CountyName, StateName, and Population' },
			});
		} else {
			const stateValues = [
				fields.CountyName,
				fields.StateName,
				fields.Population,
				fields.FIPS || null,
			];

			// create user
			global.connection.query(
				'INSERT INTO COVID19_sp20.Counties'
				+ '(CountyName, StateName, Population, FIPS) VALUES'
				+ '(?, ?, ?, ?)',
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
		}
	});
};

// delete the county object from the database
const deleteCounty = (countyID) => {
	return new Promise((resolve, reject) => {
		// delete county
		global.connection.query(
			'DELETE FROM COVID19_sp20.Counties WHERE countyID = ?',
			[countyID],
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

const deleteAllCounties = () => {
	return new Promise((resolve, reject) => {
		// delete all counties
		global.connection.query(
			'CALL TruncateCounties()',
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
	getAllCounties,
	getCounty,
	getCountyByNameAndState,
	createCounty,
	deleteCounty,
	deleteAllCounties,
};
