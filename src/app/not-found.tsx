import { NotFoundState } from "@/components";

function NotFoundPage() {
  return (
    <NotFoundState
      title="This page does not exist"
      description="We looked everywhere but couldn't find the page you requested. Please check the URL or head back to the dashboard."
      primaryAction={{ label: "Go to dashboard", href: "/" }}
    />
  );
}

export default NotFoundPage;
