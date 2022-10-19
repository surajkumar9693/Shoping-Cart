//=====================Importing Module and Packages=====================//
const express = require('express');
const { default: mongoose } = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const route = require('./routes/route.js');
const app = express();


app.use(bodyParser.json())
app.use(multer().any());



mongoose.connect("mongodb+srv://bittushri8224:lyNrXnwy17jk4lFa@cluster0.ii3dqef.mongodb.net/group53Database", {
    useNewUrlParser: true
})
    .then(() => console.log("MongoDb is Connected."))
    .catch(error => console.log(error))


app.use('/', route)



app.listen(3000, function () {
    console.log('Express App Running on Port: ' + (3000))
});

