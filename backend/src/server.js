import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";
import tenantRoutes from "./routes/tenantRoutes.js";
import boardRoutes from "./routes/boardRoutes.js";
import columnRoutes from "./routes/columnRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import membershipRoutes from "./routes/membershipRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import notFoundMiddleware from "./middlewares/notFoundMiddleware.js";
import { initializeSockets } from "./sockets/socket.js";

dotenv.config();
const app = express();

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const allowedOrigins = (
  process.env.CLIENT_ORIGINS ||
  "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174"
)
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.get("/health", (_req, res) => res.json({ status: "ok" }));

const server = createServer(app);

const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true },
});

app.set("io", io);
initializeSockets(io);

// Mount routers at specific base paths to avoid route conflicts
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/organizations", organizationRoutes);
app.use("/api/v1", tenantRoutes);
app.use("/api/v1", boardRoutes);
app.use("/api/v1", columnRoutes);
app.use("/api/v1", taskRoutes);
app.use("/api/v1", membershipRoutes);
app.use("/api/v1", activityRoutes);
app.use("/api/v1/users", userRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const port = Number(process.env.PORT) || 5050;

connectDB()
  .then(() => {
    server.listen(port, () => console.log(`Server running at ${port}`));
  })
  .catch(() => {
    process.exitCode = 1;
  });
