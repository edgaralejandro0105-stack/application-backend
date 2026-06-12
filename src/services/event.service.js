const { Op } = require('sequelize');
const { Event, Client, Venue, EventItem, EventStaff, ServiceExternal, Employee } = require('../models');
const AppError = require('../utils/AppError');

const EVENT_INCLUDE = [
  { model: Client, attributes: ['name', 'last_name', 'doc_id', 'phone'] },
  { model: Venue, attributes: ['name'] },
  { 
    model: EventStaff, 
    include: [{ model: Employee, attributes: ['first_name', 'last_name', 'rol'] }] 
  },
  { 
    model: EventItem, 
    include: [{ model: ServiceExternal, attributes: ['name', 'service_type'] }] 
  }
];

class EventService {
  async getAllEvents(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (query.status) where.status = query.status;
    if (query.search) where.name = { [Op.iLike]: `%${query.search}%` };

    const result = await Event.findAndCountAll({
      where, limit, offset,
      include: EVENT_INCLUDE,
      order: [['start_date', 'ASC']]
    });
    return { total: result.count, page, limit, totalPages: Math.ceil(result.count / limit), data: result.rows };
  }

  async createEvent(data) {
    const { EventItem, EventStaff } = require('../models');

    // Anti-collision check
    const conflict = await Event.findOne({
      where: {
        venue_id: data.venue_id,
        status: { [Op.ne]: 'Cancelled' },
        start_date: { [Op.lt]: data.end_date },
        end_date: { [Op.gt]: data.start_date }
      }
    });

    if (conflict) {
      throw new AppError('El salón seleccionado ya se encuentra ocupado en ese horario.', 409);
    }

    const newEvent = await Event.create(data);

    if (data.services && Array.isArray(data.services) && data.services.length > 0) {
      const items = data.services.map(serviceId => ({
        event_id: newEvent.event_id,
        service_id: serviceId
      }));
      await EventItem.bulkCreate(items);
    }

    if (data.staff && Array.isArray(data.staff) && data.staff.length > 0) {
      const staffMembers = data.staff.map(employeeId => ({
        event_id: newEvent.event_id,
        employee_id: employeeId
      }));
      await EventStaff.bulkCreate(staffMembers);
    }

    return newEvent;
  }

  async createWebsiteReservation(data) {
    // 1. Resolve or Create Client
    const nameParts = data.contacto.nombre.trim().split(' ');
    const name = nameParts[0] || 'Desconocido';
    const lastName = nameParts.slice(1).join(' ') || 'N/A';
    const cedula = data.contacto.cedula ? data.contacto.cedula.trim() : ('WEB-' + Date.now().toString().slice(-6));
    
    let client = await Client.findOne({
      where: { doc_id: cedula }
    });

    if (!client) {
      client = await Client.create({
        name: name,
        last_name: lastName,
        doc_id: cedula,
        phone: data.contacto.telefono,
        email: data.contacto.correo ? data.contacto.correo.trim().toLowerCase() : null
      });
    } else {
      // Cliente existe, actualizamos sus datos por si cambiaron de nombre/teléfono/correo
      const updateData = {};
      if (name !== 'Desconocido') updateData.name = name;
      if (lastName !== 'N/A') updateData.last_name = lastName;
      if (data.contacto.telefono) updateData.phone = data.contacto.telefono;
      if (data.contacto.correo) updateData.email = data.contacto.correo.trim().toLowerCase();
      
      await client.update(updateData);
    }

    // 2. Resolve Venue
    let venue = await Venue.findOne({ where: { name: { [Op.iLike]: `%${data.salon}%` } } });
    if (!venue) {
      // Si no encuentra el salón por nombre (ej. dice "Ambos" o el nombre no cuadra exacto), tomar el primero activo
      venue = await Venue.findOne({ order: [['venue_id', 'ASC']] });
    }
    const venueId = venue ? venue.venue_id : null; // Si no hay ningún salón, fallará (lo cual es correcto)

    // 3. Resolve Dates (parsing YYYY-MM-DD safely to local timezone)
    const [year, month, day] = data.fecha.split('-').map(Number);
    let startDate = new Date(year, month - 1, day);
    let endDate = new Date(year, month - 1, day);
    
    if (data.horario && data.horario.includes('-')) {
       const [startStr, endStr] = data.horario.split('-');
       const [startH, startM] = startStr.split(':').map(Number);
       const [endH, endM] = endStr.split(':').map(Number);
       
       startDate.setHours(startH, startM || 0, 0);
       
       // Si la hora de fin es menor a la de inicio (ej. 03:00 < 20:00), es al día siguiente
       if (endH < startH) {
           endDate.setDate(endDate.getDate() + 1);
       }
       endDate.setHours(endH, endM || 0, 0);
    } else {
       // Fallback
       startDate.setHours(14, 0, 0);
       endDate.setHours(21, 0, 0);
    }

    // 4. Create Event
    const newEvent = await Event.create({
      client_id: client.client_id,
      venue_id: venueId,
      start_date: startDate,
      end_date: endDate,
      type_event: data.tipo,
      guests: data.invitados ? parseInt(data.invitados) : 0,
      status: 'Pending'
    });

    // Optionally attach extra fields for the notification
    newEvent.dataValues.event_date = data.fecha;
    newEvent.dataValues.id = newEvent.event_id;
    
    return newEvent;
  }

