// const crypto = require('crypto')

// function sample () {
//     const user = this
//     console.log(user)
//     var resetPasswordToken = crypto.randomBytes(20).toString('hex')
//     console.log(resetPasswordToken)
//     var resetPasswordExpires = Date.now() + 3600000 //expires in an hour
//     console.log(resetPasswordExpires)
// }

// sample()
var os = require('os')
var hostaddress = os.hostname()

console.log(hostaddress)