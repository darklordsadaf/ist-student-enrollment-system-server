const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6pkpq.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());

const port = 5000;

app.get('/', (req, res) => {
    res.send("hello from db it's working working")
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const studentCollection = client.db("istStudentEnrollmentSystem").collection("allStudent");
    const departmentCollection = client.db("istStudentEnrollmentSystem").collection("department");
    const adminCollection = client.db("istStudentEnrollmentSystem").collection("admin");
    const adminNameCollection = client.db("istStudentEnrollmentSystem").collection("adminName");
    app.post('/addStudent', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const roll = req.body.roll;
        const session = req.body.session;
        const email = req.body.email;
        const mobile = req.body.mobile;
        const department = req.body.department;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        studentCollection.insertOne({ name, roll, session, email, mobile, department, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })
    app.delete('/delete/:id', (req, res) => {
        console.log(req.params.id);
        studentCollection.deleteOne({ _id: ObjectId(req.params.id) })
            .then((result) => {
                res.send(result.deletedCount > 0);
            })
    })

    app.get('/students', (req, res) => {
        studentCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.get('/students/:department/:roll', (req, res) => {
        studentCollection.find({ roll: req.params.roll, department: req.params.department })
            .toArray((err, documents) => {
                res.send(documents[0]);
            })
    })

    app.post('/studentsByRoll', (req, res) => {
        const roll = req.body;
        studentCollection.find({ roll: roll.roll })
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/studentsByDept/:department', (req, res) => {
        const roll = req.params.department;
        studentCollection.find({ department: req.params.department })
            .toArray((err, documents) => {
                res.send(documents);
            })
    })


    app.post('/addDepartment', (req, res) => {
        const file = req.files.file;
        const department = req.body.department;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        departmentCollection.insertOne({ department, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/departments', (req, res) => {
        departmentCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/addAdmin', (req, res) => {
        const admin = req.body;
        adminCollection.insertOne(admin)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })
    app.post('/addAdminName', (req, res) => {
        const adminName = req.body;
        adminNameCollection.insertOne(adminName)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })
    app.post('/adminName', (req, res) => {
        const email = req.body.email;
        adminNameCollection.find({ email: email })
            .toArray((err, documents) => {
                res.send(documents);
            })
    })
    app.patch('/update/:id', (req, res) => {
        studentCollection.updateOne({ _id: ObjectId(req.params.id) },
            {
                $set: {
                    name: req.body.name, roll: req.body.roll, session
                        : req.body.session
                    , email: req.body.email, mobile: req.body.mobile, department: req.body.department
                },
            })
            .then(result => {
                res.send(result.matchedCount > 0);
            })
    })

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, admins) => {
                res.send(admins.length > 0);
            })
    })


});


app.listen(process.env.PORT || port)