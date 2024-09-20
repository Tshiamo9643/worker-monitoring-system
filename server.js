// server.js
const response = await axios.post('http://localhost:5000/api/your-endpoint', data);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log(err));

// Worker Schema and Model
const workerSchema = new mongoose.Schema({
    name: String,
    status: String,
    checkInTime: Date,
    checkOutTime: Date,
    shiftStartTime: Date,   // New field for shift start time
    shiftEndTime: Date      // New field for shift end time
  });
  const Worker = mongoose.model('Worker', workerSchema);

// API Endpoints
app.get('/workers', async (req, res) => {
  const workers = await Worker.find();
  res.json(workers);
});

const { Parser } = require('json2csv');

app.get('/attendance/export/csv', async (req, res) => {
  const { workerId, startDate, endDate } = req.query;

  // Build query for the attendance data
  let query = {};
  if (workerId) query.workerId = workerId;
  if (startDate && endDate) {
    query.checkInTime = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  // Fetch attendance records and populate worker details
  const attendanceRecords = await Attendance.find(query).populate('workerId', 'name');

  // Prepare data for CSV export
  const csvFields = ['workerId.name', 'checkInTime', 'checkOutTime'];
  const csvData = attendanceRecords.map(record => ({
    workerName: record.workerId?.name || 'Unknown',
    checkInTime: record.checkInTime ? new Date(record.checkInTime).toLocaleString() : 'N/A',
    checkOutTime: record.checkOutTime ? new Date(record.checkOutTime).toLocaleString() : 'N/A',
  }));

  // Convert to CSV format
  try {
    const json2csvParser = new Parser({ fields: csvFields });
    const csv = json2csvParser.parse(csvData);

    // Set headers to force download
    res.header('Content-Type', 'text/csv');
    res.attachment('attendance-report.csv');
    return res.send(csv);
  } catch (err) {
    return res.status(500).json({ message: 'Error generating CSV file', error: err });
  }
});

const ExcelJS = require('exceljs');

app.get('/attendance/export/excel', async (req, res) => {
  const { workerId, startDate, endDate } = req.query;

  let query = {};
  if (workerId) query.workerId = workerId;
  if (startDate && endDate) {
    query.checkInTime = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  const attendanceRecords = await Attendance.find(query).populate('workerId', 'name');

  // Create a new workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Attendance Report');

  // Define the columns
  worksheet.columns = [
    { header: 'Worker Name', key: 'workerName', width: 30 },
    { header: 'Check-In Time', key: 'checkInTime', width: 30 },
    { header: 'Check-Out Time', key: 'checkOutTime', width: 30 },
  ];

  // Add data to worksheet
  attendanceRecords.forEach(record => {
    worksheet.addRow({
      workerName: record.workerId?.name || 'Unknown',
      checkInTime: record.checkInTime ? new Date(record.checkInTime).toLocaleString() : 'N/A',
      checkOutTime: record.checkOutTime ? new Date(record.checkOutTime).toLocaleString() : 'N/A',
    });
  });

  // Write the Excel file to response
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.xlsx');

  await workbook.xlsx.write(res);
  res.end();
});

app.post('/workers', async (req, res) => {
    const newWorker = new Worker({
      name: req.body.name,
      status: req.body.status || 'Not Checked In',
      shiftStartTime: req.body.shiftStartTime,  // Handling shift start time
      shiftEndTime: req.body.shiftEndTime       // Handling shift end time
    });
    await newWorker.save();
    res.json(newWorker);
  });
  
  app.put('/workers/:id', async (req, res) => {
    const updatedWorker = await Worker.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,   // Update shift times and other fields dynamically
      },
      { new: true }
    );
    res.json(updatedWorker);
  });
  

app.delete('/workers/:id', async (req, res) => {
  await Worker.findByIdAndDelete(req.params.id);
  res.json({ message: 'Worker removed' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

