import { defineApp } from "convex/server";
import aggregate from "@convex-dev/aggregate/convex.config.js";

const app = defineApp();
app.use(aggregate, { name: "subscriberCount" });
app.use(aggregate, { name: "monitorCount" });
app.use(aggregate, { name: "scheduleCount" });
app.use(aggregate, { name: "incidentCount" });
export default app;
