const notFound = (req, res, next) => {
  res.status(404).json({ message: 'Recurso no encontrado' });
};

const errorHandler = (err, req, res, next) => {
  console.error('Error middleware:', err);
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';
  res.status(status).json({ message });
};

module.exports = {
  notFound,
  errorHandler
};
