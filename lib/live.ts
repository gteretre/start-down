import "server-only";

import { defineLive } from "next-sanity";
import { client } from "./client";
export const { sanityFetch, sanityLive } = defineLive(client);
