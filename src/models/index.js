const sequelize = require('../config/db');

// Importar Modelos
const Client = require('./Client.model');
const Employee = require('./Employee.model');
const Event = require('./Event.model');
const EventItem = require('./EventItem.model');
const EventStaff = require('./EventStaff.model');
const InventoryBar = require('./InventoryBar.model');
const Payment = require('./Paymet.model');
const Product = require('./Product.model');
const Role = require('./Role.model');
const Sale = require('./Sale.model');
const SaleDetail = require('./SaleDetail.model');
const ServiceExternal = require('./ServiceExternal.model');
const User = require('./User.model');
const Venue = require('./Venue.model');
const Provider = require('./Provider.model');
const Catalog = require('./Catalog.model');
const Notification = require('./Notification.model');
const EventVenue = require('./EventVenue.model');

// Definir Asociaciones

// User - Role
Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });

// User - Notification
User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

// Catalog - Provider & Product
Provider.hasMany(Catalog, { foreignKey: 'provider_id' });
Catalog.belongsTo(Provider, { foreignKey: 'provider_id' });

Product.hasMany(Catalog, { foreignKey: 'product_id' });
Catalog.belongsTo(Product, { foreignKey: 'product_id' });

// Event - Client & Venue
Client.hasMany(Event, { foreignKey: 'client_id' });
Event.belongsTo(Client, { foreignKey: 'client_id' });

Venue.belongsToMany(Event, { through: EventVenue, foreignKey: 'venue_id' });
Event.belongsToMany(Venue, { through: EventVenue, foreignKey: 'event_id' });

// Event - EventItems
Event.hasMany(EventItem, { foreignKey: 'event_id' });
EventItem.belongsTo(Event, { foreignKey: 'event_id' });

ServiceExternal.hasMany(EventItem, { foreignKey: 'service_id' });
EventItem.belongsTo(ServiceExternal, { foreignKey: 'service_id' });

// Event - EventStaff
Event.hasMany(EventStaff, { foreignKey: 'event_id' });
EventStaff.belongsTo(Event, { foreignKey: 'event_id' });

Employee.hasMany(EventStaff, { foreignKey: 'employee_id' });
EventStaff.belongsTo(Employee, { foreignKey: 'employee_id' });

// Sale - SaleDetails
Sale.hasMany(SaleDetail, { foreignKey: 'sale_id' });
SaleDetail.belongsTo(Sale, { foreignKey: 'sale_id' });

Product.hasMany(SaleDetail, { foreignKey: 'product_id' });
SaleDetail.belongsTo(Product, { foreignKey: 'product_id' });

// Sale - Event
Event.hasMany(Sale, { foreignKey: 'event_id' });
Sale.belongsTo(Event, { foreignKey: 'event_id' });

// Exportar modelos y la conexión
module.exports = {
  sequelize,
  Client,
  Employee,
  Event,
  EventItem,
  EventStaff,
  InventoryBar,
  Payment,
  Product,
  Role,
  Sale,
  SaleDetail,
  ServiceExternal,
  User,
  Venue,
  Provider,
  Catalog,
  Notification,
  EventVenue
};
