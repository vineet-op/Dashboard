const mongoose = require("mongoose");
const fs = require("fs");
const csv = require("csv-parser");
const Record = require("./Schema"); // Import the schema
const express = require('express')
const app = express()
const cors = require("cors")
app.use(express.json());

// MongoDB connection
mongoose
    .connect("mongodb+srv://massleo100:xpaTuiihkEs0lqE8@cluster0.egtnw.mongodb.net/")
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));

db.once("open", async () => {
    console.log("Connected to MongoDB");
    await importCSV()
});

// Import CSV file
const importCSV = async () => {
    const records = [];
    fs.createReadStream("charts.csv") // Replace with your file's path
        .pipe(csv())
        .on("data", (row) => {
            records.push({
                day: row.Day,
                age: row.Age,
                gender: row.Gender,
                A: Number(row.A),
                B: Number(row.B),
                C: Number(row.C),
                D: Number(row.D),
                E: Number(row.E),
                F: Number(row.F),
            });
        })
        .on("end", async () => {
            console.log("CSV file successfully read");
            try {
                await Record.insertMany(records);
                console.log("Data successfully inserted into MongoDB");
            } catch (error) {
                console.error("Error inserting data:", error);
            } finally {
                mongoose.connection.close();
            }
        });
};


//Routes

app.get("/api/data", async (req, res) => {
    const { age, gender, startDate, endDate } = req.query;
    // const start = new Date(startDate);
    // const end = new Date(endDate);
    try {
        const data = await Record.find({
            age,
            gender,
            day: { $gte: startDate, $lte: endDate }
        });
        res.json(data);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ message: "Error fetching data", error: err });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
