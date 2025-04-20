const { promises: fs } = require('fs');
const path = require('path');

const employeeDatabase = {
    employeesList: require('../models/employees.json'),
    updateEmployees(updatedList) {
        this.employeesList = updatedList;
    }
};

// Retrieve all employees
const fetchEmployees = (req, res) => {
    res.json(employeeDatabase.employeesList);
};

// Add a new employee
const addNewEmployee = (req, res) => {
    const { firstname, lastname } = req.body;

    if (!firstname || !lastname) {
        return res.status(400).json({ message: "First and last name required" });
    }

    const newEmployeeId = employeeDatabase.employeesList.length
        ? employeeDatabase.employeesList[employeeDatabase.employeesList.length - 1]._id + 1
        : 1;

    const newEmployee = {
        _id: newEmployeeId,
        firstname,
        lastname
    };

    employeeDatabase.updateEmployees([...employeeDatabase.employeesList, newEmployee]);
    res.status(201).json(employeeDatabase.employeesList);
};

// Update an employee's details
const updateEmployeeDetails = (req, res) => {
    const { _id, firstname, lastname } = req.body;
    const targetId = parseInt(_id);

    const employee = employeeDatabase.employeesList.find(emp => emp._id === targetId);
    if (!employee) {
        return res.status(400).json({ message: "Employee not found" });
    }

    if (firstname) employee.firstname = firstname;
    if (lastname) employee.lastname = lastname;

    const updatedEmployeesList = employeeDatabase.employeesList
        .filter(emp => emp._id !== targetId)
        .concat(employee)
        .sort((a, b) => a._id - b._id);

    employeeDatabase.updateEmployees(updatedEmployeesList);
    res.json(employeeDatabase.employeesList);
};

// Remove an employee
const deleteEmployee = (req, res) => {
    const employeeId = parseInt(req.body.id);
    const employeeExists = employeeDatabase.employeesList.find(emp => emp._id === employeeId);

    if (!employeeExists) {
        return res.status(400).json({ message: "Employee not found" });
    }

    const remainingEmployees = employeeDatabase.employeesList.filter(emp => emp._id !== employeeId);
    employeeDatabase.updateEmployees(remainingEmployees);
    res.json(remainingEmployees);
};

// Fetch a specific employee by ID
const fetchEmployeeById = (req, res) => {
    const id = parseInt(req.params._id);
    const employee = employeeDatabase.employeesList.find(emp => emp._id === id);

    if (!employee) {
        return res.status(400).json({ message: "Employee not found" });
    }

    res.json(employee);
};

module.exports = {
    fetchEmployees,
    addNewEmployee,
    updateEmployeeDetails,
    deleteEmployee,
    fetchEmployeeById
};
