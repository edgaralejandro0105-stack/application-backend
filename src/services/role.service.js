const { Role } = require('../models');

class RoleService {
  async getAllRoles() {
    return await Role.findAll({
      order: [['id', 'ASC']]
    });
  }
}

module.exports = new RoleService();
