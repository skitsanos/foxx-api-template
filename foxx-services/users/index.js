const createRouter = require('@arangodb/foxx/router');
const {db, query, time} = require('@arangodb');
const joi = require('joi');
const _ = require('lodash');
const r = createRouter();
module.exports = r;

const userSchema = joi.object({
    username: joi.string().required(),
    password: joi.string().min(8).max(64).required(),
    name: joi.string().required()
}).required();

const collectionUsers = db._collection('users');

r.get('/users', (req, res) =>
{
    const start = time();

    if (!collectionUsers)
    {
        //create new one?
        res.throw('Not found');
    }
    else
    {
        const users = query`
        FOR user in users
        RETURN user
        `.toArray().map(item => _.omit(item, ['password', '_id', '_rev']));

        res.send({result: users, execTime: time() - start});
    }
})
    .response(['application/json'], 'User management - List users')
    .description('Gets list of users');

r.get('/users/:id', (req, res) =>
{
    const start = time();

    const user = query`
    FOR user in users
    FILTER user._key==${req.pathParams.id}
    RETURN user
    `.toArray();

    res.send({result: user.length > 0 ? _.omit(user[0], ['password', '_id', '_rev']) : null, execTime: time() - start});
})
    .pathParam('id', joi.string().required(), 'User id')
    .response(['application/json'], 'User management - List users')
    .description('Gets list of users');

//Adding new user
r.post('/users', (req, res) =>
{
    const result = userSchema.validate(req.body);
    if (result.error)
    {
        res.throw(400, result.error);
    }

    //check if user exists
    const user = query`
    FOR user in users
    FILTER user.username==${req.body.username}
    RETURN user
    `.toArray();

    if (user.length > 0)
    {
        res.throw(409, 'Already exists');
    }

    //create new user in collection
    const meta = collectionUsers.save(req.body);
    res.send({result: meta});
})
    .body(userSchema)
    .response(['application/json'], 'User management - Add user')
    .description('Adds new user');
