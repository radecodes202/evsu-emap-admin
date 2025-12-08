# IT 313 Final Project - Presentation Prep (DB Focus)

## Demo Flow (fast)
1) Login security (admin vs user) → protected routes.
2) Buildings/Rooms/Paths CRUD → show map + rotation.
3) Audit trail → create/update/delete then show new log.
4) Feedback → submit as user, update as admin.
5) Help/About → quick mention.

## Database Talking Points
- Schema: buildings, locations (rooms), routes (paths), waypoints, admin_users, user_feedback, audit_logs.
- Normalization: separate entities; FKs with cascade where appropriate.
- Constraints: NOT NULL on required fields; unique building code; enums/checks for category/path_type/status/priority (DB-side if set).
- Indexes: PKs; FKs (route_id, building_id, user_id); filter columns (category, path_type, status); unique on building code.
- Security: app-level RBAC; form validation; parameterized queries via Supabase; propose RLS for production.
- SQL Injection: avoided via Supabase client (no string concat).

## Advanced SQL Features (highlight)
- Triggers: audit log (describe or plan).
- Views: suggest routes_with_waypoint_counts or buildings_with_room_counts.
- Functions/Procedures/RPC: note planned for batch waypoint ops or distance calc.
- Subqueries: counts for rooms/waypoints.

## Transaction Management
- Multi-step ops (route + waypoints) should be transactional; Supabase/Postgres supports wrapping inserts.
- Concurrency: note future optimistic locking if asked.

## Indexing & Optimization
- Ensure indexes on FK/filter columns and unique codes.
- Mention EXPLAIN usage if questioned.

## What to show live (DB-centric)
- Schema overview/ER (verbal or slide).
- Filtered queries: paths by type; buildings by category; rooms by building+type.
- Audit logs: create/edit/delete then refresh logs.
- Optional view/SQL snippet for counts.

## SQL Snippets (handy)
Rooms per building:
```sql
select b.code, count(r.id) as room_count
from buildings b
left join locations r on r.building_id = b.id
group by b.code;
```
Paths with waypoint counts:
```sql
select p.id, p.path_name, p.path_type, count(w.id) as waypoints
from routes p
left join waypoints w on w.route_id = p.id
group by p.id, p.path_name, p.path_type;
```
Recent audit entries:
```sql
select action_type, entity_type, user_email, created_at
from audit_logs
order by created_at desc
limit 10;
```

## Grading Criteria Mapping
- Database Design (20%): schema, FKs, constraints, normalization, unique codes.
- Security (25%): RBAC, validation, parameterized queries, audit logging; propose RLS.
- Advanced SQL (15%): triggers (audit), views, functions/RPC (planned), subqueries.
- Transactions (15%): describe wrapping multi-step ops; note concurrency handling.
- Indexing (10%): FK/filter indexes, unique code index.
- Presentation (15%): clear demo; show audit + feedback loop; acknowledge gaps.

## Seed/Test Data to prep
- 2+ buildings (distinct categories); rooms per building (varied types).
- 2–3 paths with 3+ waypoints each.
- Feedback entries with varied status/priority.
- Ensure audit log entries appear after demo actions.

## Risks / Gaps to acknowledge
- Chatbot admin stubbed (legacy API removed); non-core.
- Campus config stored locally; OK if out of scope.
- Route+waypoint transaction not yet wrapped; planned improvement.
- RLS not enabled; recommended for production.

## Quick Demo Script (3–5 min)
1) Login as admin; show protected routes.
2) Create building (category, rotation visible on map); optional update.
3) Create path with waypoints; filter paths by type.
4) Show audit log capturing actions.
5) Submit feedback as user; update status/priority as admin.
6) Mention Help/About.

## Prep Checklist
- Seed data as above.
- Verify indexes on FK/filter columns; unique on building code.
- Have ERD slide/diagram ready.
- Open SQL console for quick queries/EXPLAIN if asked.
- Test login/logout and role differences.

