"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, ExpressError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Company = require("../models/company");

const companyNewSchema = require("../schemas/companyNew.json");
const companyUpdateSchema = require("../schemas/companyUpdate.json");

const router = new express.Router();

/** POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: login
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, companyNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const company = await Company.create(req.body);
    return res.status(201).json({ company });
  } catch (err) {
    return next(err);
  }
});

router.post("/admin/adminTest", ensureAdmin, function (req, res, next) {
  return res.json({ msg: `WELCOME ${res.locals.user.username}` });
});

/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

// router.get("/", async function (req, res, next) {
//   try {
//     const companies = await Company.findAll();
//     return res.json({ companies });
//   } catch (err) {
//     return next(err);
//   }
// });

router.get("/", async function (req, res, next) {
  try {
    let name = req.query.name;
    let minEmployees = Number(req.query.minEmployees);
    let maxEmployees = Number(req.query.maxEmployees);
    console.log(name);
    console.log(req.query);

    if (name && minEmployees && !maxEmployees) {
      throw new ExpressError(
        "Minimum/Max Employees required when either is stated.",
        400
      );
    }

    if (!name && !minEmployees && !maxEmployees) {
      let companies = await Company.findAll();
      return res.json({ companies });
    }

    if (!minEmployees && !maxEmployees) {
      let companies = await Company.getByName(name);
      return res.json({ companies });
    }

    if (!name) {
      if (minEmployees > maxEmployees) {
        throw new ExpressError(
          "Minimum Employees cannot be greater than Max Employees",
          400
        );
      }
      let companies = await Company.getByEmployees(minEmployees, maxEmployees);
      return res.json({ companies });
    }

    if (minEmployees > maxEmployees) {
      throw new ExpressError(
        "Minimum Employees cannot be greater than Max Employees",
        400
      );
    }
    let companies = await Company.getByEmployeesAndName(
      name,
      minEmployees,
      maxEmployees
    );
    return res.json({ companies });
  } catch (err) {
    return next(err);
  }
});

/** GET /[handle]  =>  { company }
 *
 *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:handle", async function (req, res, next) {
  try {
    const company = await Company.get(req.params.handle);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: login
 */

router.patch("/:handle", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, companyUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const company = await Company.update(req.params.handle, req.body);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: login
 */

router.delete("/:handle", ensureAdmin, async function (req, res, next) {
  try {
    await Company.remove(req.params.handle);
    return res.json({ deleted: req.params.handle });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
