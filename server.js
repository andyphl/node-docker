const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const cors = require("cors");
const redis = require("redis");

const { MONGO_USER, MONGO_PWD, MONGO_IP, MONGO_PORT, REDIS_URL, REDIS_PORT, SESSION_SECRET } = require("./config/config");

let RedisStore = require("connect-redis")(session);
let redisClient = redis.createClient({
    host: REDIS_URL,
    port: REDIS_PORT
});


const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PWD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

const connectWithRetry = (function retry() {
    mongoose
    .connect(mongoURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        bufferMaxEntries: 0
        // those settings is deprecating with use unified topology
        // reconnectInterval: 5000,    // Reconnect every 5s
        // connectTimeoutMS: 10000,    // Give up connection after 10s
        // reconnectTries: Number.MAX_VALUE    // Always try to reconnect
    })
    .then(() => console.log("Successfully connected to MongoDB"))
    .catch(error => {
        console.log(error);
        setTimeout(retry, 5000);
    });
})();

app.enable("trust proxy");
app.use(cors({}));
app.use(session({
    store: new RedisStore({client: redisClient}),
    secret: SESSION_SECRET,
    cookie: {
        secure: false,
        resave: false,
        saveUninitialized: false,
        httpOnly: true,
        maxAge: 30000
    }
}));

app.get("/api/v1", (req, res, next) => {
    res.send("<h1>Hello!</h1>");
    console.log("This ran");
});

app.use("/api/v1/posts", postRouter);

app.use("/api/v1/users", userRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}...`);
})