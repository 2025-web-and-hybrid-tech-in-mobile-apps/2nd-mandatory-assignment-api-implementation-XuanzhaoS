const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { ExtractJwt } = require("passport-jwt");
const JwtStrategy = require("passport-jwt").Strategy;
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // for parsing application/json

// ------ WRITE YOUR SOLUTION HERE BELOW ------//
const users = [];
const highScores = [];
const secretKey = "secret";

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secretKey,
};

passport.use(
  new JwtStrategy(opts, function (jwt_payload, done) {
    const userHandle = jwt_payload.userHandle;

    if (!userHandle) {
      return done(null, false);
    }

    return done(null, userHandle);
  })
);

app.post("/signup", (req, res) => {
  const { userHandle, password } = req.body;

  if (
    !userHandle ||
    !password ||
    userHandle.length < 6 ||
    password.length < 6
  ) {
    return res
      .status(400)
      .json({ message: "Unauthorized, incorrect username or password" });
  }

  users.push({ userHandle, password });

  res.status(201).json("User registered successfully");
});

app.post("/login", (req, res) => {
  const { userHandle, password } = req.body;

  if (!userHandle || !password) {
    return res.status(400).json({ message: "Bad Request" });
  }

  const requestBodyKeys = Object.keys(req.body);
  if (requestBodyKeys.length > 2) {
    return res.status(400).json({
      message: "Bad Request",
    });
  }

  if (typeof userHandle !== "string" || typeof password != "string") {
    return res.status(400).json({
      message: "Bad Request",
    });
  }

  const user = users.find((user) => userHandle == user.userHandle);

  if (!user || user.password != password) {
    return res.status(401).json({
      message: "Unauthorized, incorrect username or password",
    });
  }

  const token = jwt.sign({ userHandle: userHandle }, secretKey);
  return res.status(200).json({
    // message: "Login successful, JWT token provided",
    jsonWebToken: token,
  });
});

app.get("/login", (req, res) => {
  res.status(404).json({
    message: "Bad Request",
  });

  console.log("Server is running");
});

app.post(
  "/high-scores",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { level, userHandle, score, timestamp } = req.body;

    if (!level || !userHandle || score == undefined || !timestamp) {
      return res.status(400).json({
        message: "Invalid request body",
      });
    }

    highScores.push({ level, userHandle, score, timestamp });

    res.status(201).json({ message: "High score posted successfully" });
  }
);

app.get("/high-scores", (req, res) => {
  const { level, page } = req.query;

  const pageNumber = parseInt(page) || 1;
  const pageSize = 20;
  const startIndex = (pageNumber - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const filteredScores = highScores.filter((score) => score.level == level);

  filteredScores.sort((a, b) => b.score - a.score);

  const paginatedScores = filteredScores.slice(startIndex, endIndex);

  res.status(200).json(paginatedScores);
});

// ------ WRITE YOUR SOLUTION ABOVE THIS LINE ------//

let serverInstance = null;
module.exports = {
  start: function () {
    serverInstance = app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  },
  close: function () {
    serverInstance.close();
  },
};
