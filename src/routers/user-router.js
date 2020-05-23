import express from 'express';
import * as userController from '../controllers/user-controller';
import { RESPONSE_CODES } from '../constants';

const router = express();

router.route('/')
	// GET all users
	.get((req, res) => {
		// ensure admin user is calling this route
		if (req.user.AdminUser) {
			// grab all users from controller
			userController.getAllUsers()
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
		} else {
			res.status(RESPONSE_CODES.FORBIDDEN.status).send({
				status: RESPONSE_CODES.FORBIDDEN.status,
				error: 'Not authorized for this function',
				response: RESPONSE_CODES.FORBIDDEN.message,
			});
		}
	});

router.route('/:id')
	// GET specific user
	.get((req, res) => {
		// ensure admin user is calling this route OR authed user is requesting themselves
		if (req.user.AdminUser || req.user.UserName === req.params.id) {
			// grab the user data
			userController.getUser(req.params.id)
				.then((response) => {
					// don't show salted password to user
					if (response.SaltedPassword) {
						delete response.SaltedPassword;
					}

					res.send({ status: 200, error: null, response });
				})
				.catch((error) => {
					res.status(error.code.status).send({
						status: error.code.status,
						error: error.error,
						response: error.code.message,
					});
				});
		} else {
			res.status(RESPONSE_CODES.FORBIDDEN.status).send({
				status: RESPONSE_CODES.FORBIDDEN.status,
				error: 'Not authorized for this function',
				response: RESPONSE_CODES.FORBIDDEN.message,
			});
		}
	})
	// UPDATE specific user
	.put((req, res) => {
		// ensure admin user is calling this route OR authed user is requesting themselves
		if (req.user.AdminUser || req.user.UserName === req.params.id) {
			// update user
			userController.updateUser(req.params.id, req.body, req.user.AdminUser)
				.then((response) => {
					res.send({ status: 200, error: null, response });
				})
				.catch((error) => {
					console.log(error);
					res.status(error.code.status).send({
						status: error.code.status,
						error: error.error,
						response: error.code.message,
					});
				});
		} else {
			res.status(RESPONSE_CODES.FORBIDDEN.status).send({
				status: RESPONSE_CODES.FORBIDDEN.status,
				error: 'Not authorized for this function',
				response: RESPONSE_CODES.FORBIDDEN.message,
			});
		}
	})
	// DELETE specific user
	.delete((req, res) => {
		// ensure admin user is calling this route
		if (req.user.AdminUser) {
			// delete user
			userController.deleteUser(req.params.id)
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
		} else {
			res.status(RESPONSE_CODES.FORBIDDEN.status).send({
				status: RESPONSE_CODES.FORBIDDEN.status,
				error: 'Not authorized for this function',
				response: RESPONSE_CODES.FORBIDDEN.message,
			});
		}
	});

export default router;
