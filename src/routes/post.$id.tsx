import { createFileRoute, redirect } from "@tanstack/react-router";

// Old links keep working: /post/<uuid> → /fx/<code>
export const Route = createFileRoute("/post/$id")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/fx/$code", params: { code: params.id.slice(0, 8) }, statusCode: 301 });
  },
});
