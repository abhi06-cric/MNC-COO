const express = require('express');

const {
  getCompanies,
  getCompanyById,
  createCompany,
  deleteCompany
} = require('../controllers/companyController');

const { apiMutationLimiter } = require('../middleware/rateLimiter');
const { validateCompanyInput } = require('../middleware/validator');
const { verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Public Read Endpoints
router.get('/', getCompanies);
router.get('/:id', getCompanyById);

// Admin Mutation Endpoints (Rate Limited, Validated, Protected)
router.post('/', apiMutationLimiter, validateCompanyInput, createCompany);
router.delete('/:id', apiMutationLimiter, deleteCompany);

module.exports = router;