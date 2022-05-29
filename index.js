const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k2t5c.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect()
        const productCollection = client.db("eCarManufacturer").collection("manufacturer");
        const userCollection = client.db('eCarManufacturer').collection('infos');

        //function for jwt
        function verifyJWT(req, res, next) {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).send({ message: 'UnAuthorized access' });
            }
            const token = authHeader.split(' ')[1];
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
                if (err) {
                    return res.status(403).send({ message: 'Forbidden access' })
                }
                req.decoded = decoded;
                next();
            });
            app.get('/product', async (req, res) => {
                const query = {};
                const cursor = productCollection.find(query);
                const products = await cursor.toArray();
                res.send(products);
            })
            app.get('/product/:id', async (req, res) => {
                const id = req.params.id;
                const query = { _id: ObjectId(id) };
                const product = await productCollection.findOne(query);
                res.send(product);
            })
            // Add New Items 
            app.post('/addmyitem', async (req, res) => {
                const newitem = req.body;
                const result = await productCollection.insertOne(newitem);
                res.send(result);
            });
            // Delete products 
            app.delete('/product/:id', async (req, res) => {
                const id = req.params.id;
                const query = { _id: ObjectId(id) };
                const product = await productCollection.deleteOne(query);
                res.send(product)
            });

        }




    }
    finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('running eCarManufacturer Manufacturer server');
});

app.listen(port, () => {
    console.log('eCarManufacturer Manufacturer listening on port', port);
});
