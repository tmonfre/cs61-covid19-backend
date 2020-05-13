import { RESPONSE_CODES } from '../constants';

// get all states in the database
const getAllStates = () => {
	return new Promise((resolve, reject) => {
		// get all users
		global.connection.query('SELECT * FROM COVID19_sp20.States', (error, results, fields) => {
			if (error) {
				reject({ code: RESPONSE_CODES.INTERNAL_ERROR, error });
			} else {
				resolve(results);
			}
		});
	});
};

// get a specific state by name in the database
const getState = (name) => {
	return new Promise((resolve, reject) => {
		// get user
		global.connection.query(
			'SELECT * FROM COVID19_sp20.States WHERE StateName = ?',
			[name],
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

// create state in the database
const createState = (fields) => {
	return new Promise((resolve, reject) => {
		// ensure got required inputs
		if (!(fields.StateName && fields.Population && fields.FIPS)) {
			reject({
				code: RESPONSE_CODES.BAD_REQUEST,
				error: { message: 'Please provide StateName, Population, and FIPS' },
			});
		}

		const stateValues = [
			fields.StateName,
			fields.Population,
			fields.FIPS,
			fields.FirstCase || null,
			fields.FirstDeath || null,
		];

		// create user
		global.connection.query(
			'INSERT INTO COVID19_sp20.States'
            + '(StateName, Population, FIPS, FirstCase, FirstDeath) VALUES'
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

// delete the state object from the database
const deleteState = (stateName) => {
	return new Promise((resolve, reject) => {
		// delete user
		global.connection.query(
			'DELETE FROM COVID19_sp20.States WHERE StateName = ?',
			[stateName],
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

const deleteAllStates = () => {
	return new Promise((resolve, reject) => {
		// delete all counties
		global.connection.query(
			'',
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
	getAllStates,
	getState,
	createState,
	deleteState,
	deleteAllStates,
};
