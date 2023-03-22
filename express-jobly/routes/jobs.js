const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, ExpressError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/jobs");

const jobNewSchema = require("../schemas/jobsNew.json");
const jobUpdateSchema = require("../schemas/jobsUpdate.json");

const router = new express.Router();

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.create(req.body);

    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

router.get("/", async function (req, res, next) {
  try {
    let title = req.query.title;
    let minSalary = Number(req.query.minSalary);
    let hasEquity = Boolean(req.query.hasEquity);

    if (!title && !minSalary && (hasEquity === false || !hasEquity)) {
      let jobs = await Job.findAll();
      return res.json({ jobs });
    }
    if (!minSalary) {
      if (hasEquity) {
        let jobs = await Job.getByTitleWithEquity(minSalary);
        return res.json({ jobs });
      }
      let jobs = await Job.getByTitle(title);
      return res.json({ jobs });
    }
    if (!title) {
      if (hasEquity === true) {
        let jobs = await Job.getBySalaryEquity(minSalary);
        return res.json({ jobs });
      }
      let jobs = await Job.getBySalary(minSalary);
      return res.json({ jobs });
    }
    if (!hasEquity === false || !hasEquity) {
      let jobs = await Job.getBySalaryAndTitle(title, minSalary);
      return res.json({ jobs });
    }
    let jobs = await Job.getByTitleSalaryEquity(title, minSalary);
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, companyNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

router.get("/:companyHandle", async function (req, res, next) {
  try {
    const job = await Job.getByHandle(req.params.companyHandle);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

router.get("/:title", async function (req, res, next) {
  try {
    const job = await Job.get(req.params.title);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

router.patch("/:title", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, companyUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await job.update(req.params.title, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
    await Job.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
