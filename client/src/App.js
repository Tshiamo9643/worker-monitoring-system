import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

// Define the function to check in a worker
const checkInWorker = async (workerId) => {
  // Logic for checking in a worker (e.g., send a request to the server)
  try {
      const response = await axios.post(`http://localhost:5000/checkin`, { workerId });
      console.log('Check-in successful:', response.data);
  } catch (error) {
      console.error('Error during check-in:', error);
  }
};

// Define the function to check out a worker
const checkOutWorker = async (workerId) => {
  // Logic for checking out a worker (e.g., send a request to the server)
  try {
      const response = await axios.post(`http://localhost:5000/checkout`, { workerId });
      console.log('Check-out successful:', response.data);
  } catch (error) {
      console.error('Error during check-out:', error);
  }
};
const App = () => {
  const [workers, setWorkers] = useState([]);
  const [newWorker, setNewWorker] = useState({ name: '', shiftStartTime: '', shiftEndTime: '' });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    const response = await axios.get('http://localhost:5000/workers');
    setWorkers(response.data);
  };

  const addWorker = async () => {
    await axios.post('http://localhost:5000/workers', newWorker);
    fetchWorkers();
    setOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewWorker(prevState => ({ ...prevState, [name]: value }));
  };

  const openAddWorkerDialog = () => {
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Worker Monitoring Dashboard</Typography>

      <Button variant="contained" color="primary" onClick={openAddWorkerDialog}>
        Add Worker
      </Button>

      <Dialog open={open} onClose={closeDialog}>
        <DialogTitle>Add New Worker</DialogTitle>
        <DialogContent>
          <TextField
            label="Worker Name"
            name="name"
            fullWidth
            value={newWorker.name}
            onChange={handleInputChange}
          />
          <TextField
            label="Shift Start Time"
            name="shiftStartTime"
            type="datetime-local"
            fullWidth
            value={newWorker.shiftStartTime}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Shift End Time"
            name="shiftEndTime"
            type="datetime-local"
            fullWidth
            value={newWorker.shiftEndTime}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="secondary">Cancel</Button>
          <Button onClick={addWorker} color="primary">Add</Button>
        </DialogActions>
      </Dialog>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Shift Start Time</TableCell>
            <TableCell>Shift End Time</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Check-In</TableCell>
            <TableCell>Check-Out</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {workers.map(worker => (
            <TableRow key={worker._id}>
              <TableCell>{worker.name}</TableCell>
              <TableCell>{worker.shiftStartTime ? new Date(worker.shiftStartTime).toLocaleString() : 'N/A'}</TableCell>
              <TableCell>{worker.shiftEndTime ? new Date(worker.shiftEndTime).toLocaleString() : 'N/A'}</TableCell>
              <TableCell>{worker.status}</TableCell>
              <TableCell>
                {worker.status !== 'Checked In' && (
                  <Button variant="contained" color="primary" onClick={() => checkInWorker(worker._id)}>
                    Check In
                  </Button>
                )}
              </TableCell>
              <TableCell>
                {worker.status === 'Checked In' && (
                  <Button variant="contained" color="secondary" onClick={() => checkOutWorker(worker._id)}>
                    Check Out
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
};

export default App;
