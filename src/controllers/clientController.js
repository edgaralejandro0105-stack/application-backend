const Client = require('../models/Client.model');

// 1. Obtener un cliente por su ID
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

// 2. Actualizar datos de un cliente
exports.updateClient = async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id);
        if (!client) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }
        
        await client.update(req.body); // Sequelize detecta qué campos cambiaron
        res.status(200).json({
            message: "Cliente actualizado correctamente",
            data: client
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 3. Eliminar un cliente
exports.deleteClient = async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id);
        if (!client) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }
        
        await client.destroy(); // Esto borra el registro de la tabla
        res.status(200).json({ message: "Cliente eliminado de la base de datos" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};