/* eslint-disable no-undef */
const request = require("supertest");
const cheerio = require("cheerio");

const db = require("../models/index");
const app = require("../app");

let server, agent;

function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

const login = async () => {
  await agent
    .post("/session")
    .send({ email: "test@user.com", password: "12345678" });
};

describe("first", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(6000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });

  test("should first", () => {
    expect(1).toBe(1);
  });

  test("login required", async () => {
    const res = await agent.get("/home");
    expect(res.statusCode).toBe(302);
  });

  test("admin authentication page works", async () => {
    const res = await agent.get("/signup");
    expect(res.statusCode).toBe(200);
    const login = await agent.get("/login");
    expect(login.statusCode).toBe(200);
  });

  test("signup admin", async () => {
    const signupPage = await agent.get("/signup");
    const token = extractCsrfToken(signupPage);
    const res = await agent.post("/users").send({
      name: "admin",
      email: "test@user.com",
      password: "12345678",
      _csrf: token,
    });
    expect(res.statusCode).toBe(302);
  });

  test("create election", async () => {
    let count, newCount;
    const addElection = await agent.get("/elections/new");
    const token = extractCsrfToken(addElection);
    const response = await agent.get("/election");
    count = response.body.elections.length;

    await agent.post("/election").send({
      name: "test election",
      _csrf: token,
    });

    await agent.get("/election").then((data) => {
      newCount = data.body.elections.length;
    });
    expect(newCount).toBe(count + 1);
  });

  test("delete election", async () => {
    let count;
    const response = await agent.get("/election");
    count = response.body.elections.length;

    const electionID = response.body.elections[count - 1].id;

    const electionPage = await agent.get(`/election/${electionID}`);
    const token = extractCsrfToken(electionPage);
    const res = await agent.delete(`/election/${electionID}`).send({
      _csrf: token,
    });

    expect(res.ok).toBe(true);
  });

  test("edit election", async () => {
    const res = await agent.get("/elections/new");
    const token = extractCsrfToken(res);
    await agent.post("/election").send({
      name: "update election",
      _csrf: token,
    });
    let count;
    let response = await agent.get("/election");
    count = response.body.elections.length;

    const electionID = response.body.elections[count - 1].id;

    const electionPage = await agent.get(`/election/${electionID}`);
    const newToken = extractCsrfToken(electionPage);
    await agent
      .post(`/election/${electionID}`)
      .send({ name: "New Name", _csrf: newToken });

    response = await agent.get("/election");
    expect(response.body.elections[count - 1].name).toBe("New Name");
  });

  test("signout admin", async () => {
    login();
    await agent.get("/signout");
    const res = await agent.get("/home");
    expect(res.statusCode).toBe(302);
  });
});
