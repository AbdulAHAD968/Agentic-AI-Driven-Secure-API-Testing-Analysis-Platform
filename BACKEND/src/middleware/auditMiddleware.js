const AuditLog = require("../models/AuditLog");


exports.audit = (action) => {
  return async (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function (data) {
      const log = {
        user: req.user ? req.user.id : null,
        action: action,
        resource: req.baseUrl + req.path,
        resourceId: req.params.id || null,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        status: res.statusCode >= 400 ? "failure" : "success",
        details: res.statusCode >= 400 ? data.message : "Action completed successfully",
      };

      
      AuditLog.create(log).catch(err => console.error("Audit log failed", err));
      
      return originalJson.call(this, data);
    };

    next();
  };
};
