// ============================================================
// Configuración — ajustar si cambia la cuenta de Google
// ============================================================
// Requiere el Servicio avanzado "Google Calendar API" habilitado en este
// proyecto de Apps Script (Servicios → + → Google Calendar API), usado
// para generar un enlace de Meet único por reserva (ver createEventWithMeet).
var AVAILABILITY_CAL_NAME = 'Disponibilitat Llavors';
var SLOT_MINUTES = 30;

// ============================================================
// Entry points
// ============================================================

function doGet(e) {
  var action = e.parameter.action;
  var result;

  try {
    if (action === 'days') {
      var year = parseInt(e.parameter.year, 10);
      var month = parseInt(e.parameter.month, 10); // 1-based
      result = getAvailableMonth(year, month);

    } else if (action === 'slots') {
      var date = e.parameter.date; // 'YYYY-MM-DD'
      result = { date: date, slots: getSlotsForDay(date) };

    } else {
      result = { error: 'unknown_action' };
    }
  } catch (err) {
    result = { error: err.message };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var result;
  try {
    var data = JSON.parse(e.postData.contents);
    result = bookSlot(data);
  } catch (err) {
    result = { ok: false, error: err.message };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// Lógica principal
// ============================================================

function getAvailableMonth(year, month) {
  // Serve from cache when possible (10-min TTL, invalidated on booking)
  var cacheKey = 'month_' + year + '_' + month;
  var cache = CacheService.getScriptCache();
  var cached = cache.get(cacheKey);
  if (cached) {
    try { return JSON.parse(cached); } catch(e) {}
  }

  var availCal = getAvailabilityCalendar();
  if (!availCal) return { availableDays: [], slots: {} };

  var start = new Date(year, month - 1, 1);
  var end   = new Date(year, month, 1);

  // Two API calls for the whole month instead of 4x per available day
  var availEvents = availCal.getEvents(start, end);
  var primaryCal  = CalendarApp.getDefaultCalendar();
  var busyEvents  = primaryCal.getEvents(start, end);

  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var cutoff = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

  // Group availability windows by day
  var availByDay = {};
  availEvents.forEach(function(ev) {
    var d = new Date(ev.getStartTime());
    d.setHours(0, 0, 0, 0);
    if (d >= today) {
      var key = toDateStr(d);
      if (!availByDay[key]) availByDay[key] = [];
      availByDay[key].push(ev);
    }
  });

  var availableDays = [];
  var slots = {};

  Object.keys(availByDay).sort().forEach(function(dateStr) {
    var parts    = dateStr.split('-').map(Number);
    var dayStart = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0);
    var dayEnd   = new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59);

    // Filter already-fetched busy events that overlap this day
    var dayBusy = busyEvents.filter(function(ev) {
      return ev.getStartTime() < dayEnd && ev.getEndTime() > dayStart;
    });

    var allSlots = [];
    availByDay[dateStr].forEach(function(ev) {
      generateSlots(ev.getStartTime(), ev.getEndTime()).forEach(function(s) {
        allSlots.push(s);
      });
    });

    var daySlots = allSlots.filter(function(slotStart) {
      if (slotStart <= cutoff) return false;
      var slotEnd = new Date(slotStart.getTime() + SLOT_MINUTES * 60 * 1000);
      return !dayBusy.some(function(ev) {
        return slotStart < ev.getEndTime() && slotEnd > ev.getStartTime();
      });
    }).map(function(d) {
      return padTwo(d.getHours()) + ':' + padTwo(d.getMinutes());
    });

    if (daySlots.length > 0) {
      availableDays.push(dateStr);
      slots[dateStr] = daySlots;
    }
  });

  var result = { availableDays: availableDays.sort(), slots: slots };
  try { cache.put(cacheKey, JSON.stringify(result), 600); } catch(e) {}
  return result;
}

function getSlotsForDay(dateStr) {
  var availCal = getAvailabilityCalendar();
  if (!availCal) return [];

  var parts = dateStr.split('-').map(Number);
  var year = parts[0], month = parts[1], day = parts[2];

  // Assumes Apps Script timezone matches Angela's Google Account (Europe/Madrid).
  var dayStart = new Date(year, month - 1, day, 0, 0, 0);
  var dayEnd   = new Date(year, month - 1, day, 23, 59, 59);

  var availEvents = availCal.getEvents(dayStart, dayEnd);
  if (availEvents.length === 0) return [];

  // Generate all 30-min slots from availability windows
  var allSlots = [];
  availEvents.forEach(function(ev) {
    generateSlots(ev.getStartTime(), ev.getEndTime()).forEach(function(s) {
      allSlots.push(s);
    });
  });

  // Get busy events from primary calendar
  var primaryCal = CalendarApp.getDefaultCalendar();
  var busyEvents = primaryCal.getEvents(dayStart, dayEnd);

  var cutoff = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

  return allSlots.filter(function(slotStart) {
    // Skip slots within 24h from now (first appointment requires 24h notice)
    if (slotStart <= cutoff) return false;

    var slotEnd = new Date(slotStart.getTime() + SLOT_MINUTES * 60 * 1000);

    // Skip slots that overlap with any busy event
    return !busyEvents.some(function(ev) {
      return slotStart < ev.getEndTime() && slotEnd > ev.getStartTime();
    });
  }).map(function(d) {
    return padTwo(d.getHours()) + ':' + padTwo(d.getMinutes());
  });
}

function bookSlot(data) {
  var date  = data.date;
  var time  = data.time;
  var name  = data.name;
  var email = data.email;
  var phone = data.phone || '';
  var notes = data.notes || '';
  var lang  = data.lang || 'ca';
  if (lang !== 'ca' && lang !== 'es') lang = 'ca';

  if (!name || !email || !date || !time) {
    return { ok: false, error: 'missing_fields' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'invalid_email' };
  }

  // Note: check-then-act is not atomic. Double-bookings are extremely unlikely
  // for a small practice but possible under simultaneous load. Acceptable for v1.
  // Verify slot is still available
  var available = getSlotsForDay(date);
  if (available.indexOf(time) === -1) {
    return { ok: false, error: 'slot_taken' };
  }

  var parts = date.split('-').map(Number);
  var timeParts = time.split(':').map(Number);
  var startTime = new Date(parts[0], parts[1] - 1, parts[2], timeParts[0], timeParts[1], 0);
  var endTime   = new Date(startTime.getTime() + SLOT_MINUTES * 60 * 1000);

  var meetLink = createEventWithMeet(name, email, startTime, endTime, phone, notes, lang);

  // Invalidate month cache so the next visitor sees updated availability
  var cacheKey = 'month_' + parts[0] + '_' + parts[1];
  try { CacheService.getScriptCache().remove(cacheKey); } catch(e) {}

  sendConfirmationEmail(name, email, date, time, lang, phone, notes, meetLink);

  return { ok: true };
}

// Crea el evento en el calendario principal con un enlace de Google Meet
// único para esta reserva. Requiere el servicio avanzado "Google Calendar
// API" (ver comentario de configuración al inicio del archivo).
function createEventWithMeet(name, email, startTime, endTime, phone, notes, lang) {
  var description = [];
  if (phone) description.push('Telèfon: ' + phone);
  if (notes) description.push('Motiu: ' + notes);
  description.push('Idioma preferit: ' + (lang === 'ca' ? 'Valencià' : 'Castellà'));

  var event = Calendar.Events.insert({
    summary: 'Primera Cita (Online) — ' + name,
    description: description.join('\n'),
    start: { dateTime: startTime.toISOString(), timeZone: 'Europe/Madrid' },
    end:   { dateTime: endTime.toISOString(),   timeZone: 'Europe/Madrid' },
    attendees: [{ email: email }],
    conferenceData: {
      createRequest: {
        requestId: Utilities.getUuid(),
        conferenceSolutionKey: { type: 'hangoutsMeet' }
      }
    }
  }, 'primary', { conferenceDataVersion: 1, sendUpdates: 'all' });

  var meetLink = event.hangoutLink;

  // El hangoutLink puede llegar vacío justo tras el insert mientras Google
  // aprovisiona la conferencia — se reintenta una vez recuperando el evento.
  if (!meetLink) {
    try {
      var refreshed = Calendar.Events.get('primary', event.id);
      meetLink = refreshed.hangoutLink || '';
    } catch (e) {}
  }

  if (meetLink) {
    try {
      Calendar.Events.patch({
        description: description.concat(['Enllaç de la videotrucada: ' + meetLink]).join('\n')
      }, 'primary', event.id);
    } catch (e) {}
  }

  return meetLink;
}

// ============================================================
// Helpers
// ============================================================

function generateSlots(start, end) {
  var slots = [];
  var current = new Date(start);
  while (current.getTime() + SLOT_MINUTES * 60 * 1000 <= end.getTime()) {
    slots.push(new Date(current));
    current.setMinutes(current.getMinutes() + SLOT_MINUTES);
  }
  return slots;
}

function sendConfirmationEmail(name, email, date, time, lang, phone, notes, meetLink) {
  var parts = date.split('-').map(Number);
  var timeParts = time.split(':').map(Number);
  var startTime = new Date(parts[0], parts[1] - 1, parts[2], timeParts[0], timeParts[1], 0);
  var endTime   = new Date(startTime.getTime() + SLOT_MINUTES * 60 * 1000);
  var endStr    = padTwo(endTime.getHours()) + ':' + padTwo(endTime.getMinutes());

  var weekdaysCa = ['Diumenge','Dilluns','Dimarts','Dimecres','Dijous','Divendres','Dissabte'];
  var weekdaysEs = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  var monthsCa   = ['gener','febrer','març','abril','maig','juny','juliol','agost','setembre','octubre','novembre','desembre'];
  var monthsEs   = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

  var wd = startTime.getDay();
  var d  = parts[2];
  var m  = parts[1] - 1;
  var y  = parts[0];

  var fromAddr = 'info@llavorslogopedia.com';
  var whatsapp = 'https://wa.me/34614337743';
  var meetLine = meetLink || '';

  // Confirmation to patient
  if (lang === 'ca') {
    GmailApp.sendEmail(email, 'Cita confirmada — Llavors Logopèdia',
      'Hola ' + name + ',\n\n' +
      'La teua primera cita amb Àngela Alonso està confirmada.\n\n' +
      '📅 ' + weekdaysCa[wd] + ', ' + d + ' de ' + monthsCa[m] + ' de ' + y + ' a les ' + time + '–' + endStr + '\n' +
      '⏱ Durada: 30 minuts\n' +
      '💻 La cita és online, per videotrucada.\n' +
      (meetLine ? '📹 Enllaç de la videotrucada: ' + meetLine + '\n' : '') + '\n' +
      '📌 Àngela es posarà en contacte amb tu per confirmar la cita. La cita pot patir canvis per motius d\'organització.\n\n' +
      'Si necessites una cita presencial urgent, contacta per WhatsApp: ' + whatsapp + '\n\n' +
      'Si necessites canviar o cancel·lar la cita, posa\'t en contacte:\n' +
      '📧 ' + fromAddr + '\n' +
      '💬 WhatsApp: ' + whatsapp + '\n\n' +
      'Fins aviat,\nÀngela Alonso — Llavors Logopèdia',
      { from: fromAddr }
    );
  } else {
    GmailApp.sendEmail(email, 'Cita confirmada — Llavors Logopèdia',
      'Hola ' + name + ',\n\n' +
      'Tu primera cita con Àngela Alonso está confirmada.\n\n' +
      '📅 ' + weekdaysEs[wd] + ', ' + d + ' de ' + monthsEs[m] + ' de ' + y + ' a las ' + time + '–' + endStr + '\n' +
      '⏱ Duración: 30 minutos\n' +
      '💻 La cita es online, por videollamada.\n' +
      (meetLine ? '📹 Enlace de la videollamada: ' + meetLine + '\n' : '') + '\n' +
      '📌 Àngela se pondrá en contacto contigo para confirmar la cita. La cita puede sufrir cambios por motivos de organización.\n\n' +
      'Si necesitas una cita presencial urgente, contacta por WhatsApp: ' + whatsapp + '\n\n' +
      'Si necesitas cambiar o cancelar la cita, contacta:\n' +
      '📧 ' + fromAddr + '\n' +
      '💬 WhatsApp: ' + whatsapp + '\n\n' +
      'Hasta pronto,\nÀngela Alonso — Llavors Logopèdia',
      { from: fromAddr }
    );
  }

  // Notification to Àngela
  GmailApp.sendEmail('logopeda.angela@gmail.com',
    'Nova cita — ' + name + ' · ' + weekdaysCa[wd] + ' ' + d + '/' + (m+1) + ' ' + time,
    'S\'ha reservat una nova primera cita (online):\n\n' +
    'Nom: ' + name + '\n' +
    'Data: ' + weekdaysCa[wd] + ', ' + d + ' de ' + monthsCa[m] + ' de ' + y + '\n' +
    'Hora: ' + time + '–' + endStr + '\n' +
    'Email: ' + email + '\n' +
    (phone ? 'Telèfon: ' + phone + '\n' : '') +
    (notes ? 'Motiu: ' + notes + '\n' : '') +
    'Idioma preferit: ' + (lang === 'ca' ? 'Valencià' : 'Castellà') + '\n' +
    (meetLine ? 'Enllaç de la videotrucada: ' + meetLine + '\n' : ''),
    { from: fromAddr }
  );
}

function getAvailabilityCalendar() {
  var cals = CalendarApp.getCalendarsByName(AVAILABILITY_CAL_NAME);
  return cals.length > 0 ? cals[0] : null;
}

function toDateStr(d) {
  return d.getFullYear() + '-' + padTwo(d.getMonth() + 1) + '-' + padTwo(d.getDate());
}

function padTwo(n) {
  return n < 10 ? '0' + n : '' + n;
}
