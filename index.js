const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000
// online-learning-platform
// WIFpWLMnAcBkRRIc

app.use(cors())
app.use(express.json())



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.xemmjwp.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)

    const courseCollection = client.db('online-learning-platform').collection('courses')
    const discussionCollection = client.db('online-learning-platform').collection('discussion')
    const usersCollection = client.db('online-learning-platform').collection('users')

    app.get('/courses', async(req,res)=>{
        const result = await courseCollection.find().toArray()
        res.send(result);
    })

    app.get('/courses/:id', async(req, res)=>{
        const id = req.params.id;
        const query ={_id: new ObjectId(id)}
        const result = await courseCollection.findOne(query)
        res.send(result)
    })

    app.post('/collaboration', async(req, res)=>{
        const comment = req.body;
        const discussion = await discussionCollection.insertOne(comment)
        res.send(discussion)
    })
    app.get('/collaboration', async(req, res)=>{
        const comment = await discussionCollection.find().toArray()
        res.send(comment)
    })
    app.post('/users', async(req, res)=>{
        const users = req.body
        const result = await usersCollection.insertOne(users)
        res.send(result)
    })



    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('online-learning-platform-server')
  })
  
  app.listen(port, () => {
    console.log(`online-learning-platform-server ${port}`)
  })