const createRouter = require('@arangodb/foxx/router');
const {db, query, time} = require('@arangodb');
const joi = require('joi');
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

    const skip = req.queryParams.skip
                 ? Number(req.queryParams.skip)
                 : 0;
    const dataset = query`
        LET skip=${skip}
        LET pageSize=${req.queryParams.pageSize
                       ? Number(req.queryParams.pageSize)
                       : 25}
        let ds = (FOR doc in users
            LIMIT skip,pageSize
            RETURN UNSET(doc, "_id","_rev")
        )
        RETURN {
            result: ds, 
            skip: skip,
            pageSize: pageSize,
            total: LENGTH(users)
            }
        `.toArray();

    res.send({
        ...dataset[0],
        execTime: time() - start
    });
})
    .response(['application/json'], 'User management - List users')
    .description('Gets list of users');

r.get('/users/:id', (req, res) =>
{
    const start = time();

    const dataset = query`
    RETURN UNSET(DOCUMENT(users, ${req.pathParams.id}),"_id","_rev", "password")
    `.toArray();

    res.send({
        result: dataset.length > 0
                ? dataset[0]
                : null, execTime: time() - start
    });
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
