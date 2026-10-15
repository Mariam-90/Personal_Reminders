// Every API error has a stable `code`; the client translates it (he / ar / en).
// `error` is an English fallback for other API consumers.
const MESSAGES = {
  notFound: 'Not found',
  fileTooLarge: 'File is too large (max 5MB)',
  serverError: 'Server error, please try again',
  authRequired: 'Authentication required',
  sessionExpired: 'Session expired, please log in again',
  tooManyAttempts: 'Too many attempts, try again in a few minutes',
  usernameInvalid: 'Username must be 3-30 letters or digits',
  passwordShort: 'Password must be at least 6 characters',
  usernameTaken: 'Username is already taken',
  badCredentials: 'Wrong username or password',
  taskRequired: 'Please describe the task',
  taskTooLong: 'Task description is too long',
  dateInvalid: 'Please choose a valid date and time',
  recurrenceInvalid: 'Invalid recurrence',
  reminderNotFound: 'Reminder not found',
  snoozeInvalid: 'Invalid snooze time',
  userNotFound: 'User not found',
  noCustomSound: 'No personal sound uploaded yet',
  unknownSound: 'Unknown sound',
  noFile: 'No file selected',
  audioOnly: 'Only audio files can be uploaded',
  validation: 'Invalid data',
};

const apiError = (code) => ({ error: MESSAGES[code] || code, code });

// Error object for middleware (e.g. multer's fileFilter) that the central handler understands.
function httpError(status, code) {
  const err = new Error(MESSAGES[code] || code);
  err.status = status;
  err.code = code;
  return err;
}

module.exports = { apiError, httpError, MESSAGES };
