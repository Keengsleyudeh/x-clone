import express from 'express';
import authRoutes from './routes/auth.routes.js';
import dotenv from 'dotenv';
import { connectMongoDB } from './db/connectMongoDB.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

 //to parse request body
app.use(express.urlencoded({ extended: true })); // to handle URL encoded data

app.use(cookieParser());

app.use("/api/auth", authRoutes);

console.log(process.env.MONGO_URI);

app.listen(PORT, () => {
  console.log(`Server is running in port ${PORT}`);
  connectMongoDB();
})