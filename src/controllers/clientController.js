const Client = require('../models/Client.model');

exports.createClient = async (req, res) => {
  try {
    const client = await Client.create(req.body);
    res.status(201).json({ message: 'Cliente creado correctamente', data: client });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Ya existe un cliente registrado con ese documento de identidad.' });
    }
    res.status(500).json({ message: 'Error al crear el cliente.', error: error.message });
  }
};

exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.findAll();
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClientById = async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id);
        if (!client) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }
        res.status(200).json(client);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateClient = async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id);
        if (!client) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }
        await client.update(req.body);
        res.status(200).json({
            message: "Cliente actualizado correctamente",
            data: client
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteClient = async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id);
        if (!client) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }
        await client.destroy();
        res.status(200).json({ message: "Cliente eliminado de la base de datos" });
    } catch (error) {
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(409).json({ message: 'No se puede eliminar el cliente porque tiene eventos o facturas asociados.' });
        }
        res.status(500).json({ message: 'Error interno al intentar eliminar el cliente.', error: error.message });
    }
};
