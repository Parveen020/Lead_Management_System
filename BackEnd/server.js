import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import AdminRouter from "./Routes/AdminRoutes.js";
import EmployeeRouter from "./Routes/EmployeeRoutes.js";
import CSVRecordRouter from "./Routes/CSVRecordRoutes.js";

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

connectDB();

app.use("/admin", AdminRouter);
app.use("/employee", EmployeeRouter);
app.use("/csv-records", CSVRecordRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
