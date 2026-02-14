import jwt from 'jsonwebtoken';

//  Auth Middleware

export const authMiddleware = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        // check if Authorization header exists
        if(!authHeader ) {
            return res.status(401).json({
                error: 'No token provided. Please login.'
            });
        }

        if(!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Invalid token format. Use: Bearer <token>'
            });
        }
        const token = authHeader.split(' ')[1];
        // check if token is empty
        if(!token) {
            return res.status(401).json({
                error: 'Token is empty. Please login.'
            });
        }
        //  Verify token signature and decode payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach userId to request object
        req.userId = decoded.userId;
        console.log('Token verified for user:', decoded.userId);
        //  Continue to next middleware or route handler
        next();
    } catch (error) {
        if(error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Invalid token. Please login again'
            });
        }
        if(error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expired. Please login again'
            });
    }
    console.error('Auth Middleware error:' , error);
    return res.status(401).json({
        error: 'Authentication failed. Please login.'
    });
  }
};