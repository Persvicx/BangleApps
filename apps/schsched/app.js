Bangle.loadWidgets();
Bangle.drawWidgets();

let classes = [];

function loadSchedule() {
  try {
    const txt = require('Storage').read('schsched.json');
    if (!txt) {
      E.showAlert('No schedule data found!', 'Error').then(() => load());
      return;
    }
    const data = JSON.parse(txt);
    classes = data.classes || [];

    if (require('Storage').read('.quickView')) {
      require('Storage').erase('.quickView');
      showClassQuickView();
    } else {
      classMainMenu();
    }
  } catch (e) {
    E.showAlert('Failed to load schedule!', 'Error').then(() => load());
  }
}

function parseHM(t) {
  const parts = t.split(':');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  return h * 60 + m;
}

function getStatus(start, end, verbose) {
  const d = new Date();
  const now = d.getHours() * 60 + d.getMinutes();

  if (now < start) {
    const mins = start - now;
    return {
      msg: verbose ? 'Starts in ' + mins + ' mins.' : 'in ' + mins + 'min',
      diff: mins
    };
  }
  if (now > end) {
    const mins = now - end;
    return {
      msg: verbose ? '' + mins + ' mins ago.' : '' + mins + 'min ago',
      diff: mins
    };
  }
  const mins = end - now;
  return {
    msg: verbose ? 'Ends in ' + mins + ' mins.' : 'end in ' + mins + 'min',
    diff: mins
  };
}

function getCurrentClass() {
  const d = new Date();
  const now = d.getHours() * 60 + d.getMinutes();
  return classes.find(c => {
    const start = parseHM(c.start);
    const end = parseHM(c.end);
    return now >= start && now <= end;
  });
}

function getNextClass() {
  if (classes.length === 0) return undefined;

  const d = new Date();
  const now = d.getHours() * 60 + d.getMinutes();

  const upcomingToday = classes
    .filter(c => parseHM(c.start) > now)
    .sort((a, b) => parseHM(a.start) - parseHM(b.start));

  if (upcomingToday.length > 0) {
    return upcomingToday[0];
  }

  const sortedClasses = classes.slice().sort((a, b) => parseHM(a.start) - parseHM(b.start));
  return sortedClasses[0];
}

function showClassQuickView() {
  let c = getCurrentClass();

  if (!c) {
    c = getNextClass();
  }

  if (!c) {
    classMainMenu();
    return;
  }

  const start = parseHM(c.start);
  const end = parseHM(c.end);
  const st = getStatus(start, end, true);

  const text =
    c.name + '\n' +
    c.start + '-' + c.end + '\n' +
    st.msg;

  E.showPrompt(text, {
    buttons: { 'Ok': 1, 'Upd': 2, 'Open': 3 }
  }).then((v) => {
    if (v === 1) {
      load();
    } else if (v === 2) {
      showClassQuickView();
    } else if (v === 3) {
      classMainMenu();
    }
  });
}

function showClassDetails(c) {
  require('widget_utils').hide();

  const start = parseHM(c.start);
  const end = parseHM(c.end);
  const st = getStatus(start, end);

  const text =
    c.name + '\n' +
    (c.room ? 'Room: ' + c.room + '\n' : '') +
    c.start + '-' + c.end + '\n' +
    c.teacher + '\n' +
    st.msg + '\n' +
    (c.extra || '');

  E.showPrompt(text, { title: '', buttons: { 'Ok': 1 } })
    .then(() => classMainMenu());
}

function buildMenu() {
  const menu = {
    '': { title: 'Classes' },
    '< Back': () => load()
  };

  classes.forEach(function(c) {
    const start = parseHM(c.start);
    const end = parseHM(c.end);
    const st = getStatus(start, end);

    const label =
      c.name + ', ' + st.msg + '\n' + c.start + '-' + c.end;

    menu[label] = function() {
      showClassDetails(c);
    };
  });

  return menu;
}

function classMainMenu() {
  require('widget_utils').show();
  E.showMenu(buildMenu());
}

loadSchedule();