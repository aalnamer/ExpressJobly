"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db.js");
const Job = require("../models/jobs");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("create", function () {
  let newJob = {
    companyHandle: "c1",
    title: "Test",
    salary: 100,
    equity: "0.1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      ...newJob,
      id: expect.any(Number),
    });
  });
});

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        title: "Job1",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
      },
      {
        title: "Job2",
        salary: 200,
        equity: "0.2",
        companyHandle: "c1",
      },
      {
        title: "Job3",
        salary: 300,
        equity: "0",
        companyHandle: "c1",
      },
      {
        title: "Job4",
        salary: null,
        equity: null,
        companyHandle: "c1",
      },
    ]);
  });

  test("get by title & equity", async function () {
    let title = "Job2";
    let jobs = await Job.getByTitleWithEquity(title);
    expect(jobs).toEqual([
      {
        title: "Job2",
        salary: 200,
        equity: "0.2",
        companyHandle: "c1",
      },
    ]);
  });
  test("get by salary & Equity", async function () {
    let minSalary = 150;
    let jobs = await Job.getBySalaryEquity(minSalary);
    expect(jobs).toEqual({
      title: "Job2",
      salary: 200,
      equity: "0.2",
      companyHandle: "c1",
    });
  });
  test("get by title salary Equity", async function () {
    let minSalary = 150;
    let title = "Job2";
    let jobs = await Job.getByTitleSalaryEquity(title, minSalary);
    expect(jobs).toEqual([
      {
        title: "Job2",
        salary: 200,
        equity: "0.2",
        companyHandle: "c1",
      },
    ]);
  });
});

describe("remove", function () {
  test("works", async function () {
    await Job.remove(testJobIds[0]);
    const res = await db.query("SELECT id FROM jobs WHERE id=$1", [
      testJobIds[0],
    ]);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
