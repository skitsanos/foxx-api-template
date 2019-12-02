const createRouter = require('@arangodb/foxx/router');
const r = createRouter();
module.exports = r;

r.all('/echo', (req, res) =>
{
    res.send({
        authorized: module.context.checkAuth(req.headers),
        result: {
            headers: req.headers,
            body: req.body
        },
        config: module.context.configuration
    });
});
