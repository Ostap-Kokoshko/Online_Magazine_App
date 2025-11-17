const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = decoded.sub;
            next();
        } catch (error) {
            res.status(401).json({ msg: 'Token is not valid' });
        }
    }
    if (!token) {
        res.status(401).json({ msg: 'No token, authorization denied' });
    }
};

const optionalAuth = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded.sub;
        } catch (error) {
        }
    }
    next();
};

const editorOnly = (req, res, next) => {
    if (req.user.role === 'admin' || req.user.role === 'editor') {
        next();
    } else {
        res.status(403).json({ msg: 'Доступ заборонено. Потрібні права редактора.' });
    }
};

const adminOnly = (req, res, next) => {

    if (req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ msg: 'Доступ заборонено. Потрібні права адміністратора.' });
    }
};

module.exports = { protect, optionalAuth, editorOnly, adminOnly };