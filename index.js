/**
 * Foxx Services Template
 * @author Skitsanos, https://linkedin.com/in/skitsanos
 */
const {query} = require('@arangodb');

module.context.use('/', require('./foxx-services/tokenz/index'));
module.context.use('/', require('./foxx-services/echo/index'));
module.context.use('/', require('./foxx-services/users/index'));

module.context.checkAuth = headers =>
{
    if (module.context.configuration.skipAuthorization)
    {
        return true;
    }

    const auth_header = headers.authorization;
    if (!auth_header)
    {
        return false;
    }

    if (!auth_header.toLowerCase().includes('bearer'))
    {
        return false;
    }

    const [, token] = auth_header.split(' ');

    const user = query`        
    FOR user in auth
        FILTER user.token==${token}
        UPDATE user WITH { lastLogin: DATE_NOW() } IN auth
    RETURN user
    `.toArray();

    return user.length === 1;
};

module.context.use((req, res, next) =>
{
    if (!module.context.checkAuth(req.headers))
    {
        res.throw('unauthorized');
    }

    next();
});
