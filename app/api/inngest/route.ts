import { inngest } from "@/lib/inngest/client";
import { analyticsRoutine } from "@/lib/inngest/routines/analytics";
import { serve } from "inngest/next";

// Can be 'nodejs', but Vercel recommends using 'edge'
export const runtime = 'edge';
// Prevents this route's response from being cached
export const dynamic = 'force-dynamic';
// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        analyticsRoutine,
    ],
    streaming: "force",
});