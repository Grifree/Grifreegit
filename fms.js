var fms = require('fms')
fms.run({
    port: 3008,
    static: "./output",
    read: ['view','modules']
})