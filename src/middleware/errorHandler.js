const AppError = require('../utils/AppError');

const handleSequelizeUniqueConstraintError = (err) => {
  const message = `Valor duplicado: ${err.errors[0].message}. Por favor use otro valor.`;
  return new AppError(message, 400);
};

const handleSequelizeValidationError = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Datos inválidos. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleZodError = (err) => {
  const errors = err.errors.map(e => e.message);
  const message = `Error de validación: ${errors.join(', ')}`;
  return new AppError(message, 400);
};

const notFound = (req, res, next) => {
  next(new AppError(`No se puede encontrar ${req.originalUrl} en este servidor!`, 404));
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = { ...err };
  error.message = err.message;
  error.name = err.name;

  if (error.name === 'SequelizeUniqueConstraintError') error = handleSequelizeUniqueConstraintError(error);
  if (error.name === 'SequelizeValidationError') error = handleSequelizeValidationError(error);
  if (error.name === 'ZodError') error = handleZodError(error);

  // Modo desarrollo
  if (process.env.NODE_ENV === 'development') {
    return res.status(error.statusCode).json({
      status: error.status,
      error: error,
      message: error.message,
      stack: err.stack
    });
  }

  // Modo producción
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message
    });
  }

  // Errores de programación u otros errores desconocidos
  console.error('ERROR 💥', err);
  return res.status(500).json({
    status: 'error',
    message: 'Algo salió muy mal!'
  });
};

module.exports = {
  notFound,
  errorHandler
};
