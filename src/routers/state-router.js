import express from 'express';
import * as stateController from '../controllers/state-controller';

const router = express();

router.route('/')
	// GET all states
	.get((req, res) => {
		// grab all states from controller
		stateController.getAllStates()
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

router.route('/:statename')
	// GET specific state by state name
	.get((req, res) => {
		// grab the state data
		stateController.getState(req.params.statename)
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
