if there ever comes a need to do sudo operations like apt or encounter an error when installing or running a sevice which requires a password, my pasword is kali 
also when creating a password use kali 


two features online video confrencing multiple with upto 500 people per meeting 
ai
improvement in messaging,\
mpesa billing
follow functionality 
http custom files only admin uploaads
add multiple ways to have supabase and cloudinary accounts
remove the system popups and replac ethem to be in app notifications 

patch up all other exposion of data
mobile app

safaricom mpesa billing 
 *** Authorization Request in NodeJS ***|
 
var unirest = require("unirest");
var req = unirest("GET", "https://sandbox.safaricom.co.ke/oauth/v1/generate");
 
req.query({
 "grant_type": "client_credentials"
});
 
req.headers({
 "Authorization": "Basic SWZPREdqdkdYM0FjWkFTcTdSa1RWZ2FTSklNY001RGQ6WUp4ZVcxMTZaV0dGNFIzaA=="
});
 
req.end(res => {
 if (res.error) throw new Error(res.error);
 console.log(res.body);
});