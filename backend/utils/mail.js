const nodemailer = require("nodemailer");

exports.generateOTP = () => {
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += Math.round(Math.random() * 9);
  }
  return otp;
};

exports.mailTransport = () =>
  nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAILTRAP_USERNAME,
      pass: process.env.MAILTRAP_PASSWORD,
    },
  });

exports.generateEmailTemplate = (code) => {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
    @media only screen and (max-width: 700px){
    h1{
    font-size:20px;
    padding:5px
    }
    }
    </style>

    
</head>
<body>
<div>
   <div style="max-width: 620px; margin: 0 auto; font-family: sans-serif; color: #272727;">
    <h1 style = "background: #f6f6f6; padding: 10px; text-align: center;
    color: #272727;">We are delighted to welcome you to our family!</h1>

    <p> Verify Your Email To continue Your Verification code is: </p>

    <p style="background: #f6f6f6; text-align: center; font-weight: bold;
    width:150px; margin: 0 auto; font-size:25px; border-radius: 5px;  ">${code}</p>
</div>
</div>
   </body>
</html>`;
};

exports.plainEmailTemplate = (heading, message) => {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
    @media only screen and (max-width: 620px){
    h1{
    font-size:20px;
    padding:5px
    }
    }
    </style>

    
</head>
<body>
<div>
   <div style="max-width: 620px; margin: 0 auto; font-family: sans-serif; color: #272727;">
    <h1 style = "background: #f6f6f6; padding: 10px; text-align: center;
    color: #272727;">${heading}</h1>

    <p style="color: #272727; text-align: center;">${message}</p>
</div>
</div>
   </body>
</html>`;
};
