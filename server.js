const express = require('express');
const dotenv = require('dotenv');
const AuthRouter = require('./routes/AuthRouter');
const mongoose = require('mongoose');
dotenv.config();


const app = express();

app.use(express.json());

const PORT = process.env.PORT || 8080




app.get('/', (req, res) => {
    res.send('<h1>Hello from instagram server<h1>');
})

app.use('/api/auth/', AuthRouter);



mongoose.connect(process.env.MONGO_DB).then(() => {
    console.log("Connected to Database");
});


app.listen(process.env.PORT, () => {

    console.log("Server started on port ", PORT);

}); 