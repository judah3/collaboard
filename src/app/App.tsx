import { RouterProvider } from "react-router-dom";
import { AppProviders } from "@/app/providers";
import { AuthProvider } from "@/features/auth";
import { router } from "@/app/router";

export const App = () => (
  <AppProviders>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </AppProviders>
);
