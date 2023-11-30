const express = require('express');
const dotenv = require('dotenv');
const AuthRouter = require('./routes/AuthRouter');
const UserRouter = require('./routes/UserRoutes');
const cors = require('cors');
const path = require("path");
const cookieParser = require('cookie-parser');
const PostsRouter = require('./routes/PostsRouter');

const mongoose = require('mongoose');
dotenv.config();
const app = express();
app.use(cors({
    origin: ['http://localhost:5173', 'https://tour-front-chi.vercel.app'],
    credentials: true,
}));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.use(cookieParser());

const PORT = process.env.PORT || 8080




app.get('/', (req, res) => {
    res.send('<h1>Hello from instagram server<h1>');
})

app.use('/api/auth', AuthRouter);

app.use('/api/user', UserRouter);

app.use('/api/post', PostsRouter)



mongoose.connect(process.env.MONGO_DB).then(() => {
    console.log("Connected to Database");
});


app.listen(process.env.PORT, () => {

    console.log("Server started on port ", PORT);

}); 