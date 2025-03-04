const { app } = require("../app");
const Expense = require("../models/Expense");
const { seed_db, testUserPassword } = require("../utils/seed_db");
const get_chai = require("../utils/get_chai");

describe("Expense CRUD operations", function () {
    before(async function () {
        this.timeout(20000); 
    
        const { expect, request } = await get_chai();
        this.test_user = await seed_db();
    
        let res = await request.execute(app).get("/sessions/logon").send();
        const textNoLineEnd = res.text.replaceAll("\n", "");
        this.csrfToken = /_csrf\" value=\"(.*?)\"/.exec(textNoLineEnd)[1];
    
        let cookies = res.headers["set-cookie"];
        this.csrfCookie = cookies.find((element) => element.startsWith("csrfToken"));
    
        const dataToPost = {
          email: this.test_user.email,
          password: testUserPassword,
          _csrf: this.csrfToken,
        };
    
        res = await request
          .execute(app)
          .post("/sessions/logon")
          .set("Cookie", this.csrfCookie)
          .set("content-type", "application/x-www-form-urlencoded")
          .redirects(0)
          .send(dataToPost);
    
        cookies = res.headers["set-cookie"];
        this.sessionCookie = cookies.find((element) => element.startsWith("connect.sid"));
    
        expect(this.csrfToken).to.not.be.undefined;
        expect(this.sessionCookie).to.not.be.undefined;
        expect(this.csrfCookie).to.not.be.undefined;
    });
    

  it("should get the expenses list", async () => {
    const { expect, request } = await get_chai();
    const res = await request(app)
      .get("/expenses")
      .set("Cookie", this.csrfCookie + "; " + this.sessionCookie);

    expect(res).to.have.status(200);
    
    
    const pageParts = res.text.split("<tr>");
    expect(pageParts.length).to.equal(21); 
  });

  it("should add a new expense", async () => {
    const { expect, request } = await get_chai();
    const newExpense = {
      amount: 50,
      category: "Groceries",
      description: "Bought vegetables",
      _csrf: this.csrfToken,
    };

    const res = await request(app)
      .post("/expenses")
      .set("Cookie", this.csrfCookie + "; " + this.sessionCookie)
      .set("content-type", "application/x-www-form-urlencoded")
      .send(newExpense);

    expect(res).to.have.status(302);
    expect(res.headers.location).to.equal("/expenses");

    
    const expenses = await Expense.find({ user: this.test_user._id });
    expect(expenses.length).to.equal(21);
  });
});
