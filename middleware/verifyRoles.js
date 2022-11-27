const session = require("express-session");

const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req?.session.user.roles) return res.sendStatus(401);
        const rolesArray = [...allowedRoles];
        const result = req.session.user.roles.map(role => rolesArray.includes(role)).find(val => val === true);
        if (!result)  return res.redirect("/access-denied");
        next();
    }
}

module.exports = verifyRoles;