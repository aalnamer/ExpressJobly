"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {
  static async create({ title, salary, equity, companyHandle }) {
    const result = await db.query(
      `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING title, salary, equity, company_handle AS "companyHandle"`,
      [title, salary, equity, companyHandle]
    );
    const job = result.rows[0];

    return job;
  }
  static async findAll() {
    const jobsRes = await db.query(
      `SELECT 
      title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           ORDER BY title`
    );

    return jobsRes.rows;
  }
  static async get(title) {
    const jobRes = await db.query(
      `SELECT 
      title, salary, equity, company_handle
           FROM jobs
           WHERE title = $1`,
      [title]
    );

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No Job: ${job}`);

    return job;
  }
  static async getByHandle(company_handle) {
    console.log("GET BY HANDLE");
    const jobRes = await db.query(
      `SELECT 
      title, salary, equity, company_handle
           FROM jobs
           WHERE company_handle = $1`,
      [company_handle]
    );

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No Job With Handle: ${company_handle}`);

    return job;
  }
  static async getByEquity() {
    const jobRes = await db.query(
      `SELECT 
      title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
      WHERE equity > 0`
    );
    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No Job With Equity`);

    return job;
  }
  static async getBySalaryEquity(minSalary) {
    const jobRes = await db.query(
      `SELECT 
      title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
      WHERE salary > $1 AND
      equity > 0`,
      [minSalary]
    );
    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No Job With Salaries: ${minSalary}`);

    return job;
  }
  static async getBySalary(minSalary, maxSalary) {
    const jobRes = await db.query(
      `SELECT 
      title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
      WHERE salary BETWEEN $1 AND $2`,
      [minSalary, maxSalary]
    );
    const job = jobRes.rows[0];

    if (!job)
      throw new NotFoundError(
        `No Job With Salaries: ${minSalary} - ${maxSalary}`
      );

    return job;
  }
  static async getByTitleWithEquity(title) {
    let strTitle = "%" + title + "%";
    const jobRes = await db.query(
      `SELECT 
      title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
      WHERE lower(title) LIKE lower($1) AND
      equity > 0`,
      [strTitle]
    );
    const job = jobRes.rows;

    if (!job) throw new NotFoundError(`No job with title: ${title}`);

    return job;
  }
  static async getByTitleSalaryEquity(title) {
    let strTitle = "%" + title + "%";
    const jobRes = await db.query(
      `SELECT 
      title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
      WHERE lower(title) LIKE lower($1) AND
      equity > 0 AND 
      salary > $2`,
      [strTitle, minSalary]
    );
    const job = jobRes.rows;

    if (!job) throw new NotFoundError(`No job with title: ${title}`);

    return job;
  }
  static async getByTitle(title) {
    let strTitle = "%" + title + "%";
    const jobRes = await db.query(
      `SELECT 
      title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
      WHERE   lower(title) LIKE lower($1)`,
      [strTitle]
    );
    const job = jobRes.rows;

    if (!job) throw new NotFoundError(`No job with title: ${title}`);

    return job;
  }
  static async getBySalaryAndTitle(title, minSalary) {
    let strTitle = "%" + title + "%";
    const jobRes = await db.query(
      `SELECT 
      title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
      WHERE   lower(title) LIKE lower($1) AND
      salary > $2`,
      [strTitle, minSalary]
    );
    const job = jobRes.rows[0];

    if (!job)
      throw new NotFoundError(
        `No job with title: ${title} and salary: ${minSalary}`
      );

    return job;
  }
  static async update(title, data) {
    const { setCols, values } = sqlForPartialUpdate(data);
    const titleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs
                      SET ${setCols} 
                      WHERE handle = ${titleVarIdx} 
                      RETURNING title, salary, equity, company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, handle]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${title}`);

    return job;
  }
  static async remove(title) {
    const result = await db.query(
      `DELETE
           FROM jobs
           WHERE title = $1
           RETURNING title`,
      [title]
    );
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${title}`);
  }
}

module.exports = Job;
