import { handlers } from "@/auth";

if (!handlers.GET || !handlers.POST) {
  throw new Error("GET or POST handler is missing in handlers object");
}

export const { GET, POST } = handlers;
