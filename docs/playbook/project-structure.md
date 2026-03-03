# Project Structure

## Vocabulary
- Feature module: domain folder in `src/features/*`
- Page shell: route-level orchestrator under `src/pages` or `src/app/routes`
- UI state: local interaction state in Zustand
- Server state: query/repository-backed data state
- Repository: typed data contract + adapter implementation
- Guard: route-level policy check
- Policy: request/response interceptor or feature flag decision

## Onboarding Map
- Add components: `src/features/<domain>` or `src/shared/ui`
- Add routes: `src/app/router.tsx` + `src/app/routes/*`
- Add policies: `src/app/middleware/*` and `src/shared/lib/interceptors.ts`
- Add tests: colocated `*.test.ts(x)` and e2e specs in `e2e/`