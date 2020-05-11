import request from 'request';
import csvtojson from 'csvtojson';
import path from 'path';

const STATE_URL = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv';
const COUNTIES_URL = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv';

// returs NYT state data
const getNYTStateData = () => {
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

// returns NYT county data
const getNYTCountyData = () => {
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

// returns { state, population } for each state in the US
const getStatePopulations = () => {
	return new Promise((resolve, reject) => {
		csvtojson()
			.fromFile(path.resolve(__dirname, '../data/state-populations.csv'))
			.then((json) => {
				resolve(json);
			})
			.catch((error) => {
				reject(error);
			});
	});
};

// returns { state, county, population } for each county in the US
const getCountyPopulations = () => {
	return new Promise((resolve, reject) => {
		csvtojson()
			.fromFile(path.resolve(__dirname, '../data/county-populations.csv'))
			.then((json) => {
				resolve(json);
			})
			.catch((error) => {
				reject(error);
			});
	});
};

// returns { state: { fips, counties: { county: fips } }} for each state/county in US
const getFIPSData = () => {
	return new Promise((resolve, reject) => {
		const fips = {};

		// populate states
		getNYTStateData()
			.then((stateData) => {
				stateData.forEach((state) => {
					fips[state.state] = { fips: state.fips, counties: {} };
				});

				// populate counties
				getNYTCountyData()
					.then((countyData) => {
						countyData.forEach((county) => {
							fips[county.state].counties[county.county] = county.fips;
						});

						resolve(fips);
					})
					.catch((error) => {
						reject(error);
					});
			})
			.catch((error) => {
				reject(error);
			});
	});
};

// returns { state, population, fips } for each state in the US
const getStateIdentifyingInformation = () => {
	return new Promise((resolve, reject) => {
		getFIPSData()
			.then((fips) => {
				getStatePopulations()
					.then((populations) => {
						const output = populations.map((pop) => {
							return {
								...pop,
								population: parseInt(pop.population.replace(',', '').replace(',', '')),
								fips: fips[pop.state].fips,
							};
						});

						resolve(output);
					})
					.catch((error) => {
						reject(error);
					});
			})
			.catch((error) => {
				reject(error);
			});
	});
};

// returns { state, county, population, fips } for each county in the US
const getCountyIdentifyingInformation = () => {
	return new Promise((resolve, reject) => {
		getFIPSData()
			.then((fips) => {
				getCountyPopulations()
					.then((populations) => {
						const output = populations.map((pop) => {
							const county = {
								...pop,
								county: pop.county.replace(' County', ''),
								population: parseInt(pop.population.replace(',', '').replace(',', '')),
							};

							county.fips = fips[county.state].counties[county.county];
							return county;
						});

						resolve(output);
					})
					.catch((error) => {
						reject(error);
					});
			})
			.catch((error) => {
				reject(error);
			});
	});
};

export {
	getNYTStateData,
	getNYTCountyData,
	getStatePopulations,
	getCountyPopulations,
	getFIPSData,
	getStateIdentifyingInformation,
	getCountyIdentifyingInformation,
};
