import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secure_jwt_secret_key';

export default async function auth(req, res, next) {
  try {

    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Missing token' });
    }
    const { verify } = jwt;
    console.log('Verifying token:', token);
    const decoded = verify(token, JWT_SECRET);
    console.log('Decoded token:', decoded);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    console.log('Authenticated user:', user.username);
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Unauthorized' });
  }
};
