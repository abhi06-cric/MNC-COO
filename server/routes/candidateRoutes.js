const express = require('express');
const router = express.Router();

const {
  getCandidates,
  addCandidate,
  deleteCandidate,
  likeCandidate
} = require('../controllers/candidateController');

const { apiMutationLimiter } = require('../middleware/rateLimiter');
const { validateCandidateInput } = require('../middleware/validator');

// Public candidate catalog
router.get('/', getCandidates);

// Candidate Like endpoint (Public, Rate Limited)
router.patch('/:id/like', apiMutationLimiter, likeCandidate);

// Admin Mutation Endpoints (Rate Limited, Validated)
router.post('/', apiMutationLimiter, validateCandidateInput, addCandidate);
router.delete('/:id', apiMutationLimiter, deleteCandidate);

module.exports = router;
