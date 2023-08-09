require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {useNewUrlParser: true});


//function 
async function main() {
   try {
    await client.connect();
    console.log('connected to the database');

    const usersCollection = client.db('myapp').collection('users');
    const postsCollection = client.db('myapp').collection('posts');
    const commentsCollection = client.db('myapp').collection('comments');

    // create indexes
    await  postsCollection.createIndex({user_id: 1, created_at: -1});
    await commentsCollection.createIndex({post_id: 1, created_at: 1});

    // Insert into  data
    const userResult = await usersCollection.insertOne({
        name: 'Christy Amoako',
        email: 'christyamoako419@gmail.com'
    });

    const postResult = await postsCollection.insertOne({
       user_id: userResult.insertedId,
       content: 'Hello World!',
       created_at: new Date()
    });

    const commentResult = await commentsCollection.insertOne({
        post_id: postResult.insertedId,
        user_id: userResult.insertedId,
        content: 'Nice face',
        created_at: new Date()
    })

    console.log("Data inserted succefully!");

    //query data
    const postsWithComments = await postsCollection.aggregate([
        { $match: { user_id: userResult.insertedId } }, // Match specific user
        { $lookup: { from: 'comments', localField: '_id', foreignField: 'post_id', as: 'comments' } },
        { $sort: { created_at: -1 } }
      ]).toArray();
    
      console.log('Posts with comments:', postsWithComments);

   }catch(error){
    console.error('Error', error)
   }finally {
    client.close()
   }
}
main();