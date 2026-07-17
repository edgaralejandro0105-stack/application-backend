const { Op, fn, col, literal } = require('sequelize');
const { Event, Sale, Client, Product, Venue, Employee, EventStaff, User, Role } = require('../models');

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
        Product.findAll({
          where: literal('current_stock <= min_stock AND is_active = true'),
          attributes: ['product_id', 'name', 'current_stock', 'min_stock']
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

  async getDashboardData(user) {
    const userRole = user.Role?.role_name;
    const accessLevel = user.Role?.access || 0;
    const isAdmin = accessLevel >= 3;

    const canViewEvents = isAdmin || ['Gerente', 'Ventas', 'Staff'].includes(userRole);
    const canViewClients = isAdmin || ['Gerente', 'Ventas'].includes(userRole);
    const canViewInventory = isAdmin || ['Gerente', 'Ventas'].includes(userRole);
    const canViewSales = isAdmin || ['Gerente', 'Ventas'].includes(userRole);

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Profile & employee info (needed for Staff)
    let profile = null;
    let employeeId = null;

    if (userRole === 'Staff') {
      const userWithProfile = await User.findByPk(user.user_id, {
        attributes: { exclude: ['password'] },
        include: [
          { model: Role, attributes: ['role_name', 'access'] },
          { model: Employee, attributes: ['salary_per_event', 'phone', 'first_name', 'last_name', 'rol', 'employee_id'] }
        ]
      });
      if (userWithProfile) {
        profile = userWithProfile;
        employeeId = userWithProfile.Employee?.employee_id;
      }
    }

    // Event filter for Staff
    let eventWhere = { is_active: { [Op.not]: false } };
    if (userRole === 'Staff' && employeeId) {
      eventWhere.event_id = {
        [Op.in]: literal(`(SELECT event_id FROM event_staff WHERE employee_id = ${employeeId})`)
      };
    }

    // Event includes (Client, Venues, and EventStaff for Staff)
    const eventInclude = [
      { model: Client, attributes: ['name', 'last_name', 'doc_id', 'phone'] },
      { model: Venue, attributes: ['venue_id', 'name'], through: { attributes: [] } }
    ];
    if (userRole === 'Staff') {
      eventInclude.push({
        model: EventStaff,
        include: [{ model: Employee, attributes: ['first_name', 'last_name', 'rol'] }]
      });
    }

    // Parallel queries
    const [allEvents, sales, activeClientsCount, lowStockProducts] = await Promise.all([
      canViewEvents ? Event.findAll({ where: eventWhere, include: eventInclude }) : [],
      canViewSales ? Sale.findAll({
        include: [{ model: Event, attributes: ['title'] }],
        order: [['create_at', 'DESC']]
      }) : [],
      canViewClients ? Client.count({ where: { is_active: true } }) : 0,
      canViewInventory ? Product.findAll({
        where: literal('current_stock <= min_stock AND is_active = true'),
        attributes: ['product_id', 'name', 'current_stock', 'min_stock']
      }) : []
    ]);

    // Stats
    const totalEvents = allEvents.length;
    const totalRevenue = sales.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
    const lowStockAlerts = lowStockProducts.length;

    // Monthly revenue (last 6 months)
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const today = new Date();
    const revMap = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      revMap.push({
        name: months[d.getMonth()],
        Ingresos: 0,
        year: d.getFullYear(),
        monthIndex: d.getMonth()
      });
    }
    sales.forEach(sale => {
      const sDate = sale.create_at ? new Date(sale.create_at) : new Date();
      if (isNaN(sDate.getTime())) return;
      const saleMonth = sDate.getMonth();
      const saleYear = sDate.getFullYear();
      const bucket = revMap.find(b => b.monthIndex === saleMonth && b.year === saleYear);
      if (bucket) {
        bucket.Ingresos += Number(sale.total || 0);
      }
    });
    const revenueData = revMap.map(({ name, Ingresos }) => ({ name, Ingresos }));

    // Event types distribution
    const typeCounts = {};
    allEvents.forEach(e => {
      const type = e.type_event || "Otro";
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    const eventTypesData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

    // Venues distribution
    const venueCounts = {};
    allEvents.forEach(e => {
      const names = e.Venues && e.Venues.length > 0
        ? e.Venues.map(v => v.name)
        : ["Sin Salón"];
      names.forEach(name => {
        venueCounts[name] = (venueCounts[name] || 0) + 1;
      });
    });
    const venuesData = Object.entries(venueCounts).map(([name, value]) => ({ name, value }));

    // Staff-specific data
    let staffWorkloadData = [];
    let staffRolesData = [];

    if (userRole === 'Staff') {
      // Workload by month
      const workloadMap = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        workloadMap.push({
          name: months[d.getMonth()],
          Jornadas: 0,
          year: d.getFullYear(),
          monthIndex: d.getMonth()
        });
      }
      allEvents.forEach(event => {
        const eDate = event.start_date ? new Date(event.start_date) : null;
        if (!eDate || isNaN(eDate.getTime())) return;
        const eMonth = eDate.getMonth();
        const eYear = eDate.getFullYear();
        const bucket = workloadMap.find(b => b.monthIndex === eMonth && b.year === eYear);
        if (bucket) {
          bucket.Jornadas += 1;
        }
      });
      staffWorkloadData = workloadMap.map(({ name, Jornadas }) => ({ name, Jornadas }));

      // Role distribution
      const roleDist = {};
      const empRolFallback = profile?.Employee?.rol || "Staff";
      allEvents.forEach(event => {
        if (event.EventStaffs && employeeId) {
          const assignment = event.EventStaffs.find(es => es.employee_id === employeeId);
          if (assignment) {
            const empRol = assignment.Employee?.rol || empRolFallback;
            roleDist[empRol] = (roleDist[empRol] || 0) + 1;
            return;
          }
        }
        roleDist[empRolFallback] = (roleDist[empRolFallback] || 0) + 1;
      });
      staffRolesData = Object.entries(roleDist).map(([name, value]) => ({ name, value }));
    }

    // Upcoming events (next 5)
    const upcomingEvents = allEvents
      .filter(e => {
        const d = e.start_date ? new Date(e.start_date) : null;
        return d && !isNaN(d.getTime()) && d >= now && e.status !== 'Finished' && e.status !== 'Cancelled';
      })
      .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
      .slice(0, 5)
      .map(e => ({
        event_id: e.event_id,
        name: e.title || e.name,
        title: e.title,
        type_event: e.type_event,
        status: e.status,
        start_date: e.start_date,
        Client: e.Client ? { name: e.Client.name, last_name: e.Client.last_name } : null,
        Venues: e.Venues ? e.Venues.map(v => ({ name: v.name })) : []
      }));

    // Recent sales (last 5)
    const recentSales = sales.slice(0, 5).map(s => {
      const json = s.toJSON ? s.toJSON() : s;
      return {
        sale_id: json.sale_id,
        event_id: json.event_id,
        total: json.total,
        payment_method: json.payment_method,
        create_at: json.create_at,
        Event: json.Event ? { name: json.Event.name || json.Event.title } : null
      };
    });

    return {
      stats: {
        totalEvents,
        totalRevenue,
        activeClients: activeClientsCount,
        lowStockAlerts
      },
      revenueData,
      eventTypesData,
      venuesData,
      staffWorkloadData,
      staffRolesData,
      upcomingEvents,
      recentSales,
      lowStockProducts: lowStockProducts.map(p => ({
        product_id: p.product_id,
        name: p.name,
        current_stock: p.current_stock,
        min_stock: p.min_stock
      })),
      profile: profile ? {
        Employee: profile.Employee ? {
          salary_per_event: profile.Employee.salary_per_event,
          rol: profile.Employee.rol,
          employee_id: profile.Employee.employee_id,
          first_name: profile.Employee.first_name,
          last_name: profile.Employee.last_name
        } : null
      } : null
    };
  }
}

module.exports = new DashboardService();
