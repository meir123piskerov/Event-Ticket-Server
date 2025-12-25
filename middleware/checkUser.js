import fs from "fs";
export default async function userMiddleWare(req, res, next) {
  const username = req.header("username");
  const password = req.header("password");

  const users = JSON.parse(
    await fs.promises.readFile("./data/users.json", "utf8")
  );

  const userFound = users.find(
    (userObj) => userObj.username === username && userObj.password === password
  );

  if (!userFound) {
    return res.status(400).json({
      error: "you do not have permission",
    });
  }

  next();
}
