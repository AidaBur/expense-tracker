const { app } = require("../app");
const get_chai = require("../utils/get_chai");

describe("test getting a page", function () {
  it("should get the index page", async () => {
    const { expect, request } = await get_chai();
    const res = await request(app).keepOpen().get("/");

    expect(res).to.have.status(200);
    expect(res).to.have.property("text");
    expect(res.text).to.include("Start saving, start growing.");
  });
});
