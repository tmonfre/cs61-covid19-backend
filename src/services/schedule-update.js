import schedule from 'node-schedule';
import { setNewCaseCounts } from './populate-db';

const initializeScheduler = () => {
	const rule = new schedule.RecurrenceRule();
	rule.minute = 0;
	rule.hour = 7;

	schedule.scheduleJob(rule, () => {
		setNewCaseCounts();
	});
};

export default initializeScheduler;
