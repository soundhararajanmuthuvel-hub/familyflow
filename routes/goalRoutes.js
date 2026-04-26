const router = require("express").Router();
const ctrl = require("../controllers/goalController");

router.post("/create", ctrl.createGoal);
router.post("/add/:id", ctrl.addToGoal);
router.get("/", ctrl.getGoals);

module.exports = router;