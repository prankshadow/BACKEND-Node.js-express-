const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../config')


const fetchuser = (req, res, next) => {

    //Get the user from the jwt token adn add id to request
    const token = req.header('authentication'); //auth-token given name to the header
    if (!token) {
        res.status(401).send({ error: "Please authenticate with the valid token" })
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();  //this is the called after this function i.e fetchuser runned succesfully
    } catch (error) {
        res.status(401).send({ error: "Please authenticate with the valid token" })
    }
}

module.exports = fetchuser;