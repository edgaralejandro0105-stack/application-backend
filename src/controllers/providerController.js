const providerService = require('../services/provider.service');

const getProviders = async (req, res, next) => {
  try {
    const providers = await providerService.getAll(req.query);
    res.json(providers);
  } catch (error) {
    next(error);
  }
};

const getProviderById = async (req, res, next) => {
  try {
    const provider = await providerService.getById(req.params.id);
    res.json(provider);
  } catch (error) {
    next(error);
  }
};

const createProvider = async (req, res, next) => {
  try {
    const newProvider = await providerService.create(req.body);
    res.status(201).json({
      message: 'Proveedor creado exitosamente',
      provider: newProvider
    });
  } catch (error) {
    next(error);
  }
};

const updateProvider = async (req, res, next) => {
  try {
    const updatedProvider = await providerService.update(req.params.id, req.body);
    res.json({
      message: 'Proveedor actualizado exitosamente',
      provider: updatedProvider
    });
  } catch (error) {
    next(error);
  }
};

const deleteProvider = async (req, res, next) => {
  try {
    await providerService.delete(req.params.id);
    res.json({ message: 'Proveedor movido a la papelera' });
  } catch (error) {
    next(error);
  }
};

const restoreProvider = async (req, res, next) => {
  try {
    await providerService.restore(req.params.id);
    res.json({ message: 'Proveedor restaurado correctamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProviders,
  getProviderById,
  createProvider,
  updateProvider,
  deleteProvider,
  restoreProvider
};
