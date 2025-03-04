const multiply = require("../utils/multiply");
const get_chai = require("../utils/get_chai");

describe("testing multiply", () => {
  it("should give 7 * 6 = 42", async () => {
    const { expect } = await get_chai();
    expect(multiply(7, 6)).to.equal(42);
  });

  it("should give 3 * 5 = 15", async () => {
    const { expect } = await get_chai();
    expect(multiply(3, 5)).to.equal(15);
  });

  it("should give -4 * 8 = -32", async () => {
    const { expect } = await get_chai();
    expect(multiply(-4, 8)).to.equal(-32);
  });

  it("should give 0 * 10 = 0", async () => {
    const { expect } = await get_chai();
    expect(multiply(0, 10)).to.equal(0);
  });
});
