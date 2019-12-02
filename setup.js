const {db} = require('@arangodb');

if (!db._collection('users'))
{
    // This won't be run if the collection exists
    const collection = db._createDocumentCollection('users');
    collection.ensureIndex({
        type: 'hash',
        unique: true,
        fields: ['username']
    });
}
