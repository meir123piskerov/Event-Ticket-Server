import fs from "fs";
import express from "express";
import userMiddleWare from "../middleware/checkUser.js";

const getUserRoute = express();

getUserRoute.get("/:username/summary", async (req, res) => {
  const { username } = req.params;
  const receiptsData = JSON.parse(
    await fs.promises.readFile("./data/receipts.json", "utf-8")
  );

  const userReceipts = [];

  for (let i = 0; i < receiptsData.length; i++) {
    console.log(receiptsData[i].username, username);

    if (receiptsData[i].username === username) {
      userReceipts.push(receiptsData[i]);
    }
  }

  if (userReceipts.length > 0) {
    let userSummary = {
      totalTicketsBought: 0,
      events: [],
      averageTicketsPerEvent: 0,
    };
    for (let i = 0; i < userReceipts.length; i++) {
      userSummary.totalTicketsBought += userReceipts[i].ticketsBought;
      userSummary.events.push(userReceipts[i].eventName);
    }
    const average = userSummary.totalTicketsBought / userSummary.events.length;
    userSummary.averageTicketsPerEvent = average;
    return res.send(userSummary);
  } else {
    return res.status(404).send("0 receipts for that user name");
  }
});

getUserRoute.post("/register", userMiddleWare, async (req, res) => {
  const user = req.body;
  const addUser = Object.keys(user);
  if (
    addUser[0] === "username" &&
    addUser[1] === "password" &&
    addUser.length === 2
  ) {
    const data = JSON.parse(
      await fs.promises.readFile("./data/users.json", "utf-8")
    );
    const value = Object.values(user);

    for (let i = 0; i < data.length; i++) {
      console.log(data[i].username, value[0]);
      if (data[i].username === value[0]) {
        return res.json({ massage: "user already exist" });
      }
    }
    data.push(user);
    await fs.promises.writeFile(
      "./data/users.json",
      JSON.stringify(data, null, 2)
    );
    return res.json({
      message: "User registered successfully",
    });
  }
  res.status(404).send("user or password missing");
});

getUserRoute.post("/tickets/buy", userMiddleWare, async (req, res) => {
  const ticket = req.body;
  const addTicket = Object.keys(ticket);
  if (
    addTicket[0] === "username" &&
    addTicket[1] === "password" &&
    addTicket[2] === "eventName" &&
    addTicket[3] === "quantity" &&
    addTicket.length === 4
  ) {
    const eventData = JSON.parse(
      await fs.promises.readFile("./data/events.json", "utf-8")
    );
    const ticketValue = Object.values(ticket);

    for (let i = 0; i < eventData.length; i++) {
      if (eventData[i].eventName === ticketValue[2]) {
        if (eventData[i].ticketsAvailable > 0) {
          const usersData = JSON.parse(
            await fs.promises.readFile("./data/users.json", "utf-8")
          );
          const value = Object.values(ticket);
          for (let i = 0; i < usersData.length; i++) {
            if (
              usersData[i].username === value[0] &&
              usersData[i].password === value[1]
            ) {
              const receiptsData = JSON.parse(
                await fs.promises.readFile("./data/receipts.json", "utf-8")
              );
              const ticketSummary = {
                username: value[0],
                eventName: value[2],
                ticketsBought: value[3],
              };
              receiptsData.push(ticketSummary);
              await fs.promises.writeFile(
                "./data/receipts.json",
                JSON.stringify(receiptsData, null, 2)
              );
              eventData[i].ticketsAvailable -= Number(value[3]);
              await fs.promises.writeFile(
                "./data/events.json",
                JSON.stringify(eventData, null, 2)
              );
              return res.send("Tickets purchased successfully");
            } else {
              return res.status(404).send("not enough tickets");
            }
          }
        }
        return res.json({
          message: " not enough tickets",
        });
      }
    }
    res.status(404).send("not such event");
  }
  res.status(404).send("invalid input");
});

export default getUserRoute;
