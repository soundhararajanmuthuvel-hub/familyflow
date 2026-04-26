const router = require("express").Router();
const ctrl = require("../controllers/userController");

router.post("/login", ctrl.login);
router.post("/admin-login", ctrl.adminLogin);
router.post("/create", ctrl.createUser);
router.get("/all", ctrl.getAllUsers);
router.delete("/:id", ctrl.deleteUser);
router.put("/:id", ctrl.updateUser);
router.get("/details", ctrl.getUsersDetails);
router.get("/transactions/:name", ctrl.getMemberTransactions);

module.exports = router;