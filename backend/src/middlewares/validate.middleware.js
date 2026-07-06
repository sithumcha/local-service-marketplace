// Custom schema-less validation runner middleware to validate body requests
export const validateBody = (validatorFn) => {
  return (req, res, next) => {
    if (typeof validatorFn !== 'function') {
      return next();
    }

    const errorMessage = validatorFn(req.body);
    if (errorMessage) {
      return res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }
    
    next();
  };
};
