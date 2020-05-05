import bcrypt from 'bcrypt-nodejs';
import jwt from 'jwt-simple';
import { RESPONSE_CODES } from './constants';

const { SALT_ROUNDS } = process.env;

// get all employees in the database
const getAllEmployees = () => {
	return new Promise((resolve, reject) => {
		// get all employees
		global.connection.query('SELECT * FROM nyc_inspections.Employees', (error, results, fields) => {
			if (error) {
				reject({ code: RESPONSE_CODES.INTERNAL_ERROR, error });
			} else {
				resolve(results);
			}
		});
	});
};

// get a specific employee by username in the database
const getEmployeeByUserName = (username) => {
	return new Promise((resolve, reject) => {
		// get employee
		global.connection.query(
			'SELECT * FROM nyc_inspections.Employees WHERE UserName = ?',
			[username],
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

// create employee in the database
const createEmployee = (fields) => {
	return new Promise((resolve, reject) => {
		// ensure got required inputs
		if (!(fields.FirstName && fields.UserName && fields.Password)) {
			reject({
				code: RESPONSE_CODES.BAD_REQUEST,
				error: { message: 'Please provide FirstName, UserName, and Password' },
			});
		}

		// auto-gen salt and hash the user's password
		bcrypt.hash(fields.Password, SALT_ROUNDS, null, (err, hash) => {
			if (err) {
				reject({ code: RESPONSE_CODES.INTERNAL_ERROR, error: err });
			} else {
				const userValues = [
					fields.UserName,
					fields.FirstName,
					fields.LastName || null,
					fields.Salary || null,
					fields.HireDate ? new Date(fields.HireDate).toISOString().split('T')[0] : null,
					fields.AdminUser || false,
					hash,
				];

				// create employee
				global.connection.query(
					'INSERT INTO nyc_inspections.Employees'
                    + '(UserName, FirstName, LastName, Salary, HireDate, AdminUser, SaltedPassword) VALUES'
                    + '(?, ?, ?, ?, ?, ?, ?)',
					userValues,
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
	});
};

// update the employee object in the database
// admin users calling this function can alter more fields
const updateEmployee = (username, fields, isAdmin) => {
	return new Promise((resolve, reject) => {
		// define the possible attributes the user could have supplied
		const possibleAttributes = ['FirstName', 'LastName'];

		// only admin user calling the function can change the AdminUser, Salary, and HireDate fields
		if (isAdmin) {
			possibleAttributes.push('AdminUser');
			possibleAttributes.push('Salary');
			possibleAttributes.push('HireDate');
		}

		// create lists for valid keys and values user could provide
		const queryKeys = [];
		const queryValues = [];

		// fill lists with user entry
		possibleAttributes.forEach((attribute) => {
			if (Object.keys(fields).includes(attribute)) {
				queryKeys.push(attribute);

				if (attribute === 'HireDate') {
					queryValues.push(new Date(fields[attribute]).toISOString().split('T')[0]);
				} else {
					queryValues.push(fields[attribute]);
				}
			}
		});

		queryValues.push(username);

		if (queryKeys.length > 0) {
			// update employee
			global.connection.query(
				`UPDATE nyc_inspections.Employees SET ${
					queryKeys.map((attribute) => {
						return `${attribute} = ?`;
					})
				} WHERE UserName = ?`,
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

// delete the employee object from the database
const deleteEmployee = (UserName) => {
	return new Promise((resolve, reject) => {
		// delete employee
		global.connection.query(
			'DELETE FROM nyc_inspections.Employees WHERE UserName = ?',
			[UserName],
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

// make sure user is properly authenticated
// hash and salt the username and password, make sure matches stored hash
const isAuthedUser = (credentials) => {
	return new Promise((resolve, reject) => {
		getEmployeeByUserName(credentials.username)
			.then((employee) => {
				if (employee.SaltedPassword) {
					bcrypt.compare(credentials.password, employee.SaltedPassword, (err, result) => {
						if (err) {
							reject({ code: RESPONSE_CODES.INTERNAL_ERROR, error: err });
						} else {
							// explicit check to only evaluate boolean
							// (will false a null/undefined instead of returning null/undefined)
							resolve(result === true);
						}
					});
				} else {
					reject({ code: RESPONSE_CODES.INTERNAL_ERROR, error: { message: 'Couldn\'t find SaltedPassword field' } });
				}
			})
			.catch((error) => {
				if (error.code.status === RESPONSE_CODES.NOT_FOUND.status) {
					reject({ code: RESPONSE_CODES.UNAUTHORIZED, error: { message: 'Incorrect credentials' } });
				} else {
					reject(error);
				}
			});
	});
};

// generate auth token for the given user
const tokenForUser = (username) => {
	const timestamp = new Date().getTime();
	return jwt.encode({ sub: username, iat: timestamp }, process.env.AUTH_SECRET);
};

export {
	getAllEmployees,
	getEmployeeByUserName,
	createEmployee,
	updateEmployee,
	deleteEmployee,
	isAuthedUser,
	tokenForUser,
};
