const express = require("express");

const router = express.Router();

const {
  createTicket,
  updateTicket,
  assignTicket,
  getAllTickets,
  getTicket,
} = require("../controllers/ticket");
const { authMiddleware } = require("../middleware/auth");
const { sendMessage } = require("../controllers/message");

router
  .route("/")
  .post(authMiddleware, createTicket)
  .get(authMiddleware, getAllTickets);

router
  .route("/:id")
  .patch(authMiddleware, updateTicket)
  .get(authMiddleware, getTicket);

router.route("/assign/:id").patch(authMiddleware, assignTicket);

router.route("/:id/message").post(authMiddleware, sendMessage);

module.exports = router;