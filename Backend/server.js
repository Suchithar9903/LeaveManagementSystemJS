const express = require("express");
const connectDB = require("./config/db.js");
const userRoutes = require("./routes/userRoutes.js");
const leaveRoutes = require("./routes/LeaveRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js")
const notificationRoutes = require("./routes/notificationRoutes.js");
const managerRoutes = require("./routes/managerRoutes.js");
const dotenv = require("dotenv");
const cors = require("cors"); 
require('dotenv').config();
dotenv.config();

const app = express();

connectDB();

app.use(express.json());
app.use(cors())

app.use("/api/users", userRoutes);
app.use("/api/leaves", leaveRoutes);
app.use('/api/admins', adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/leaves", managerRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to Leave Mnangement System API");
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});