import { handleJsonPost } from "./_http";

export const maxDuration = 60;

export default {
  async fetch(request: Request) {
    if (request.method !== "POST") {
      return Response.json({ error: "Method not allowed." }, { status: 405 });
    }

    try {
      const { runGeneratePhoto } = await import("../server/apiHandlers");
      return await handleJsonPost(request, runGeneratePhoto);
    } catch (error: unknown) {
      console.error("generate-photo failed:", error);
      const message = error instanceof Error ? error.message : "Server error.";
      return Response.json({ error: message }, { status: 500 });
    }
  },
};
