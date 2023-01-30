const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
app.use(express.json());
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = 5010;

app.get('/',(req, res)=>{
    res.send("Welcome to Power Hack")
})



const uri = "mongodb+srv://powerHack:V29ZibIlVG3K7LfQ@cluster0.o5lz3b5.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {

    const userCollection = client.db('powerHack').collection("users")
    const billingCollection = client.db('powerHack').collection("billingList")


    try {
      app.post('/register', async (req, res) => {
        try {
          const { name, email, password } = req.body;
          const hashedPassword = await bcrypt.hash(password, 10);
          const user = { name, email, password: hashedPassword };
          userCollection.insertOne(user);
          res.status(201).send();
        } catch (err) {
          res.status(500).send(err);
        }
      });


      app.post('/login', async (req, res) => {
        try {
          const { email, password } = req.body;
          const user = await userCollection.findOne({ email });
          if (!user) {
            return res.status(404).send('User not found');
          }
          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
            return res.status(401).send('Invalid password');
          }
          const token = jwt.sign({ userId: user._id }, 'secretkey');
          res.send({ token });
        } catch (err) {
          res.status(500).send(err);
        }});

        app.post('/add-billing', (req, res) => {
            const item = req.body; 
            billingCollection.insertOne(item, (err, result) => {
              if(err) throw err;
              client.close();
              res.status(201).send({ message: 'Item inserted successfully' });
            });
          });

          app.get('/billing-list', (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            billingCollection.find({}).skip(skip).limit(limit).toArray((err, items) => {
              if(err) throw err;
              client.close();
              res.status(200).send({ items });
            });
          });

          app.put('/update-billing/:id', (req, res) => {
            const item = req.body; 
            const id = req.params.id; 
            billingCollection.updateOne({ _id: ObjectID(id) }, { $set: item }, (err, result) => {
              if(err) throw err;
              client.close();
              res.status(200).send({ message: 'Item updated successfully' });
            });
          });

        app.delete('/delete-billing/:id', (req, res) => {
            const id = req.params.id;
            billingCollection.deleteOne({_id: id}, (err, result) => {
              if(err) throw err;
              client.close();
              res.status(200).send({ message: `Item with ID ${id} deleted successfully` });
            });
          });


    } finally {
      
    }
  }

run().catch({});


app.listen(port, ()=>{
    console.log(`Power Hack is running on ${port}`);
})