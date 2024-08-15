import React from "react";
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import axios from "axios";
import Alert from "@mui/material/Alert";

const URL = "http://localhost:5001";

export default function ViewReminder({ reminder, temp, setTemp }) {
  const handleDoneButtonClick = () => {
    axios
      .put(`${URL}/api/reminders/${reminder._id}`, { isCompleted: true })
      .then((response) => {
        setTemp(temp + 1);
      })
      .catch((error) => {
        console.error("Failed to update reminder:", error);
      });
  };

  const formattedExecutionDate = new Date(reminder.executionDate).toLocaleString();

  return (
    <Alert severity="info">
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Execution Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{reminder.task}</TableCell>
              <TableCell>{reminder.description}</TableCell>
              <TableCell>{formattedExecutionDate}</TableCell>
              <TableCell>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleDoneButtonClick}
                  style={{ backgroundColor: "yellow" }}
                >
                  Mark as Completed
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Alert>
  );
}
