import express from 'express';
import { isAuthedUser, tokenForUser, createUser } from '../controllers/user-controller';
import { RESPONSE_CODES, extractCredentialsFromAuthorization } from '../constants';

const router = express();

// given username and password in authorization header, return auth token
router.route('/login')
	.get((req, res) => {
		// ensure provided authorization headers
		if (!req.headers.authorization) {
			res.status(RESPONSE_CODES.UNAUTHORIZED.status).send({
				status: RESPONSE_CODES.UNAUTHORIZED.status,
				error: 'Must provide authorization header with basic auth (username and password)',
				response: RESPONSE_CODES.UNAUTHORIZED.message,
			});
		}

		const credentials = extractCredentialsFromAuthorization(req.headers.authorization);

		// check to make sure username and password are correct
		isAuthedUser(credentials)
			.then((isAuthed) => {
				console.log(isAuthed);
				if (isAuthed) {
					// send back token if properly authenticated
					res.send({ status: 200, error: null, response: { token: tokenForUser(credentials.username) } });
				} else {
					// send error if wrong credentials
					res.status(RESPONSE_CODES.UNAUTHORIZED.status).send({
						status: RESPONSE_CODES.UNAUTHORIZED.status,
						error: 'Incorrect credentials',
						response: RESPONSE_CODES.UNAUTHORIZED.message,
					});
				}
			})
			.catch((error) => {
				// handle internal error
				res.status(RESPONSE_CODES.INTERNAL_ERROR.status).send({
					status: RESPONSE_CODES.INTERNAL_ERROR.status,
					error,
					response: RESPONSE_CODES.INTERNAL_ERROR.message,
				});
			});
	});

router.route('/sign-up')
	// CREATE new user
	.post((req, res) => {
		// ensure provided authorization headers
		if (!req.headers.authorization) {
			res.status(RESPONSE_CODES.UNAUTHORIZED.status).send({
				status: RESPONSE_CODES.UNAUTHORIZED.status,
				error: 'Must provide authorization header with basic auth (username and password)',
				response: RESPONSE_CODES.UNAUTHORIZED.message,
			});
		}

		const credentials = extractCredentialsFromAuthorization(req.headers.authorization);

		req.body.UserName = credentials.username;
		req.body.Password = credentials.password;

		// create user
		createUser(req.body)
			.then((response) => {
				res.send({ status: 200, error: null, response });
			})
			.catch((error) => {
				res.status(error.code.status).send({
					status: error.code.status,
					error: error.error,
					response: error.code.message,
				});
			});
	});

export default router;
