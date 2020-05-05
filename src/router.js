import express from 'express';
import * as controller from './controller';
import { RESPONSE_CODES } from './constants';

const router = express();

router.route('/')
	// GET all users
	.get((req, res) => {
		// ensure admin user is calling this route
		if (req.user.AdminUser) {
			// grab all employees from controller
			controller.getAllEmployees()
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
	})
	// CREATE new user
	.post((req, res) => {
		// ensure admin user is calling this route
		if (req.user.AdminUser) {
			// create employee
			controller.createEmployee(req.body)
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
			// grab the employee data
			controller.getEmployeeByUserName(req.params.id)
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
			// update employee
			controller.updateEmployee(req.params.id, req.body, req.user.AdminUser)
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
	})
	// DELETE specific user
	.delete((req, res) => {
		// ensure admin user is calling this route
		if (req.user.AdminUser) {
			// delete employee
			controller.deleteEmployee(req.params.id)
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
