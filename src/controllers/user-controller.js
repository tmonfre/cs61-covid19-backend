import bcrypt from 'bcrypt-nodejs';
import jwt from 'jwt-simple';
import { RESPONSE_CODES } from '../constants';

const { SALT_ROUNDS } = process.env;

// get all users in the database
const getAllUsers = () => {
	return new Promise((resolve, reject) => {
		// get all users
		global.connection.query('SELECT * FROM COVID19_sp20.Users', (error, results, fields) => {
			if (error) {
				reject({ code: RESPONSE_CODES.INTERNAL_ERROR, error });
			} else {
				results.forEach((user) => {
					user.AdminUser = user.AdminUser === 1;
				});

				resolve(results);
			}
		});
	});
};

// get a specific user by username in the database
const getUser = (username) => {
	return new Promise((resolve, reject) => {
		// get user
		global.connection.query(
			'SELECT * FROM COVID19_sp20.Users WHERE UserName = ?',
			[username],
			(error, results, fields) => {
				// send appropriate response
				if (error) {
					reject({ code: RESPONSE_CODES.INTERNAL_ERROR, error });
				} else if (results.length === 0) {
					reject({ code: RESPONSE_CODES.NOT_FOUND, error: { message: RESPONSE_CODES.NOT_FOUND.message } });
				} else {
					results[0].AdminUser = results[0].AdminUser === 1;
					resolve(results[0]);
				}
			},
		);
	});
};

// create user in the database
const createUser = (fields) => {
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
					fields.AccountCreated ? new Date(fields.AccountCreated).toISOString().split('T')[0] : null,
					fields.AdminUser || false,
					hash,
				];

				// create user
				global.connection.query(
					'INSERT INTO COVID19_sp20.Users'
                    + '(UserName, FirstName, LastName, AccountCreated, AdminUser, SaltedPassword) VALUES'
                    + '(?, ?, ?, ?, ?, ?)',
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

// update the user object in the database
// admin users calling this function can alter more fields
const updateUser = (username, fields, isAdmin) => {
	return new Promise((resolve, reject) => {
		// define the possible attributes the user could have supplied
		const possibleAttributes = ['FirstName', 'LastName'];

		// only admin user calling the function can change the AdminUser and AccountCreated fields
		if (isAdmin) {
			possibleAttributes.push('AdminUser');
			possibleAttributes.push('AccountCreated');
		}

		// create lists for valid keys and values user could provide
		const queryKeys = [];
		const queryValues = [];

		// fill lists with user entry
		possibleAttributes.forEach((attribute) => {
			if (Object.keys(fields).includes(attribute)) {
				queryKeys.push(attribute);

				if (attribute === 'AccountCreated') {
					queryValues.push(new Date(fields[attribute]).toISOString().split('T')[0]);
				} else {
					queryValues.push(fields[attribute]);
				}
			}
		});

		queryValues.push(username);

		if (queryKeys.length > 0) {
			// update user
			global.connection.query(
				`UPDATE COVID19_sp20.Users SET ${
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

// delete the user object from the database
const deleteUser = (UserName) => {
	return new Promise((resolve, reject) => {
		// delete user
		global.connection.query(
			'DELETE FROM COVID19_sp20.Users WHERE UserName = ?',
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
		getUser(credentials.username)
			.then((user) => {
				if (user.SaltedPassword) {
					bcrypt.compare(credentials.password, user.SaltedPassword, (err, result) => {
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
	getAllUsers,
	getUser,
	createUser,
	updateUser,
	deleteUser,
	isAuthedUser,
	tokenForUser,
};
