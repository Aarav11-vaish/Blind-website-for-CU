import jwt from 'jsonwebtoken';

export const authmiddleware = (req, res, next) => {
    try {
        const authheader = req.headers.authorization;
        //what will authheader have ->bearer token
        if (!authheader) {
            return res.status(401).json({ message: "Authorization failed" })
        }
        const token = authheader.split(" ")[1];//[bearer ,token]

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;//attach user info to req object
        next();
    }
    catch (err) {
        res.status(401).json({ message: "Authorization failed" })
    }
}