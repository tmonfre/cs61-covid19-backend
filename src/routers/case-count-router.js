import express from 'express';
import * as caseCountController from '../controllers/case-count-controller';
import requireAuth from '../authentication/require-auth';
import { RESPONSE_CODES } from '../constants';

const router = express();

router.route('/')
	// GET all case counts
	.get((req, res) => {
		// grab all case counts from controller
		caseCountController.getAllCaseCounts()
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

router.route('/set/:countyid/:date')
	// POST specific case count by case count ID
	.post(requireAuth, (req, res) => {
		// ensure they are an admin user
		if (req.user.AdminUser) {
			// grab the county data
			caseCountController.createCaseCount({ ...req.body, CountyID: req.params.countyid, Date: new Date(req.params.date).toISOString().split('T')[0] })
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
	// PUT specific case count by case count ID
	.put(requireAuth, (req, res) => {
		// ensure they are an admin user
		if (req.user.AdminUser) {
			// grab the county data
			caseCountController.updateCaseCount(req.params.countyid, new Date(req.params.date).toISOString().split('T')[0], req.body)
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
	// DELETE specific case count by case count ID
	.delete(requireAuth, (req, res) => {
		// ensure they are an admin user
		if (req.user.AdminUser) {
			// grab the county data
			caseCountController.deleteCaseCount(req.params.countyid, new Date(req.params.date).toISOString().split('T')[0])
				.then((response) => {
					console.log(response);
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

router.route('/counties/:countyid')
	// GET case count by county id
	.get((req, res) => {
		// grab the county data
		caseCountController.getCountyCaseCount(req.params.countyid)
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

router.route('/states/:statename')
	// GET specific county by state name and county name
	.get((req, res) => {
		// grab the county data
		caseCountController.getStateCaseCount(req.params.statename)
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
router.route('/states/')
	// GET sum of stat counts
	.get((req, res) => {
		// grab the data
		caseCountController.getAllStateCountsOverTime()
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
router.route('/country/')
	// GET sum of stat counts
	.get((req, res) => {
		// grab the data
		caseCountController.getAllCountsOverTime()
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

router.route('/county/data/')
	.get((req, res) => {
		// grab the data
		caseCountController.getCountyCaseCountAll()
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

router.route('/state/data/')
	.get((req, res) => {
		// grab the data
		caseCountController.getStateCaseCountAll()
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
