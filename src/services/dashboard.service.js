const { Op, fn, col, literal } = require('sequelize');
const { Event, Sale, Client, InventoryBar } = require('../models');

class DashboardService {
  async getSummary() {
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysLater = new Date(now);
    sevenDaysLater.setDate(now.getDate() + 7);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const [eventsConfirmedThisMonth, totalSalesThisWeek, activeClients, upcomingEvents, lowStockProducts] =
      await Promise.all([
        Event.count({
          where: { status: 'Confirmed', start_date: { [Op.gte]: startMonth, [Op.lte]: now } }
        }),
        Sale.sum('total', {
          where: { create_at: { [Op.gte]: sevenDaysAgo, [Op.lte]: now } }
        }),
        Client.count(),
        Event.findAll({
          where: { start_date: { [Op.gte]: now, [Op.lte]: sevenDaysLater } },
          order: [['start_date', 'ASC']],
          limit: 10
        }),
        InventoryBar.findAll({
          attributes: [
            'product_id',
            [fn('SUM', literal("CASE WHEN movement_type = 'Sale' THEN quantity * -1 ELSE quantity END")), 'stock']
          ],
          group: ['product_id'],
          having: literal("SUM(CASE WHEN movement_type = 'Sale' THEN quantity * -1 ELSE quantity END) <= 5")
        })
      ]);

    return {
      eventsConfirmedThisMonth,
      totalSalesThisWeek: Number(totalSalesThisWeek || 0),
      activeClients,
      upcomingEvents,
      lowStockProducts
    };
  }
}

module.exports = new DashboardService();
