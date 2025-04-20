const fileData = {
  employeesList: require("../models/employees.json"),
  updateEmployees(updatedData) {
      this.employeesList = updatedData;
  }
};

// Fetch all employee records
const fetchAllEmployees = (req, res) => {
  res.json(fileData.employeesList);
};

// Add a new employee
const addNewEmployee = (req, res) => {
  const { firstname, lastname } = req.body;

  if (!firstname || !lastname) {
      return res.status(400).json({ message: "Both first and last name are required" });
  }

  const newEmployeeId = fileData.employeesList.length
      ? fileData.employeesList[fileData.employeesList.length - 1]._id + 1
      : 1;

  const newEmployee = {
      _id: newEmployeeId,
      firstname,
      lastname
  };

  fileData.updateEmployees([...fileData.employeesList, newEmployee]);
  res.status(201).json(fileData.employeesList);
};

// Modify an existing employee
const modifyEmployee = (req, res) => {
  const { _id, firstname, lastname } = req.body;
  const employeeId = parseInt(_id);

  const employee = fileData.employeesList.find(emp => emp._id === employeeId);

  if (!employee) {
      return res.status(400).json({ message: "Employee not found" });
  }

  if (firstname) employee.firstname = firstname;
  if (lastname) employee.lastname = lastname;

  const updatedEmployees = fileData.employeesList
      .filter(emp => emp._id !== employeeId)
      .concat(employee)
      .sort((a, b) => a._id - b._id);

  fileData.updateEmployees(updatedEmployees);
  res.json(fileData.employeesList);
};

// Delete an employee entry
const removeEmployee = (req, res) => {
  const employeeId = parseInt(req.body.id);
  const employeeExists = fileData.employeesList.find(emp => emp._id === employeeId);

  if (!employeeExists) {
      return res.status(400).json({ message: "Employee not found" });
  }

  const remainingEmployees = fileData.employeesList.filter(emp => emp._id !== employeeId);
  fileData.updateEmployees(remainingEmployees);
  res.json(remainingEmployees);
};

// Fetch a specific employee by ID
const fetchEmployeeById = (req, res) => {
  const id = parseInt(req.params._id);
  const foundEmployee = fileData.employeesList.find(emp => emp._id === id);

  if (!foundEmployee) {
      return res.status(400).json({ message: "Employee not found" });
  }

  res.json(foundEmployee);
};

module.exports = {
  fetchAllEmployees,
  addNewEmployee,
  modifyEmployee,
  removeEmployee,
  fetchEmployeeById
};
