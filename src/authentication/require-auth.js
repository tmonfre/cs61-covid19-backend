import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { getUser } from '../controllers/user-controller';

require('dotenv').config();

const jwtOptions = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: process.env.AUTH_SECRET,
};

const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
	// make sure token matches a user in the database
	getUser(payload.sub)
		.then((user) => {
			if (user) {
				return done(null, user);
			} else {
				return done(null, false);
			}
		})
		.catch((error) => {
			return done(error, false);
		});
});

passport.use(jwtLogin);

const requireAuth = passport.authenticate('jwt', { session: false });

export default requireAuth;
