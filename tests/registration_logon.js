const { app } = require("../app");
const { factory, seed_db } = require("../utils/seed_db");
const faker = require("@faker-js/faker").fakerEN_US;
const get_chai = require("../utils/get_chai");

const User = require("../models/User");

describe("tests for registration and logon", function () {
    it("should get the registration page", async () => {
        const { expect, request } = await get_chai();
        const res = await request.execute(app).get("/sessions/register");
    
        expect(res).to.have.status(200);
        expect(res).to.have.property("text");
        expect(res.text).to.include("Please provide name"); 
    
        const csrfTokenMatch = /_csrf" value="(.*?)"/.exec(res.text);
        expect(csrfTokenMatch).to.not.be.null;
        this.csrfToken = csrfTokenMatch[1];
    
        expect(res).to.have.property("headers");
        expect(res.headers).to.have.property("set-cookie");
        this.csrfCookie = res.headers["set-cookie"].find((cookie) =>
          cookie.startsWith("csrfToken")
        );
        expect(this.csrfCookie).to.not.be.undefined;
    });

  it("should register the user", async () => {
    const { expect, request } = await get_chai();

    
    this.password = faker.internet.password();
    this.user = await factory.build("user", { password: this.password });

    const dataToPost = {
      name: this.user.name,
      email: this.user.email,
      password: this.password,
      password1: this.password, 
      _csrf: this.csrfToken, 
    };

    const res = await request.execute(app)
      .post("/sessions/register")
      .set("Cookie", this.csrfCookie) 
      .set("content-type", "application/x-www-form-urlencoded") 
      .send(dataToPost);

    expect(res).to.have.status(200);
    expect(res).to.have.property("text");
    expect(res.text).to.include("All Expenses"); 

    
    const newUser = await User.findOne({ email: this.user.email });
    expect(newUser).to.not.be.null;
  });

  it("should log the user on", async () => {
    const dataToPost = {
      email: this.user.email,
      password: this.password,
      _csrf: this.csrfToken,
    };
    const { expect, request } = await get_chai();
    const res = await request.execute(app)
      .post("/sessions/logon")
      .set("Cookie", this.csrfCookie)
      .set("content-type", "application/x-www-form-urlencoded")
      .redirects(0) 
      .send(dataToPost);

    expect(res).to.have.status(302);
    expect(res.headers.location).to.equal("/");

    
    const cookies = res.headers["set-cookie"];
    this.sessionCookie = cookies.find((element) =>
      element.startsWith("connect.sid")
    );
    expect(this.sessionCookie).to.not.be.undefined;
  });

  it("should get the index page and show user name", async () => {
    const { expect, request } = await get_chai();
    const res = await request.execute(app)
      .get("/")
      .set("Cookie", this.csrfCookie)
      .set("Cookie", this.sessionCookie) 
      .send();

    expect(res).to.have.status(200);
    expect(res).to.have.property("text");
    expect(res.text).to.include(this.user.name); 
  });

  it("should log the user off", async () => {
    const { expect, request } = await get_chai();
    const res = await request.execute(app)
      .post("/sessions/logoff")
      .set("Cookie", `${this.csrfCookie}; ${this.sessionCookie}`) 
      .set("content-type", "application/x-www-form-urlencoded")
      .send({ _csrf: this.csrfToken }); 

    expect(res).to.have.status(302);
    expect(res.headers.location).to.equal("/");

    
    const resAfterLogoff = await request(app)
      .get("/")
       this.csrfC.set("Cookie",ookie) 
      .send();

    expect(resAfterLogoff).to.have.status(200);
    expect(resAfterLogoff).to.have.property("text");
    expect(resAfterLogoff.text).to.not.include(this.user.name); 
  });
});
