const nodemailer = require("nodemailer");


let sendMail = async function(email,id){

    let url ='http://localhost:3000/confirmEmail/'+id
    
    console.log(url) 

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASSWORD
      }
    });

    var mailOptions = {
        from: process.env.USER_EMAIL,
        to: email,
        subject: 'Verify your email',
        html: 'hai Welcome! <br> <a href="'+url+'" target="_blank">Verify your email</a>',
        
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = sendMail

/*const sgmail = require('@sendgrid/mail')
module.exports = {
    sendMail,
  };

sgmail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail =(email)=>{
    sgmail.send({
        to: email,
        from: 'smartkirthi1997@gmail.com',
        subject: 'thanks for register and login link',
        text: 'you can login by using this url'
    })
}

module.exports ={
    sendWelcomeEmail
}*/