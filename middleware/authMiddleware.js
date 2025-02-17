const authMiddleware = (req, res, next) => {
  const { email } = req.headers;

  if (!email) {
    return res.status(401).send({ error: 'Access denied. No email provided.' });
  }

  req.user = { email }; 
  next();
};

module.exports = authMiddleware;