import axios from 'axios';
import { createUser } from '../controllers/user-controller';

const createInitialAdminUser = (app) => {
	// define route for initially creating admin employee
	// NOTE: this is for the graders, so they can have an
	// admin to login as on the frontend
	app.post('/initial-admin', (req, res) => {
	// create employee with dummy values
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

	// make request
	axios.post('http://localhost:3000/initial-admin', {
		FirstName: 'Thomas',
		LastName: 'Monfre',
		AccountCreated: new Date().toISOString().split('T')[0],
		UserName: 'tmonfre',
		Password: 'password',
		AdminUser: true,
	})
		.then((result) => {
			console.log('SUCCESSFULLY CREATED INITIAL ADMIN USER');
			console.log('CAN NOW LOGIN WITH USERNAME: tmonfre');
			console.log(result.data);
		})
		.catch((error) => {
			console.log('FAILED TO CREATE INITIAL ADMIN USER');
			console.log(error.response.data);
		});
};

export default createInitialAdminUser;
