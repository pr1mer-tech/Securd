import { inngest } from "@/lib/inngest/client";
import { analyticsRoutine } from "@/lib/inngest/routines/analytics";
import { serve } from "inngest/next";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        analyticsRoutine,
    ],
});