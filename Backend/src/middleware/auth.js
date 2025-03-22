const jwt = require("jsonwebtoken");

// Middleware to Verify Token from Cookie
exports.authenticateUser = async (req, res, next) => {
  try{
    //extract token
    const token = req.cookies.token 
                    || req.body.token 
                    || req.header("Authorisation").replace("Bearer ", "");

    //if token missing, then return response
    if(!token) {
        return res.status(401).json({
            success:false,
            message:'TOken is missing',
        });
    }

    //verify the token
    try{
        const decode =  jwt.verify(token, process.env.JWT_SECRET);
        req.user = decode;
    }
    catch(err) {
        //verification - issue
        return res.status(401).json({
            success:false,
            message:'token is invalid',
        });
    }
    next();
}
catch(error) {  
    return res.status(401).json({
        success:false,
        message:'Something went wrong while validating the token',
    });
}
};

// Middleware to Allow Only Admins
exports.isAdmin = async (req, res, next) => {
  if (!req.user || req.user.role !== "Admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

// Middleware to Allow Only Users
exports.isUser = async (req, res, next) => {
  if (!req.user || req.user.role !== "User") {
    return res.status(403).json({ message: "Access denied. Users only." });
  }
  next();
};
