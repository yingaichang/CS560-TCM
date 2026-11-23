# Software connection repairs

The dashboard inventory is the inspection baseline. Work follows dependencies: authorization and atomic writes, record associations, receiving management screens, audit events, then recovery and verification.

## Implemented scope

- Explicit administrative encounter assignment grants the selected provider patient access in the same audited transaction. Providers must retain both assignment and active access to read the queue or write notes/treatments. Assignment cannot replace the provider after documentation exists.
- Patient and intake creation use actor-scoped submission keys. Identical retries return the saved record; changed data with a reused key is rejected. Repeated intake selections are deduplicated.
- Development clinical workflow supports draft version checks, author-only explicit signing, immutable signed notes, recording treatment against an assigned signed encounter, atomically creating a linked billing draft, internal billing review, medication reconciliation and stopping a recorded medication. Completion requires a signed note and updates the linked appointment. These actions never charge a card, submit insurance, issue a prescription or assert actual care delivery.
- Clinical writes remain disabled in production, matching the existing development-only policy. Production screens can read permitted saved records. Enabling real clinical writes needs a separate production workflow decision.
- Overview, patient directory, notes, treatments, medication, billing and document-index screens read saved authorized records. Failed/empty queries no longer substitute fictional patients or claim fixed demonstration totals. Document indices do not assert that a storage object is downloadable.
- Existing administration entry points are retained: both patient creation forms send submission identifiers; patient profile edits reject stale versions; the appointment edit page now loads and saves a real appointment with version checks; patient history pages show saved encounters and route clinical edits to the assigned-provider workflow. New booking opens the established public booking form rather than a disabled placeholder. No sample record links are treated as saved history.
- Contact delivery and appointment notifications persist state and audit events, use bounded SMTP operations, prevent concurrent duplicate attempts, expose explicit management retries and keep saved business records when notification fails. SMTP acceptance is distinguished from inbox delivery. Timeouts, ambiguous results and partial recipient acceptance remain unknown and cannot be blindly retried. Stuck sending states require provider investigation, not automatic resend.
- The administration user page reads actual local account mappings with administrator-only access and an audit event. It does not assert that local role values describe current Clerk activation or override external roles. Account creation, deactivation and role synchronization remain unavailable until the cross-service identity mapping and recovery design is specified.
- The former “send AI questionnaire” action only changed appointment status. It is disabled and its unsupported status is rejected. Appointment notes are labeled as notes, not completed intake questionnaires.
- Checkout retries use a stable Stripe submission key. TWD checkout amounts are converted to minor units, as required by [Stripe currency documentation](https://docs.stripe.com/currencies#special-cases). Signed payment events must match an existing registration, topic, amount, currency and payment mode. Mismatches require review; missing records request event retry; duplicate events are suppressed; late failures cannot downgrade a paid registration. A successful browser redirect never proves payment.
- Booking validates input and real calendar dates, rechecks closure under the shared transaction lock and retains the unique provider/date/time conflict constraint. Holiday imports serialize their existence check and inserts. No existing valid records are merged by name or phone.

## Verification boundary

`scripts/test-software-connections.cjs` refuses all databases except an explicitly enabled isolated `synthetic_connections` database at host `synthetic-db`. Run in a Docker `--internal` network with a disposable PostgreSQL container, tmpfs data and no public ports or production volumes. The suite loads real handlers and persistence/audit services. Identity actors, SMTP responses and Stripe checkout responses are fictional fixtures. Stripe signature checks use locally signed fixture events through the actual SDK. This proves software behavior, not external identity, message delivery, hardware operation or actual payment.

The suite covers replay and payload conflicts, concurrent duplicate treatment requests, revoked access, immutable notes, linked billing and appointment completion, receiving management queries, billing-role data boundaries, production write rejection, rollback of both records and audit events, notification rejection/timeout recovery, checkout amount conversion, signed event mismatch/replay/order handling, booking conflicts and final audit-chain verification.

## Outstanding dependencies

- Public domain routing: IT must actually forward the domain to Ubuntu `192.168.60.112:80`, retaining the original Host. Agreement alone is not evidence of a changed upstream.
- SMTP/Stripe authentication: retain truthful live probe results. The user chose to update private Ubuntu settings themselves; this work does not copy local credentials.
- Clerk/Stripe webhooks: signing configuration and actual provider event delivery are independently required; fixtures do not verify these.
- SMS and scanner hardware: need the provider contract, credentials and real delivery/hardware verification. Never replace them with a successful stub in the live dashboard.
- AI/voice interview: no configured analysis/transcription service, collection/consent contract or clinical review specification.
- Student/patient portals, course entitlements and credits: no authorized person-to-registration mapping or completion/credit rules. An email resemblance is not identity proof.
- Account mutations: need durable reconciliation of Clerk identity and local roles, self-lockout/last-administrator rules and recovery behavior. A local user row alone is insufficient to safely create, disable or change an external identity.

No database schema changes, production data seeding, credential transfers or upstream routing changes are part of these repairs.

## Prepared integration boundaries and test center

See [Architecture Test Center and integration contracts](architecture-test-center.md) for every unavailable device/service's send/receive requirements, exact versioned JSON schemas, signed receipt-only endpoints, administrator authorization, five test outcomes and the development-only simulation flag. Simulations retain the source **Development Simulation** in safe audit metadata and never promote a real device, identity, payment or delivery connection to success.
