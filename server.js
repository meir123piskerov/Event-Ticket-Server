import express from "express";
import getUserRoute from "./routes/usersRoutes.js";
import getEventRoute from "./routes/eventRoute.js";
const app = express();
const port = 3004;

app.use(express.json());

app.use("/user", getUserRoute);
app.use("/creator/events", getEventRoute);

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
