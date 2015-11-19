var fms = require('fms')
fms.run({
    port: 3005,
    static: "./output",
    read: ['view','modules']
})