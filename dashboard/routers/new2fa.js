const express = require("express");
const router = express.Router();
const speakeasy = require("speakeasy");
const QRCode = require('qrcode');
const users = require("./login_uit").Loginschema;
const generateSecret = require("../functions/genSecret");

router.get('/auth/2fa', async (req, res) => {
        const username = req.session.user.username;
        console.log(`Username: ${username}`);
        const user = await users.findOne({ username: username }).exec();
        try {

        if (user.tweefa === false) {

        
        const secret = generateSecret();
  
        
        if (!user) {
            console.log("User not found");
            res.redirect("/login");
            return;
        }
        
        user.secret = secret.base32;
        user.tweefa = true
        user.save()
        console.log(`User Sec.: ${user.secret}, Gen Sec.: ${secret.base32}`);
        
        const otpauth_url = speakeasy.otpauthURL({
            secret: secret.base32,
            label: "Dashboard - MT",
            issuer: "Monstertube",
            encoding: "base32"
        });
        console.log(`OTPAuth URL: ${otpauth_url}`);

        QRCode.toDataURL(otpauth_url, (err, qrUrl) => {
            if (err) {
                console.error("Error generating QR Code:", err);
                return res.status(500).json({
                    status: 'fail',
                    message: "Error while generating QR Code"
                });
            }
            res.render("auth/2fa/2fa", { data: {
                qrCodeUrl: qrUrl,
                secret: secret.base32
            }});
        });
    } else {
        res.redirect("/dashboard")
    }
    } catch (error) {
        console.error("Error in 2FA route:", error);
        res.status(500).json({
            status: 'error',
            message: "Internal server error"
        });
    }
    
});

router.get('/verify-2fa', async (req, res) => {
    try {
        const token = req.query.token;
        const username = req.session.user.username;
        console.log(`Token received: ${token}`);
        console.log(`Username: ${username}`);
        
        const user = await users.findOne({ username: username }).exec();
        if (!user ) {
            console.log("User not found");
            res.redirect("/login");
            return;
        }

        console.log(`User secret: ${user.secret}`);
        const verified = speakeasy.totp.verify({
            secret: user.secret,
            encoding: 'base32',
            token: token,
        });
        console.log(`Verified: ${verified}`);
        
        if (verified) {
            console.log("Authentication successful");
       res.redirect("/dashboard")
        } else {
            console.log("Authentication failed");
            res.redirect("/auth/2fa")
        }
    } catch (error) {
        console.error("Error in 2FA verification route:", error);
        res.status(500).json({
            status: 'error',
            message: "Internal server error"
        });
    }
});

router.get('/2fa/login', async (req, res) => {
    res.render("auth/2fa/login")
})
router.post("/2fa/login", async (req, res) => {
    const token = req.body.token
    const username = req.session.user.username
    const user = await users.findOne({ username: username }).exec();
    if (!user) {
        console.log("User not found");
        res.redirect("/login");
        return;
    }
    const verified = speakeasy.totp.verify({
        secret: user.secret,
        encoding: 'base32',
        token: token,
    });

    if (verified) {
        res.redirect("/dashboard")
    } else {
        res.redirect("/login")
    }

})


module.exports = router;
