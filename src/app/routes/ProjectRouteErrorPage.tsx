import { AlertTriangle } from "lucide-react";
import { Link, useRouteError } from "react-router-dom";
import { Button } from "@/shared/ui/Button";

export const ProjectRouteErrorPage = () => {
  const error = useRouteError();
  const isResponseError = error instanceof Response;

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h1 className="text-base font-semibold text-slate-900">
          {isResponseError ? `Error ${error.status}` : "Something went wrong"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {isResponseError ? error.statusText || "Unable to load this project." : "Unexpected error while loading project."}
        </p>
        <div className="mt-4 flex justify-center">
          <Link to="/projects/mad-dogs-portal/board">
            <Button variant="primary">Back to Board</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};