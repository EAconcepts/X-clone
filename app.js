require("dotenv").config();
const express = require("express");
const colors = require("colors");
const connectDB = require("./config/db");
const cors = require('cors');
const errorHandler = require("./middleware/errorMiddleware");


const app = express();
connectDB();
app.use(express.json());
app.use(cors())
app.use(errorHandler)
app.use(express.urlencoded({extended:false}))
console.log(process.env.PORT);
const port = process.env.PORT || 7000;

app.use("/api/auth", require("./routes/userRoutes"));
app.use("/api/post", require("./routes/postRoutes"));
app.use("/api/comment", require("./routes/commentRoutes"));
app.use('/api/notification', require('./routes/notificationRoutes'))
app.use('/api/profile', require('./routes/profileRoute'))
app.use('/api/file', require('./routes/fileRoute'))

app.listen(port, () => console.log(`server running on port ${port}`));
