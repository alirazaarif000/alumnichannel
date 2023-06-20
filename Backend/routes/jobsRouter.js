const router = require('express').Router();
const auth = require('../middleware/auth');
const jobCtrl = require('../controllers/jobCtrl');

router.post('/jobs', auth, jobCtrl.createJob);
router.get('/jobs', auth, jobCtrl.getJobs);
router.get('/jobs/:id', auth, jobCtrl.getJobById);
router.patch('/jobs/:id', auth, jobCtrl.updateJob);
router.delete('/jobs/:id', auth, jobCtrl.deleteJob);

module.exports = router;