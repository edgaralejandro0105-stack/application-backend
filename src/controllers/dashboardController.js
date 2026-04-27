const { Op, fn, col, literal } = require('sequelize');
const Event = require('../models/Event.model');
const Sale = require('../models/Sale.model');
const Client = require('../models/Client.model');
const Product = require('../models/Product.model');
const InventoryBar = require('../models/InventoryBar.model');

exports.getSummary = async (req, res) => {
  try {
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysLater = new Date(now);
    sevenDaysLater.setDate(now.getDate() + 7);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const eventsConfirmedThisMonth = await Event.count({
      where: {
        status: 'Confirmed',
        event_date: {
          [Op.gte]: startMonth,
          [Op.lte]: now
        }
      }
    });

    const totalSalesThisWeek = await Sale.sum('total_price', {
      where: {
        sale_date: {
          [Op.gte]: sevenDaysAgo,
          [Op.lte]: now
        }
      }
    });

    const activeClients = await Client.count();

    const upcomingEvents = await Event.findAll({
      where: {
        event_date: {
          [Op.gte]: now,
          [Op.lte]: sevenDaysLater
        }
      },
      order: [['event_date', 'ASC']],
      limit: 10
    });

    const lowStockProducts = await InventoryBar.findAll({
      attributes: [
        'product_id',
        [fn('SUM', literal("CASE WHEN movement_type = 'Sale' THEN quantity * -1 ELSE quantity END")), 'stock']
      ],
      group: ['product_id'],
      having: literal('SUM(CASE WHEN movement_type = \'Sale\' THEN quantity * -1 ELSE quantity END) <= 5')
    });

    res.status(200).json({
      eventsConfirmedThisMonth,
      totalSalesThisWeek: Number(totalSalesThisWeek || 0),
      activeClients,
      upcomingEvents,
      lowStockProducts
    });
  } catch (error) {
    console.error('dashboardController.getSummary error:', error);
    res.status(500).json({ message: error.message });
  }
};
