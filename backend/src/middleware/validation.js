const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const idPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'COMPLETED'];
export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
export const USER_ROLES = ['ADMIN', 'MEMBER'];

const fail = (res, message) => res.status(400).json({ success: false, message });

const isBlank = (value) => value === undefined || value === null || String(value).trim() === '';

export const validateIdParam = (paramName = 'id') => (req, res, next) => {
  const value = req.params[paramName];

  if (!idPattern.test(value || '')) {
    return fail(res, `Invalid ${paramName} format.`);
  }

  next();
};

export const validateAuthSignup = (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (isBlank(name)) return fail(res, 'Name is required.');
  if (isBlank(email) || !emailPattern.test(email)) return fail(res, 'Please provide a valid email address.');
  if (isBlank(password) || String(password).length < 6) return fail(res, 'Password must be at least 6 characters long.');
  if (role && !USER_ROLES.includes(role)) return fail(res, 'Role must be either ADMIN or MEMBER.');

  next();
};

export const validateAuthLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (isBlank(email) || !emailPattern.test(email)) return fail(res, 'Please provide a valid email address.');
  if (isBlank(password)) return fail(res, 'Password is required.');

  next();
};

export const validateProjectBody = (req, res, next) => {
  if (isBlank(req.body.name)) return fail(res, 'Project name is required.');
  next();
};

export const validateMemberBody = (req, res, next) => {
  const { email, userId } = req.body;

  if (isBlank(email) && isBlank(userId)) {
    return fail(res, 'Please select a user or provide a member email address.');
  }

  if (email && !emailPattern.test(email)) {
    return fail(res, 'Please provide a valid member email address.');
  }

  if (userId && !idPattern.test(userId)) {
    return fail(res, 'Please provide a valid member user id.');
  }

  next();
};

export const validateTaskBody = (req, res, next) => {
  const { title, projectId, priority, status, dueDate, assignedTo } = req.body;

  if (isBlank(title)) return fail(res, 'Task title is required.');
  if (isBlank(projectId) || !idPattern.test(projectId)) return fail(res, 'Valid projectId is required.');
  if (assignedTo && !idPattern.test(assignedTo)) return fail(res, 'assignedTo must be a valid user id.');
  if (priority && !TASK_PRIORITIES.includes(priority)) return fail(res, 'Priority must be LOW, MEDIUM, or HIGH.');
  if (status && !TASK_STATUSES.includes(status)) return fail(res, 'Status must be TODO, IN_PROGRESS, or COMPLETED.');
  if (dueDate && Number.isNaN(new Date(dueDate).getTime())) return fail(res, 'Due date must be a valid date.');

  next();
};

export const validateTaskUpdateBody = (req, res, next) => {
  const { projectId, priority, status, dueDate, assignedTo } = req.body;

  if (projectId !== undefined && projectId !== null && !idPattern.test(projectId)) return fail(res, 'projectId must be a valid project id.');
  if (assignedTo !== undefined && assignedTo !== null && assignedTo !== '' && !idPattern.test(assignedTo)) return fail(res, 'assignedTo must be a valid user id.');
  if (priority && !TASK_PRIORITIES.includes(priority)) return fail(res, 'Priority must be LOW, MEDIUM, or HIGH.');
  if (status && !TASK_STATUSES.includes(status)) return fail(res, 'Status must be TODO, IN_PROGRESS, or COMPLETED.');
  if (dueDate && Number.isNaN(new Date(dueDate).getTime())) return fail(res, 'Due date must be a valid date.');

  next();
};

export const validateTaskQuery = (req, res, next) => {
  const { projectId, assignedTo, priority, status } = req.query;

  if (projectId && !idPattern.test(projectId)) return fail(res, 'projectId must be a valid project id.');
  if (assignedTo && !idPattern.test(assignedTo)) return fail(res, 'assignedTo must be a valid user id.');
  if (priority && !TASK_PRIORITIES.includes(priority)) return fail(res, 'Priority must be LOW, MEDIUM, or HIGH.');
  if (status && !TASK_STATUSES.includes(status)) return fail(res, 'Status must be TODO, IN_PROGRESS, or COMPLETED.');

  next();
};
