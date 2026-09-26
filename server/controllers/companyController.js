const Company = require('../models/Company');

// Get all companies
const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });

    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch companies',
      error: error.message
    });
  }
};

// Get one company
const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        message: 'Company not found'
      });
    }

    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch company',
      error: error.message
    });
  }
};

// Create company
const createCompany = async (req, res) => {
  try {
    const company = await Company.create(req.body);

    res.status(201).json({
      message: 'Company created successfully',
      company
    });
  } catch (error) {
    res.status(400).json({
      message: 'Failed to create company',
      error: error.message
    });
  }
};

// Delete company
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);

    if (!company) {
      return res.status(404).json({
        message: 'Company not found'
      });
    }

    res.status(200).json({
      message: 'Company deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete company',
      error: error.message
    });
  }
};

module.exports = {
  getCompanies,
  getCompanyById,
  createCompany,
  deleteCompany
};