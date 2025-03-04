const Expense = require("../models/Expense");
const User = require("../models/User");
const { faker } = require("@faker-js/faker");
const FactoryBot = require("factory-bot");
const dotenv = require("dotenv");

dotenv.config();

const testUserPassword = faker.internet.password();
const factory = FactoryBot.factory;
const factoryAdapter = new FactoryBot.MongooseAdapter();
factory.setAdapter(factoryAdapter);

factory.define("expense", Expense, {
  amount: () => faker.number.float({ min: 5, max: 500, precision: 0.01 }),
  category: () => faker.commerce.department(),
  description: () => faker.commerce.productDescription(),
});

factory.define("user", User, {
  name: () => faker.person.fullName(),
  email: () => faker.internet.email(),
  password: () => faker.internet.password(),
});

const seed_db = async () => {
  let testUser = null;
  try {
    const mongoURL = process.env.MONGO_URI_TEST;
    await Expense.deleteMany({}); 
    await User.deleteMany({}); 

    testUser = await factory.create("user", { password: testUserPassword });

    await factory.createMany("expense", 20, { user: testUser._id });
  } catch (e) {
    console.log("Database error");
    console.log(e.message);
    throw e;
  }
  return testUser;
};

module.exports = { testUserPassword, factory, seed_db };
