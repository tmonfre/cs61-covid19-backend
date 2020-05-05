// adopted from: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
const RESPONSE_CODES = {
	SUCCESS: {
		status: 200,
		message: 'SUCCESS',
	},
	NOT_FOUND: {
		status: 404,
		message: 'NOT_FOUND',
	},
	INTERNAL_ERROR: {
		status: 500,
		message: 'INTERNAL_ERROR',
	},
	BAD_REQUEST: {
		status: 400,
		message: 'BAD_REQUEST',
	},
	UNAUTHORIZED: {
		status: 401,
		message: 'UNAUTHORIZED',
	},
	FORBIDDEN: {
		status: 403,
		message: 'FORBIDDEN',
	},
	NO_CONTENT: {
		status: 200,
		message: 'NOTHING_TO_UPDATE',
	},
};

// given authorization header, return username and password
// adapted from: https://gist.github.com/charlesdaniel/1686663
const extractCredentialsFromAuthorization = (authorization) => {
	const auth = Buffer.from(authorization.split(' ')[1], 'base64').toString().split(':');

	return {
		username: auth[0],
		password: auth[1],
	};
};

export {
	RESPONSE_CODES,
	extractCredentialsFromAuthorization,
};
