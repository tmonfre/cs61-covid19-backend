/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import { getStateIdentifyingInformation, getCountyIdentifyingInformation, getNYTCountyData } from './data-requests';
import { createState, getAllStates } from '../controllers/state-controller';
import { createCounty, getAllCounties } from '../controllers/county-controller';
import { deleteAllCaseCounts, createCaseCount } from '../controllers/case-count-controller';

const createStates = () => {
	return new Promise((resolve, reject) => {
		getStateIdentifyingInformation()
			.then((states) => {
				//   { state: 'Wisconsin', population: 5822434, fips: '55' },
				const promises = [];

				states.forEach((state) => {
					promises.push(createState({
						StateName: state.state,
						Population: state.population,
						FIPS: state.fips,
					}));
				});

				Promise.all(promises)
					.then(() => {
						resolve('Successfully created all states');
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

const createCounties = () => {
	return new Promise((resolve, reject) => {
		getCountyIdentifyingInformation()
			.then((counties) => {
				// { state: 'Alaska', county: 'Valdez-Cordova Census Area', population: 9202, fips: '02261' },
				const promises = [];

				counties.forEach((county) => {
					promises.push(createCounty({
						CountyName: county.county,
						StateName: county.state,
						Population: county.population,
						FIPS: county.fips,
					}));
				});

				Promise.all(promises)
					.then(() => {
						resolve('Successfully created all counties');
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

// create state objects and county objects in the database that don't currently exist
const createUnknownStatesAndCounties = (stateObjects, countyObjects, nytCountyData) => {
	return new Promise((resolve, reject) => {
		const countiesToSet = {};
		const statesToSet = [];

		nytCountyData.forEach((nytCounty) => {
			// keep track of new states to add
			if (!(statesToSet.includes(nytCounty.state)) && stateObjects.find((state) => { return state.StateName === nytCounty.state; }) === undefined) {
				statesToSet.push(nytCounty.state);
			}

			// keep track of all states for county mapping
			if (countiesToSet[nytCounty.state] === undefined) {
				countiesToSet[nytCounty.state] = [];
			}

			// keep track of all new counties to add
			if (!(countiesToSet[nytCounty.state].includes(nytCounty.county)) && countyObjects.find((county) => { return county.CountyName === nytCounty.county && county.StateName === nytCounty.state; }) === undefined) {
				countiesToSet[nytCounty.state].push(nytCounty.county);
			}
		});

		const statePromises = [];

		// create all unknown states
		statesToSet.forEach((stateToAdd) => {
			statePromises.push(new Promise((res, rej) => {
				createState({
					StateName: stateToAdd,
					Population: 0,
					FIPS: 0,
				})
					.then((addedState) => {
						console.log(`Successfully created new state ${stateToAdd}`);
						stateObjects.push(addedState);
						res();
					})
					.catch((error) => {
						console.log(error);
						res();
					});
			}));
		});

		// after all unknown states created
		Promise.all(statePromises)
			.then(() => {
				const countyPromises = [];

				// create all unknown counties
				Object.keys(countiesToSet).forEach((state) => {
					countiesToSet[state].forEach((countyToAdd) => {
						countyPromises.push(new Promise((res, rej) => {
							createCounty({
								CountyName: countyToAdd,
								StateName: state,
								Population: 0,
							})
								.then((addedCounty) => {
									console.log(`Successfully created new county ${countyToAdd} in state ${state}`);
									countyObjects.push(addedCounty);
									res();
								})
								.catch((error) => {
									console.log(error);
									res();
								});
						}));
					});
				});

				// finish
				Promise.all(countyPromises)
					.then(() => {
						resolve();
					})
					.catch((error) => {
						reject(error);
					});
			})
			.catch((error) => {
				reject(error);
			});

		resolve();
	});
};

const resetCaseCounts = () => {
	return new Promise((resolve, reject) => {
		// delete all case counts
		deleteAllCaseCounts()
			.then(() => {
				console.log('Deleted all pre-existing case counts');

				// set all case counts
				getNYTCountyData()
					.then((nytCountyData) => {
						console.log('Retrieved all NYT data on the county level');
						getAllCounties()
							.then((countyObjects) => {
								getAllStates()
									.then((stateObjects) => {
										createUnknownStatesAndCounties(stateObjects, countyObjects, nytCountyData)
											.then(() => {
												console.log('Retrieved all county object data from the database');

												const previousDayData = {};

												nytCountyData.forEach((county) => {
													if (!previousDayData[county.state]) {
														previousDayData[county.state] = {};
													}

													if (!previousDayData[county.state][county.county]) {
														previousDayData[county.state][county.county] = {
															caseCount: 0,
															deathCount: 0,
														};
													}
												});

												console.log('Initialized the previous day counts for each state/county');

												// { date: '2020-02-08', county: 'Maricopa', state: 'Arizona', fips: '04013', cases: '1', deaths: '0' },

												const promises = [];

												for (const nytDataIndex in nytCountyData) {
													const nytData = nytCountyData[nytDataIndex];

													// get the value to update
													const previousValues = previousDayData[nytData.state][nytData.county];
													const newCaseCount = parseInt(nytData.cases) - previousValues.caseCount;
													const newDeathCount = parseInt(nytData.deaths) - previousValues.deathCount;
													const countyObj = countyObjects.find((county) => { return county.CountyName === nytData.county && county.StateName === nytData.state; });

													// update the previous day data
													previousDayData[nytData.state][nytData.county] = {
														caseCount: parseInt(nytData.cases),
														deathCount: parseInt(nytData.deaths),
													};

													if (countyObj !== undefined) {
														// eslint-disable-next-line no-loop-func
														promises.push(new Promise((res, rej) => {
															// set the case count
															createCaseCount({
																CountyID: countyObj.CountyID,
																StateName: nytData.state,
																Date: new Date(nytData.date).toISOString().split('T')[0],
																CaseCount: newCaseCount,
																DeathCount: newDeathCount,
															})
																.then((data) => {
																	console.log(`Successfully set case count for state: ${nytData.state}, county: ${nytData.county}, date: ${nytData.date}`);
																	res(data);
																})
																.catch((error) => {
																	console.log(`Failed to case count for state: ${nytData.state}, county: ${nytData.county}, date: ${nytData.date}`);
																	console.log(error);
																	rej(error);
																});
														}));
													}
												}

												Promise.all(promises)
													.then(() => {
														resolve('cases by county created');
													})
													.catch((error) => {
														reject(error);
													});
											})
											.catch((error) => {
												reject(error);
											});
									})
									.catch((error) => {
										reject(error);
									});
							})
							.catch((error) => {
								reject(error);
							});
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

const setNewCaseCounts = () => {
	// just add new day
	return new Promise((resolve, reject) => {
		getAllCounties()
			.then((dbCounties) => {
				getNYTCountyData()
					.then((nytData) => {
						console.log('got the NYT covid19 data');

						const promises = [];
						const mostRecentNYTDate = {};

						// set the most recent date we have available for every county
						nytData.forEach((county) => {
							// create state if doesn't exist
							if (!mostRecentNYTDate[county.state]) {
								mostRecentNYTDate[county.state] = {};
							}

							// create county if doesn't exist
							if (!mostRecentNYTDate[county.state][county.county]) {
								mostRecentNYTDate[county.state][county.county] = {
									mostRecent: {},
									secondMostRecent: {},
								};
							}

							// set new recent date if didn't find
							if (Object.keys(mostRecentNYTDate[county.state][county.county].mostRecent).length === 0 || mostRecentNYTDate[county.state][county.county].mostRecent.date < county.date) {
								mostRecentNYTDate[county.state][county.county].secondMostRecent = mostRecentNYTDate[county.state][county.county].mostRecent;
								mostRecentNYTDate[county.state][county.county].mostRecent = county;
							}
						});

						Object.keys(mostRecentNYTDate).forEach((state) => {
							Object.keys(mostRecentNYTDate[state]).forEach(((county) => {
								promises.push(new Promise((res, rej) => {
									const countyDBObj = dbCounties.find((c) => { return c.StateName === state && c.CountyName === county; });

									if (countyDBObj !== undefined) {
										// generate case count
										createCaseCount({
											CountyID: countyDBObj.CountyID,
											StateName: state,
											Date: new Date(mostRecentNYTDate[state][county].mostRecent.date).toISOString().split('T')[0],
											CaseCount: mostRecentNYTDate[state][county].mostRecent.cases - (mostRecentNYTDate[state][county].secondMostRecent.cases || 0),
											DeathCount: mostRecentNYTDate[state][county].mostRecent.deaths - (mostRecentNYTDate[state][county].secondMostRecent.deaths || 0),
										})
											.then((data) => {
												console.log(`Successfully set case count for state: ${state}, county: ${county}, date: ${mostRecentNYTDate[state][county].mostRecent.date}`);
												res(data);
											})
											.catch((err) => {
												console.log(`Failed to set case count for state: ${state}, county: ${county}, date: ${mostRecentNYTDate[state][county].mostRecent.date}`);
												rej(err);
											});
									} else {
										createCounty({
											CountyName: county,
											StateName: state,
											Population: 0,
										})
											.then((createdCounty) => {
											// generate case count
												createCaseCount({
													CountyID: createdCounty.CountyID,
													StateName: state,
													Date: new Date(mostRecentNYTDate[state][county].mostRecent.date).toISOString().split('T')[0],
													CaseCount: mostRecentNYTDate[state][county].mostRecent.cases - (mostRecentNYTDate[state][county].secondMostRecent.cases || 0),
													DeathCount: mostRecentNYTDate[state][county].mostRecent.deaths - (mostRecentNYTDate[state][county].secondMostRecent.deaths || 0),
												})
													.then((data) => {
														console.log(`Successfully set case count for state: ${state}, county: ${county}, date: ${mostRecentNYTDate[state][county].mostRecent.date}`);
														res(data);
													})
													.catch((err) => {
														console.log(`Failed to set case count for state: ${state}, county: ${county}, date: ${mostRecentNYTDate[state][county].mostRecent.date}`);
														rej(err);
													});
											})
											.catch((err) => {
												res();
											});
									}
								}));
							}));
						});

						Promise.all(promises)
							.then(() => {
								resolve('Successfully set new case count data');
							})
							.catch((error) => {
								reject(error);
							});
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
	createStates,
	createCounties,
	resetCaseCounts,
	setNewCaseCounts,
};
