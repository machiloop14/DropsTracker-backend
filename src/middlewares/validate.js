const validateSchema = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      errors: result.error.issues.map((err) => ({
        path: err.path,
        message: err.message,
      })),
    });
  }

  // Optional: Replace req.body with the validated (and potentially transformed) data
  req.validatedData = result.data;
  next();
};

export default validateSchema;