  async getEventById(id) {
    const event = await Event.findByPk(id, { include: EVENT_INCLUDE });
    if (!event) throw new AppError('Evento no encontrado', 404);
    return event;
  }

  async updateEvent(id, data) {
    const { EventItem, EventStaff } = require('../models');
    const event = await Event.findByPk(id);
    if (!event) throw new AppError('Evento no encontrado', 404);
    
    // Si se están actualizando fechas o salón, hacer anti-collision check
    if (data.start_date || data.end_date || data.venue_id) {
      const targetVenueId = data.venue_id || event.venue_id;
      const targetStartDate = data.start_date || event.start_date;
      const targetEndDate = data.end_date || event.end_date;

      const conflict = await Event.findOne({
        where: {
          event_id: { [Op.ne]: id },
          venue_id: targetVenueId,
          status: { [Op.ne]: 'Cancelled' },
          start_date: { [Op.lt]: targetEndDate },
          end_date: { [Op.gt]: targetStartDate }
        }
      });

      if (conflict) {
        throw new AppError('El salón seleccionado ya se encuentra ocupado en ese horario.', 409);
      }
    }

    await event.update(data);
    
    if (data.services !== undefined) {
      await EventItem.destroy({ where: { event_id: id } });
      if (Array.isArray(data.services) && data.services.length > 0) {
        const items = data.services.map(serviceId => ({
          event_id: id,
          service_id: serviceId
        }));
        await EventItem.bulkCreate(items);
      }
    }

    if (data.staff !== undefined) {
      await EventStaff.destroy({ where: { event_id: id } });
      if (Array.isArray(data.staff) && data.staff.length > 0) {
        const staffMembers = data.staff.map(employeeId => ({
          event_id: id,
          employee_id: employeeId
        }));
        await EventStaff.bulkCreate(staffMembers);
      }
    }

    return event;
  }

  async deleteEvent(id) {
    const event = await Event.findByPk(id);
    if (!event) throw new AppError('Evento no encontrado', 404);
    await event.destroy();
    return true;
  }

  async getWebsiteReservationStatus(email) {
    const trimmedEmail = email.trim().toLowerCase();
    const client = await Client.findOne({ where: { email: trimmedEmail } });
    if (!client) {
      return { client: null, events: [] };
    }
    const events = await Event.findAll({
      where: { client_id: client.client_id },
      include: [{ model: Venue, attributes: ['name'] }],
      order: [['start_date', 'DESC']]
    });
    return {
      client: {
        name: client.name,
        last_name: client.last_name
      },
      events: events.map(e => ({
        event_id: e.event_id,
        start_date: e.start_date,
        end_date: e.end_date,
        type_event: e.type_event,
        status: e.status,
        venue: e.Venue ? e.Venue.name : 'N/A'
      }))
    };
  }
}

module.exports = new EventService();
