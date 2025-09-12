var Storage = require("Storage");

// ---------- Time Helper ----------
function classStatus(startStr, endStr) {
  function parseHM(str) {
    var parts = str.split(":");
    return { h: parseInt(parts[0]), m: parseInt(parts[1]) };
  }

  var now = new Date();
  var start = parseHM(startStr);
  var end = parseHM(endStr);

  var startDate = new Date(now.getTime());
  startDate.setHours(start.h, start.m, 0, 0);

  var endDate = new Date(now.getTime());
  endDate.setHours(end.h, end.m, 0, 0);

  if (now < startDate) {
    var mins = Math.round((startDate - now) / 60000);
    return "Starts in " + mins + " minute" + (mins==1?"":"s");
  } else if (now >= startDate && now <= endDate) {
    var mins = Math.round((endDate - now) / 60000);
    return mins + " minute" + (mins==1?"":"s") + " left";
  } else {
    var mins = Math.round((now - endDate) / 60000);
    return "Ended " + mins + " minute" + (mins==1?"":"s") + " ago";
  }
}

// ---------- Build Menus ----------
var mainmenu = {
  "" : { title : "School Tools" },
  "All Classes" : function() {
    var classData = Storage.readJSON("schtool.json",1);

    if (!classData || !classData.length) {
      // No data, show warning alert
      E.showAlert(
        "There is no information about your classes yet.\n\nPlease go back to the app loader and add some if you plan to use this.",
        "No Class Data"
      ).then(()=>E.showMenu(mainmenu));
      return;
    }

    // Sort by ClassIndex
    classData.sort((a,b)=>a.ClassIndex-b.ClassIndex);

    var schooltimes = {
      "" : { title : "All Classes", back : function() { E.showMenu(mainmenu); } }
    };

    // Create menu entries dynamically
    classData.forEach(c=>{
      var label = c.ClassName + " (" + c.Time[0] + "-" + c.Time[1] + ")";
      schooltimes[label] = function() {
        var status = classStatus(c.Time[0], c.Time[1]);
        var body = c.Time[0] + " - " + c.Time[1] + "\n";
        if (c.ClassTeaches) body += c.ClassTeaches + "\n";
        if (c.Teacher) body += c.Teacher + "\n";
        if (c.TeacherEmail) body += c.TeacherEmail + "\n";
        if (c.Room) body += "Room " + c.Room + "\n";

        if (c.ExtraData && c.ExtraData.trim()) {
          body += "\n" + c.ExtraData + "\n";
        }

        body += "\n" + status;

        E.showPrompt(body, {
          title : c.ClassName + " Info",
          buttons : { "Ok" : 1 }
        }).then(()=>E.showMenu(schooltimes));
      };
    });

    // Show the submenu
    E.showMenu(schooltimes);
  },
  "Chromebook Shortcuts" : function() {
    E.showAlert("You need to be emulating a keyboard with bluetooth connected for this to work.\n \nThese might only work on chromebooks.", "Notice").then(() => {
      E.showMenu(test2menu);
    });
  }
};

// ---------- Test 2 Submenu ----------
var test2menu = {
  "" : { 
    title : "Chromebook Shortcuts", 
    back : function() { E.showMenu(mainmenu); }
  },
  "Alternate current focused window" : function() {},
  "Move current window to the left" : function() {},
  "Move current window to the right" : function() {},
  "Float current window" : function() {},
  "Unfloat current window" : function() {},
  "Spin current window\n(yes, this is real.)" : function() {},
  "Fullscreen" : function() {},
  "Previous Tab" : function() {},
  "Next Tab" : function() {},
  "Maximize" : function() {},
  "Minimize" : function() {},
  "New Tab" : function() {},
  "Close Tab" : function() {},
  "New Window" : function() {},
  "Close Window" : function() {},
  "Desks" : function() {},

};

// Start menu
E.showMenu(mainmenu);
