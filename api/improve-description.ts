import { handleJsonPost } from "./_http.js";

export const maxDuration = 60;

export default {
  async fetch(request: Request) {
    if (request.method !== "POST") {
      return Response.json({ error: "Method not allowed." }, { status: 405 });
    }

    try {
      const { runImproveDescription } = await import("../server/apiHandlers.js");
      return await handleJsonPost(request, runImproveDescription);
    } catch (error: unknown) {
      console.error("improve-description failed:", error);
      const message = error instanceof Error ? error.message : "Server error.";
      return Response.json({ error: message }, { status: 500 });
    }
  },
};
