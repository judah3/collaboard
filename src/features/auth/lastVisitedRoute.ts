const LAST_VISITED_ROUTE_KEY = "pm_last_visited_route";
const DASHBOARD_ROUTE = "/dashboard";

const PUBLIC_ROUTES = new Set(["/login", "/register"]);

const isValidRoute = (value: string | null | undefined): value is string => {
  if (!value) {
    return false;
  }

  return value.startsWith("/") && !value.startsWith("//");
};

const isPublicRoute = (path: string) => PUBLIC_ROUTES.has(path);

export const isProjectRoute = (path: string | null | undefined) => isValidRoute(path) && path.startsWith("/projects/");

export const saveLastVisitedRoute = (path: string) => {
  if (!isValidRoute(path)) {
    return;
  }

  const [pathname] = path.split(/[?#]/);
  if (!pathname || pathname === "/" || isPublicRoute(pathname)) {
    return;
  }

  localStorage.setItem(LAST_VISITED_ROUTE_KEY, path);
};

export const getLastVisitedRoute = () => {
  const stored = localStorage.getItem(LAST_VISITED_ROUTE_KEY);
  if (!isValidRoute(stored)) {
    return null;
  }

  const [pathname] = stored.split(/[?#]/);
  if (!pathname || pathname === "/" || isPublicRoute(pathname)) {
    return null;
  }

  return stored;
};

export const getDefaultRoute = () => getLastVisitedRoute() ?? DASHBOARD_ROUTE;
