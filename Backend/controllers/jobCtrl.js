const Job = require("../models/jobsModel");

const jobCtrl = {
  createJob: async (req, res) => {
    try {
      const { title, company, location, alphabets, duration, salary, link } =
        req.body;

      const newJob = new Job({
        title,
        company,
        location,
        alphabets,
        duration,
        salary,
        link
      });

      const jobExist = await Job.findOne({ title });
      if (jobExist) {
        return res.status(400).json({ msg: "This Title already exists." });
      }

      const savedJob = await newJob.save();

      res.status(201).json(savedJob);
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ error: err.message });
    }
  },
  getJobs: async (req, res) => {
    try {
      const { search } = req.query;
      let jobs;
      if (search) {
        // Perform a case-insensitive search by title or company
        jobs = await Job.find({
          $or: [
            { title: { $regex: search, $options: "i" } },
            { company: { $regex: search, $options: "i" } },
          ],
        });
      } else {
        // Fetch all jobs if no search query is provided
        jobs = await Job.find();
      }

      res.json({ jobs });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getJobById: async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);

      if (!job) {
        return res.status(404).json({ msg: "Job not found" });
      }

      res.json(job);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  updateJob: async (req, res) => {
    try {
      const { title, company, location, alphabets, duration, salary, link } =
        req.body;

      const updatedJob = await Job.findByIdAndUpdate(
        req.params.id,
        {
          title,
          company,
          location,
          alphabets,
          duration,
          salary,
          link
        },
        { new: true }
      );

      if (!updatedJob) {
        return res.status(404).json({ msg: "Job not found" });
      }

      res.json(updatedJob);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  deleteJob: async (req, res) => {
    try {
      const deletedJob = await Job.findByIdAndDelete(req.params.id);

      if (!deletedJob) {
        return res.status(404).json({ msg: "Job not found" });
      }

      res.json({ message: "Job deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = jobCtrl;
