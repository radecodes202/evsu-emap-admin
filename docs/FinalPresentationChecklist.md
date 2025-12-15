# Final Presentation Checklist (IT313 – Advanced Database Systems)

Use this as the run-of-show and evidence list. Tailor to your system and keep it concise in slides.

## I. Introduction (1–2 min)
- Project title, team, roles.
- Brief system overview: what it does, target users, problem addressed.

## II. Database Design – 20% (5–7 min)
- ERD: clear entities/relationships (buildings, locations/rooms, routes, waypoints, users/admin_users, feedback, audit_logs).
- Normalization: note 1NF→3NF briefly; no redundant repeating groups; separate tables for related concepts.
- Keys/constraints: primary keys, foreign keys, unique codes (e.g., building code), NOT NULL where required, enum/checks for status/category/type if used.
- Schema evidence: 1–2 sample CREATE TABLEs showing constraints/FKs.

## III. Security Implementation – 25% (5–7 min)
- Roles: admin vs user (what each can access/do).
- Privileges: describe enforced permissions (app-level guards; propose DB RLS if not in place).
- Authentication: login flow; stored user in localStorage for admin; (mention Supabase auth as recommended).
- SQL injection prevention: parameterized Supabase client; form validation (Yup).
- Audit logging: CREATE/UPDATE/DELETE events logged to `audit_logs` (verify with a quick demo).
- Optional: password hashing (if implemented) or note planned; stored procedure restrictions (if any).

## IV. Advanced SQL Features – 15% (4–5 min)
- Subqueries: counts (rooms per building, waypoints per route) – have a SQL snippet ready.
- Views: propose/mention reporting view (e.g., routes_with_waypoint_counts) or show if created.
- Stored procedures / functions: note Supabase RPC or the provided log function in SQL script.
- Triggers: audit logging (if DB-side) or mention app-level logging with planned DB trigger.

## V. Transaction Management – 15% (4–5 min)
- Transactions: describe multi-step ops (route + waypoints) and that they should be wrapped; if not yet, state as planned improvement.
- Concurrency: note default Postgres behavior; propose optimistic locking for future.
- Isolation levels: mention default (read committed) and how it prevents dirty reads; acknowledge not tuning others unless required.

## VI. Indexing & Optimization – 10% (3–4 min)
- Index list: PKs; FKs (route_id, building_id, user_id); filter columns (category, path_type, status); unique on building code.
- Performance: claim improved filter/search; if possible, show EXPLAIN or timing before/after on a filtered query.

## VII. System Demo – 5 min
- Secure login (admin).
- CRUD + DB tie-in: create/edit building (map footprint/rotation), create path with waypoints, filter.
- Audit trail: show entry after create/update/delete.
- Feedback: submit and update status/priority.
- Note validation/error handling briefly.

## VIII. Peer Feedback – 2–3 min
- What feedback you got.
- Changes you made in response (e.g., native selects, audit logging fixes, map preview, campus center config).
- Impact of those changes.

## IX. Conclusion – 1–2 min
- Technical highlights (DB design, security, audit, indexing).
- Challenges/lessons.
- Future improvements (pathfinding using routes, DB transactions for batch ops, RLS).

## X. Q&A – 3–5 min
- Keep SQL snippets and schema diagram handy.

---

## Evidence / Artifacts to Prepare
- ERD diagram (export).
- Sample CREATE TABLE with constraints/FKs (e.g., buildings, routes, waypoints, audit_logs).
- SQL snippets:
  - Rooms per building:
    ```sql
    select b.code, count(r.id) as room_count
    from buildings b
    left join locations r on r.building_id = b.id
    group by b.code;
    ```
  - Paths with waypoint counts:
    ```sql
    select p.id, p.path_name, p.path_type, count(w.id) as waypoints
    from routes p
    left join waypoints w on w.route_id = p.id
    group by p.id, p.path_name, p.path_type;
    ```
  - Recent audit entries:
    ```sql
    select action_type, entity_type, user_email, created_at
    from audit_logs
    order by created_at desc
    limit 10;
    ```
  - Sample CREATE TABLE (audit_logs or routes/waypoints) showing PK, FK, constraints.

- Index list: PKs, FKs, building code unique, filter columns (category/path_type/status).
- Security: description of roles, auth flow, parameterized queries; audit logging demo.
- Advanced SQL: mention/plan for views/triggers/functions; show the audit log function from `database-audit-trail-feedback.sql` if desired.
- Transactions: describe intended wrapping of route+waypoints; note Postgres default isolation.
- Demo data: a few buildings, rooms, paths with waypoints, feedback entries to show live.

---

## Talking Points by Rubric
- Database Design: ERD accurate, normalized, FKs/constraints, unique codes.
- Security: roles/privileges, param queries, validation, audit logs (demo).
- Advanced SQL: subqueries; mention views/triggers/functions (even if minimal).
- Transactions: explain multi-step ops and planned transactional wrapping.
- Indexing: list relevant indexes; state expected filter/search speed-up.
- Presentation/Feedback: highlight fixes from feedback (native selects, audit fix, campus center config, building map preview).

