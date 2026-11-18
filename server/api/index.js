let app;
let initError = null;

try {
  const mod = await import("../app.js");
  app = mod.default || mod;
} catch (err) {
  console.error("[FATAL] Backend initialization failed in server/api/index.js:", err);
  initError = err;
}

export default async function handler(req, res) {
  if (initError || !app) {
    console.error("[FATAL Handler] Serving initialization error response:", initError);
    return res.status(500).json({
      success: false,
      message: "Backend Initialization Error",
      error: initError ? initError.message : "App failed to load",
      stack: process.env.NODE_ENV === "production" ? undefined : initError?.stack,
    });
  }

  try {
    return app(req, res);
  } catch (runtimeErr) {
    console.error("[FATAL Handler] Unhandled runtime error:", runtimeErr);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: runtimeErr.message,
      });
    }
  }
}
