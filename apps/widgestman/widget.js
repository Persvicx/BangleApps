// run the widget in it's own scope
(() => {
  const STORAGE_FILE = '.aigesture';

  let active = require('Storage').read(STORAGE_FILE) !== '0';

  function setActive(newState) {
    active = newState;
    require('Storage').write(STORAGE_FILE, active ? '1' : '0');
  }

  const imgOn = atob('FBSBAAAAAAwMAMxgbMIGzYBs2AbNgGzYBs2AbNhmzYfgGD4Bg+AYEgGBgBjcAYzgGHf/gT/w');
  const imgOff = atob('FBSBAAAAAAwMQMxubMIyzYGM2BzNgOzYBw2AeNgHzYJmGPYxh+OYPhyBIODYBwzAOHP/wR/w');

  function onGesture(gesture) {
    if (!active || Bangle.isLocked()) return;

    if (gesture === 'StraightRightRight') {
      require('Storage').write('.quickView', '1');
      load('schsched.app.js');
    } else if (gesture === 'StraightRightUpUp') {
      load();
    }
  }

  Bangle.on('aiGesture', onGesture);

  WIDGETS['aigesture'] = {
    area: 'tr',
    width: 24,
    draw: function() {
      g.reset();
      g.clearRect(this.x, this.y, this.x + this.width - 1, this.y + 23);
      g.drawImage(active ? imgOn : imgOff, this.x + 2, this.y + 2);
    }
  };

  Bangle.on('touch', (button, xy) => {
    if (!xy) return;
    const w = WIDGETS['aigesture'];
    if (w && xy.x >= w.x && xy.x <= w.x + w.width && xy.y >= w.y && xy.y <= w.y + 24) {
      setActive(!active);
      w.draw();
      Bangle.buzz(50);
    }
  });
})();