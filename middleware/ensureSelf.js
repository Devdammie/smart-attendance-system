
// Middleware to ensure students can only access their own resources
 function ensureSelf(req, res, next) {
  if (req.user.id !== req.params.studentId) {
    return res.status(403).json({ message: 'Forbidden: You can only access your own resources.' });
  }
  next();
}

export { ensureSelf };

// Middleware to ensure lecturers can only access their own resources