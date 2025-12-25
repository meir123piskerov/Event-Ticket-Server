import fs from "fs";
import express from "express";
import userMiddleWare from "../middleware/checkUser.js";
const getEventRoute = express();

getEventRoute.post("/", userMiddleWare, async (req, res) => {
  const event = req.body;
  const addEvent = Object.keys(event);
  console.log(addEvent);

  if (
    addEvent[0] === "eventName" &&
    addEvent[1] === "ticketsForSale" &&
    addEvent[2] === "username" &&
    addEvent[3] === "password" &&
    addEvent.length === 4
  ) {
    const eventsData = JSON.parse(
      await fs.promises.readFile("./data/events.json", "utf-8")
    );
    const value = Object.values(event);
    const userData = JSON.parse(
      await fs.promises.readFile("./data/users.json", "utf-8")
    );
    for (let i = 0; i < userData.length; i++) {
      if (
        userData[i].username === value[2] &&
        userData[i].password === value[3]
      ) {
        const eventSummary = {
          eventName: value[0],
          ticketsAvailable: value[1],
          createdBy: value[2],
        };
        eventsData.push(eventSummary);
        await fs.promises.writeFile(
          "./data/events.json",
          JSON.stringify(eventsData, null, 2)
        );
        return res.json({
          message: "Event created successfully",
        });
      }
    }
  }
  res.status(404).send("invalid input");
});
export default getEventRoute;
