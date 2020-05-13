import { getStateIdentifyingInformation, getCountyIdentifyingInformation, getNYTCountyData } from './data-requests';
import { createState } from '../controllers/state-controller';
import { createCounty, getAllCounties } from '../controllers/county-controller';
import { deleteAllCaseCounts, createCaseCount, getAllCaseCounts } from '../controllers/case-count-controller';

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

const resetCaseCounts = () => {
	return new Promise((resolve, reject) => {
		// delete all case counts
		deleteAllCaseCounts()
			.then(() => {
				console.log('Deleted all pre-existing case counts');

				// set all case counts
				getNYTCountyData()
					.then((countyData) => {
						console.log('Retrieved all NYT data on the county level');

						getAllCounties()
							.then((countyObjects) => {
								console.log('Retrieved all county object data from the database');

								const previousDayData = {};

								countyData.forEach((county) => {
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

								countyData.forEach((nytData) => {
									promises.push(new Promise((res, rej) => {
										// get the value to update
										const previousValues = previousDayData[nytData.state][nytData.county];
										const newCaseCount = parseInt(nytData.cases) - previousValues.caseCount;
										const newDeathCount = parseInt(nytData.deaths) - previousValues.deathCount;

										const countyObj = countyObjects.find((county) => { return county.CountyName === nytData.county && county.StateName === nytData.state; });

										if (countyObj === undefined) {
											res();
										} else {
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

													// update the previous day data
													previousDayData[nytData.state][nytData.county] = {
														caseCount: newCaseCount,
														deathCount: newDeathCount,
													};

													res(data);
												})
												.catch((error) => {
													console.log(`Failed to case count for state: ${nytData.state}, county: ${nytData.county}, date: ${nytData.date}`);
													console.log(error);
													rej(error);
												});
										}
									}));
								});

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
	});
};

const setNewCaseCounts = () => {
	// just add new day
	return new Promise((resolve, reject) => {
		getAllCaseCounts()
			.then((caseCounts) => {
				console.log('got all case counts from sunapee');
				getNYTCountyData()
					.then((nytData) => {
						console.log('got the NYT covid19 data');

						const promises = [];

						const mostRecentDate = {};

						// set the most recent date we have available for every county
						caseCounts.forEach((county) => {
							// create state if doesn't exist
							if (!mostRecentDate[county.state]) {
								mostRecentDate[county.state] = {};
							}

							// create county if doesn't exist
							if (!mostRecentDate[county.state][county.county]) {
								mostRecentDate[county.state][county.county] = {};
							}

							// set new recent date if didn't find
							if (Object.keys(mostRecentDate[county.state][county.county]).length === 0 || mostRecentDate[county.state][county.county].date < county.date) {
								mostRecentDate[county.state][county.county] = county;
							}
						});

						console.log('Set most recent date objects for db data');

						const mostRecentNYTDate = {};

						// set the most recent date we have available for every county
						nytData.forEach((county) => {
							// create state if doesn't exist
							if (!mostRecentNYTDate[county.state]) {
								mostRecentNYTDate[county.state] = {};
							}

							// create county if doesn't exist
							if (!mostRecentNYTDate[county.state][county.county]) {
								mostRecentNYTDate[county.state][county.county] = {};
							}

							// set new recent date if didn't find
							if (Object.keys(mostRecentNYTDate[county.state][county.county]).length === 0 || mostRecentNYTDate[county.state][county.county].date < county.date) {
								mostRecentNYTDate[county.state][county.county] = county;
							}
						});

						console.log('Set most recent date objects for NYT data');


						Object.keys(mostRecentNYTDate).forEach((state) => {
							Object.keys(mostRecentNYTDate[state]).forEach(((county) => {
								promises.push(new Promise((res, rej) => {
									createCaseCount({
										CountyID: mostRecentDate[state][county].CountyID,
										StateName: mostRecentDate[state][county].StateName,
										Date: new Date(mostRecentNYTDate[state][county].date).toISOString().split('T')[0],
										CaseCount: mostRecentNYTDate[state][county].cases - mostRecentDate[state][county].CaseCount,
										DeathCount: mostRecentNYTDate[state][county].deaths - mostRecentDate[state][county].DeathCount,
									})
										.then((data) => {
											console.log(`Successfully set case count for state: ${nytData.state}, county: ${nytData.county}, date: ${nytData.date}`);
											res(data);
										})
										.catch((error) => {
											console.log(`Failed to set case count for state: ${nytData.state}, county: ${nytData.county}, date: ${nytData.date}`);
											rej(error);
										});
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
