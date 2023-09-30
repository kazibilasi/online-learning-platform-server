const express = require('express');
const cors = require('cors');
require('dotenv').config()
const jwt = require("jsonwebtoken")
const app = express()
const port = process.env.PORT || 5000
// online-learning-platform
// WIFpWLMnAcBkRRIc

app.use(cors())
app.use(express.json())

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: ' unauthorized access' })
  }
  const token = authorization.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: true, message: ' unauthorized access' })
    }
    req.decoded = decoded
    next();
  })
}



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

    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
      res.send({ token })
    })

    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email

      const query = { email: email }
      const user = await usersCollection.findOne(query)
      if (user?.role !== 'admin') {
        return res.send({ admin: false })
      }
      next()
    }

    // const verifyInstructor = async (req, res, next) => {
    //   const email = req.decoded.email

    //   const query = {  : email }
    //   const user = await courseCollection.findOne(query)
    //   if (user?.role !== 'admin') {
    //     return res.send({ admin: false })
    //   }
    //   next()
    // }

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
    app.get('/users', async(req, res)=>{
        
        const result = await usersCollection.find().toArray()
        res.send(result)
    })
    app.post('/users', async (req, res) => {
      const users = req.body;
      const query = { email: users.email }
      const existingUser = await usersCollection.findOne(query)
      if (existingUser) {
        return res.send({ message: " user already exist" })
      }
      const result = await usersCollection.insertOne(users)
      res.send(result)
    })

    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updateDoc = {
        $set: {
          role: 'admin'
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc)
      res.send(result)
    })

    app.patch('/users/instructor/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updateDoc = {
        $set: {
          role: 'instructor'
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc)
      res.send(result)
    })

    app.get('/users/instructor/:email', verifyJWT, async (req, res) => {
      const email = req.params.email;
      if(req.decoded.email !== email){
        res.send({instructor:false})
      }

      const query = { email: email }
      const user = await usersCollection.findOne(query);
      const result = { instructor: user?.role === "instructor" }
      res.send(result);
    })


   

    app.get('/users/admin/:email', verifyJWT, verifyAdmin, async (req, res) => {
      const email = req.params.email;
      if (req.decoded.email !== email) {
        res.send({ admin: false })
      }
      const query = { email: email }
      const user = await usersCollection.findOne(query)

      const result = { admin: user?.role === 'admin' }

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