# Architecture Notes

The structure is intentionally simple for a three-person hackathon team.

## Workspace Split

- `apps/web`: frontend only
- `apps/api`: backend and database access only
- `docs/*`: shared reference for contracts and schema decisions

## Team Split Recommendation

- Person 1: `apps/web`
- Person 2: `apps/api/src/modules`
- Person 3: `apps/api/src/db` plus integration support

## Rule

Frontend and backend should coordinate through documented API shapes, not by sharing runtime code or TypeScript types.
