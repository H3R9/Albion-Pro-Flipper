const fs = require('fs');
fetch('https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/master/buildings.xml')
  .then(res => res.text())
  .then(text => fs.writeFileSync('/tmp/buildings.xml', text));
