const express = require("express");
const mongoose = require("mongoose");
const session = require('express-session');
const user_route = require("./routes/userRoute");

require('dotenv').config();

const app = express();
app.use(session({
    secret: 'session_secret_key', // Change this to a random secret key
    resave: false,
    saveUninitialized: false
}));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/nodecrud', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected');
}).catch((error) => {
    console.error('MongoDB connection error:', error);
});

app.use('/api', user_route);

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
