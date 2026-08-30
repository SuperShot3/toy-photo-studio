export default {
  fetch() {
    return Response.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  },
};
