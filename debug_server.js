const fs = require('fs');
try {
    console.log("Loading server...");
    require('./src/server');
    console.log("Success");
} catch (e) {
    console.error("Caught error");
    fs.writeFileSync('error_full.log', e.stack || e.toString());
}
