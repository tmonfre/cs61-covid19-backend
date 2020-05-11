import request from 'request';
import csvtojson from 'csvtojson';

const STATE_URL = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv';
const COUNTIES_URL = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv';

const getStateData = () => {
	return new Promise((resolve, reject) => {
		const data = [];

		csvtojson()
			.fromStream(request.get(STATE_URL))
			.subscribe((json) => {
				data.push(json);
			}, (error) => {
				reject(error);
			}, () => {
				resolve(data);
			});
	});
};

const getCountyData = () => {
	return new Promise((resolve, reject) => {
		const data = [];

		csvtojson()
			.fromStream(request.get(COUNTIES_URL))
			.subscribe((json) => {
				data.push(json);
			}, (error) => {
				reject(error);
			}, () => {
				resolve(data);
			});
	});
};

export {
	getStateData,
	getCountyData,
};
