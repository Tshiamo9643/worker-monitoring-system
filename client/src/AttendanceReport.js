// src/AttendanceReport.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';

const AttendanceReport = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [workerId, setWorkerId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchAttendance = async () => {
    const response = await axios.get('http://localhost:5000/attendance', {
      params: {
        workerId,
        startDate,
        endDate
      }
    });
    setAttendanceRecords(response.data);
  };

  const exportCSV = async () => {
    const response = await axios.get('http://localhost:5000/attendance/export/csv', {
      params: {
        workerId,
        startDate,
        endDate
      },
      responseType: 'blob' // Important to specify the response type as blob for file download
    });

    // Create a link element and trigger the download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'attendance-report.csv'); // File name for download
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>Attendance Report</Typography>
      
      <TextField
        label="Worker ID (optional)"
        value={workerId}
        onChange={(e) => setWorkerId(e.target.value)}
        fullWidth
      />
      <TextField
        label="Start Date"
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        fullWidth
      />
      <TextField
        label="End Date"
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        fullWidth
      />

      <Button variant="contained" color="primary" onClick={fetchAttendance}>
        Get Report
      </Button>
      <Button variant="contained" color="secondary" onClick={exportCSV} style={{ marginLeft: 10 }}>
        Export CSV
      </Button>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Worker Name</TableCell>
            <TableCell>Check-In Time</TableCell>
            <TableCell>Check-Out Time</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {attendanceRecords.map(record => (
            <TableRow key={record._id}>
              <TableCell>{record.workerId?.name || 'Unknown Worker'}</TableCell>
              <TableCell>{record.checkInTime ? new Date(record.checkInTime).toLocaleString() : 'N/A'}</TableCell>
              <TableCell>{record.checkOutTime ? new Date(record.checkOutTime).toLocaleString() : 'N/A'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
};

export default AttendanceReport;
