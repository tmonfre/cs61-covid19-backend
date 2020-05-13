import express from 'express';
import * as countyController from '../controllers/county-controller';

const router = express();

router.route('/')
	// GET all states
	.get((req, res) => {
		// grab all counties from controller
		countyController.getAllCounties()
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

router.route('/:countyid')
	// GET specific county by county id
	.get((req, res) => {
		// grab the county data
		countyController.getCounty(req.params.countyid)
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

router.route('/:statename/:countyname')
	// GET specific county by state name and county name
	.get((req, res) => {
		// grab the county data
		countyController.getCountyByNameAndState(req.params.countyname, req.params.statename)
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
