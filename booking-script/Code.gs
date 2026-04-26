// ============================================================
// Configuración — ajustar si cambia la cuenta de Google
// ============================================================
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
      result = { availableDays: getAvailableDays(year, month) };

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

function getAvailableDays(year, month) {
  var availCal = getAvailabilityCalendar();
  if (!availCal) return [];

  var start = new Date(year, month - 1, 1);
  var end = new Date(year, month, 1);
  var availEvents = availCal.getEvents(start, end);

  var today = new Date();
  today.setHours(0, 0, 0, 0);

  // Collect unique days that have at least one availability event
  var daysSet = {};
  availEvents.forEach(function(ev) {
    var d = new Date(ev.getStartTime());
    d.setHours(0, 0, 0, 0);
    if (d >= today) {
      daysSet[toDateStr(d)] = true;
    }
  });

  // Keep only days that still have free slots
  var result = [];
  Object.keys(daysSet).forEach(function(dateStr) {
    if (getSlotsForDay(dateStr).length > 0) {
      result.push(dateStr);
    }
  });

  return result.sort();
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

  var now = new Date();

  return allSlots.filter(function(slotStart) {
    // Skip slots in the past
    if (slotStart <= now) return false;

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

  var description = [];
  if (phone) description.push('Telèfon: ' + phone);
  if (notes) description.push('Motiu: ' + notes);
  description.push('Idioma preferit: ' + (lang === 'ca' ? 'Valencià' : 'Castellà'));

  var primaryCal = CalendarApp.getDefaultCalendar();
  primaryCal.createEvent('Primera Cita — ' + name, startTime, endTime, {
    description: description.join('\n')
  });

  sendConfirmationEmail(name, email, date, time, lang);

  return { ok: true };
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

function sendConfirmationEmail(name, email, date, time, lang) {
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

  if (lang === 'ca') {
    MailApp.sendEmail({
      to: email,
      subject: 'Cita confirmada — Llavors Logopèdia',
      body:
        'Hola ' + name + ',\n\n' +
        'La teua primera cita amb Àngela Alonso està confirmada.\n\n' +
        '📅 ' + weekdaysCa[wd] + ', ' + d + ' de ' + monthsCa[m] + ' de ' + y + ' a les ' + time + '–' + endStr + '\n' +
        '⏱ Durada: 30 minuts\n\n' +
        'Si necessites canviar o cancel·lar la cita, posa\'t en contacte\n' +
        'a través de logopeda.angela@gmail.com o WhatsApp.\n\n' +
        'Fins aviat,\nÀngela Alonso — Llavors Logopèdia'
    });
  } else {
    MailApp.sendEmail({
      to: email,
      subject: 'Cita confirmada — Llavors Logopèdia',
      body:
        'Hola ' + name + ',\n\n' +
        'Tu primera cita con Àngela Alonso está confirmada.\n\n' +
        '📅 ' + weekdaysEs[wd] + ', ' + d + ' de ' + monthsEs[m] + ' de ' + y + ' a las ' + time + '–' + endStr + '\n' +
        '⏱ Duración: 30 minutos\n\n' +
        'Si necesitas cambiar o cancelar la cita, contacta a través\n' +
        'de logopeda.angela@gmail.com o WhatsApp.\n\n' +
        'Hasta pronto,\nÀngela Alonso — Llavors Logopèdia'
    });
  }
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
