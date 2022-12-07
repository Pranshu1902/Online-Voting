/* eslint-disable no-undef */
const express = require("express");
const app = express();
const path = require("path");
const admin = require("./models/admin");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (request, response) => {
  response.send("hello world");
});

// create new admin user
app.post("/signup", async (request, response) => {
  const res = await admin.createAdmin(
    request.body.name,
    request.body.email,
    request.body.password
  );
  return response.send(res);
});

app.get("/signup", (request, response) => {
  return response.render("signup");
});

app.get("/login", (request, response) => {
  return response.render("login");
});

module.exports = app;
