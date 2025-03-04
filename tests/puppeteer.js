const puppeteer = require("puppeteer");
require("../app"); 
const { seed_db, testUserPassword } = require("../utils/seed_db");
const Expense = require("../models/Expense");

let testUser = null;
let page = null;
let browser = null;

describe("Expense Tracker Puppeteer Test", function () {
  before(async function () {
    this.timeout(20000);
    
    browser = await puppeteer.launch({ headless: false, slowMo: 100 }); 
    page = await browser.newPage();
    await page.goto("http://localhost:3002");
  });

  after(async function () {
    this.timeout(5000);
    await browser.close();
  });

  describe("Open site", function () {
    it("should open the main page", async function () {
      await page.waitForSelector("h1"); 
    });
  });

  describe("Index page test", function () {
    this.timeout(10000);
    
    it("finds the logon link", async () => {
      this.logonLink = await page.waitForSelector('a[href="/sessions/logon"]');
    });

    it("navigates to the logon page", async () => {
      await this.logonLink.click();
      await page.waitForNavigation();
      await page.waitForSelector('input[name="email"]');
    });
  });

  describe("Login page test", function () {
    this.timeout(20000);
    
    it("fills in and submits the login form", async () => {
      this.email = await page.waitForSelector('input[name="email"]');
      this.password = await page.waitForSelector('input[name="password"]');
      this.submit = await page.waitForSelector('button[type="submit"]');

      testUser = await seed_db();
      
      await this.email.type(testUser.email);
      await this.password.type(testUserPassword);
      await this.submit.click();
      await page.waitForNavigation();

      await page.waitForSelector(`h1 ::-p-text(Welcome back, ${testUser.name}!)`);
      await page.waitForSelector('a[href="/expenses"]');
    });
  });

  describe("Expense Operations", function () {
    this.timeout(20000);

    it("should navigate to the expenses list and check 20 entries", async () => {
      const expenseListLink = await page.waitForSelector('a[href="/expenses"]');
      await expenseListLink.click();
      await page.waitForNavigation();

      const pageContent = await page.content();
      const expenseEntries = pageContent.split("<tr>").length - 1; 
      expect(expenseEntries).to.equal(20);
    });

    it("should navigate to add expense form", async () => {
      const addExpenseButton = await page.waitForSelector('a[href="/expenses/new"]');
      await addExpenseButton.click();
      await page.waitForNavigation();

      
      const amountField = await page.waitForSelector('input[name="amount"]');
      const categoryField = await page.waitForSelector('input[name="category"]');
      const descriptionField = await page.waitForSelector('textarea[name="description"]');
      const submitButton = await page.waitForSelector('button[type="submit"]');

      expect(amountField).to.not.be.null;
      expect(categoryField).to.not.be.null;
      expect(descriptionField).to.not.be.null;
      expect(submitButton).to.not.be.null;
    });

    it("should add a new expense and verify", async () => {
      const amountField = await page.waitForSelector('input[name="amount"]');
      const categoryField = await page.waitForSelector('input[name="category"]');
      const descriptionField = await page.waitForSelector('textarea[name="description"]');
      const submitButton = await page.waitForSelector('button[type="submit"]');

      await amountField.type("75");
      await categoryField.type("Transport");
      await descriptionField.type("Taxi ride");

      await submitButton.click();
      await page.waitForNavigation();

      
      const pageContent = await page.content();
      expect(pageContent).to.include("Expense added successfully");

      
      const latestExpense = await Expense.findOne({ user: testUser._id }).sort({ createdAt: -1 });
      expect(latestExpense.amount).to.equal(75);
      expect(latestExpense.category).to.equal("Transport");
      expect(latestExpense.description).to.equal("Taxi ride");
    });
  });
});
