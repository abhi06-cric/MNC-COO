const Candidate = require('../models/Candidates');

const initialCandidates = [
  {
    name: 'Shiv Kumar',
    role: 'Founder, CEO',
    avatar: 'SK',
    skills: ['Silicon Switch Approach', 'Semiconductor', 'Executive Strategy'],
    experience: '12+ Years Executive Experience',
    bio: 'Pioneering semiconductor systems and strategic enterprise silicon architectures.',
    email: 'shiv.kumar@enterprise.org',
    likes: 42
  },
  {
    name: 'Rahul Kumar',
    role: 'Software Developer',
    avatar: 'RK',
    skills: ['React', 'Node.js', 'MongoDB', 'Cloud Native'],
    experience: '5+ Years Full Stack Engineering',
    bio: 'Specialized in high-scale distributed React and Node.js web applications.',
    email: 'rahul.kumar@enterprise.org',
    likes: 28
  },
  {
    name: 'Mohammad Faizan',
    role: 'AI Researcher',
    avatar: 'MF',
    skills: ['Reinforcement Learning', 'Large Language Models', 'Generative AI', 'PyTorch'],
    experience: '6+ Years AI & Applied Research',
    bio: 'Focusing on advanced agentic reasoning models and reinforcement learning frameworks.',
    email: 'm.faizan@enterprise.org',
    likes: 35
  }
];

// @desc    Get all candidates (auto-seeds if empty)
// @route   GET /api/candidates
exports.getCandidates = async (req, res) => {
  try {
    let candidates = await Candidate.find().sort({ createdAt: -1 });

    if (candidates.length === 0) {
      await Candidate.insertMany(initialCandidates);
      candidates = await Candidate.find().sort({ createdAt: -1 });
    }

    res.status(200).json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ message: 'Server error fetching candidates', error: error.message });
  }
};

// @desc    Add a candidate (Admin action)
// @route   POST /api/candidates
exports.addCandidate = async (req, res) => {
  try {
    const { name, role, avatar, skills, experience, bio, email } = req.body;

    if (!name || !role) {
      return res.status(400).json({ message: 'Name and Role are required fields.' });
    }

    // Process skills array or comma-delimited string
    let parsedSkills = [];
    if (Array.isArray(skills)) {
      parsedSkills = skills.map((s) => String(s).trim()).filter(Boolean);
    } else if (typeof skills === 'string') {
      parsedSkills = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    // Generate avatar initials if none provided
    let candidateAvatar = avatar ? avatar.trim() : '';
    if (!candidateAvatar) {
      const parts = name.trim().split(/\s+/);
      candidateAvatar = (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
    }

    const newCandidate = new Candidate({
      name: name.trim(),
      role: role.trim(),
      avatar: candidateAvatar,
      skills: parsedSkills,
      experience: experience ? experience.trim() : 'Experienced Professional',
      bio: bio ? bio.trim() : '',
      email: email ? email.trim() : '',
      likes: 0
    });

    const saved = await newCandidate.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating candidate:', error);
    res.status(500).json({ message: 'Server error adding candidate', error: error.message });
  }
};

// @desc    Delete a candidate (Admin action)
// @route   DELETE /api/candidates/:id
exports.deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Candidate.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Candidate not found.' });
    }

    res.status(200).json({ message: 'Candidate successfully removed from server.', id });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({ message: 'Server error removing candidate', error: error.message });
  }
};

// @desc    Increment like/endorsement for candidate
// @route   PATCH /api/candidates/:id/like
exports.likeCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Candidate.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Candidate not found.' });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error('Error liking candidate:', error);
    res.status(500).json({ message: 'Server error liking candidate', error: error.message });
  }
};
