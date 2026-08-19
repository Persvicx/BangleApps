Bangle.loadWidgets();
Bangle.drawWidgets();

let classes = [];

function loadSchedule() {
  try {
    const txt = require("Storage").read("schsched.json");
    if (!txt) {
      E.showAlert("No schedule data found!", "Error").then(() => load());
      return;
    }
    const data = JSON.parse(txt);
    classes = data.classes || [];

    classMainMenu();
  } catch (e) {
    E.showAlert("Failed to load schedule!", "Error").then(() => load());
  }
}

function parseHM(t) {
  const parts = t.split(":");
  const h = parseInt(parts[0]);
  const m = parseInt(parts[1]);
  return h * 60 + m;
}

function getStatus(start, end) {
  const now = Date().getHours() * 60 + Date().getMinutes();

  if (now < start) {
    return { msg: "in " + (start - now) + "min", diff: start - now };
  }
  if (now > end) {
    return { msg: "" + (now - end) + "min ago", diff: now - end };
  }
  return { msg: "end in " + (end - now) + "min", diff: end - now };
}

function showClassDetails(c) {
  require("widget_utils").hide();

  const start = parseHM(c.start);
  const end = parseHM(c.end);
  const st = getStatus(start, end);

  let text =
    c.name + "\n" +
    (c.room ? "Room: " + c.room + "\n" : "") +
    c.start + "-" + c.end + "\n" +
    c.teacher + "\n" +
    st.msg + "\n" +
    (c.extra || "");

  E.showPrompt(text, { title: "", buttons: { "Ok": 1 } })
    .then(() => classMainMenu());
}

function buildMenu() {
  const menu = {
    "" : { title: "Classes" },
    '< Back': () => load(),
  };

  classes.forEach(function(c) {
    const start = parseHM(c.start);
    const end = parseHM(c.end);
    const st = getStatus(start, end);

    const label =
      c.name + ", " + st.msg + "\n" + c.start + "-" + c.end;

    menu[label] = function() {
      showClassDetails(c);
    };
  });

  return menu;
}

function classMainMenu() {
  require("widget_utils").show();
  E.showMenu(buildMenu());
}

loadSchedule();