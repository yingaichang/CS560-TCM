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

## Independent workflow connection verification

Last isolated run: 2026-11-23T19:01:46.353Z. Nine workflows and 50 separately assessed connections. {"connected":35,"partly_connected":9,"planned":6}.

The full machine-readable report is [workflowConnectionVerification.json](../src/data/workflowConnectionVerification.json). Each row includes its components, exchanged information, source references, six stage outcomes, named cases, timestamp, safe error and remaining requirement. Connected means complete evidence within the explicitly stated isolated application scope; it never establishes real hardware, browser identity, message delivery or payment. Signed receipt adapters are tested only as receipt/audit software (`applied=false`), and remain disabled in production.

The application handlers write fictional records into a disposable PostgreSQL database on a Docker internal network with tmpfs data and no production volumes or provider calls. Receiving components execute their real initial effects against those handlers and are rendered to verify persisted results. This is not a full browser click-through. Local Clerk/Stripe signatures use their actual verifiers with fictional keys. Negative assertions cover denial, unavailable configuration, stale versions, invalid signatures, consumed grants, replay/conflict, rollback and safe failure.

Code evidence alone and aggregate suite success cannot promote a connection. All six stages require an executed case or an explicit justified Not Applicable. A canonical SHA-256 fingerprint of application/test sources binds evidence to the tested version; changed code, missing stages/cases, duplicate IDs or invalid provenance remove Connected. Existing kiosk batch artifacts cannot overwrite per-connection test times. Real read-only observations are shown separately; failed mail/Stripe authentication affects only their corresponding connections, and successful probes cannot claim an executed migration or business workflow.

| Connection | Components | Isolated status | Last test (UTC) | Source | Incomplete stages |
|---|---|---|---|---|---|
| `guard-storage` | guard -> db | partly_connected | 2026-11-23T19:01:45.538Z | Fictional inputs; real isolated application | finalResult: Not Tested |
| `clinical-persist` | clinicalWrite -> db | connected | 2026-11-23T19:01:44.616Z | Fictional inputs; real isolated application | None within stated scope |
| `registration-persist` | registration -> db | connected | 2026-11-23T19:01:44.895Z | Fictional inputs; real isolated application | None within stated scope |
| `patient-audit` | patientApi -> audit | connected | 2026-11-23T19:01:45.636Z | Fictional inputs; real isolated application | None within stated scope |
| `kiosk-audit` | kioskApi -> audit | connected | 2026-11-23T19:01:45.704Z | Fictional inputs; real isolated application | None within stated scope |
| `contact-audit` | contactApi -> audit | connected | 2026-11-23T19:01:45.768Z | Fictional inputs; real isolated application | None within stated scope |
| `checkout-audit` | checkout -> audit | connected | 2026-11-23T19:01:45.874Z | Fictional inputs; real isolated application | None within stated scope |
| `identity-session` | admin -> identity | partly_connected | 2026-11-23T19:01:44.982Z | Fictional inputs; real isolated application | finalResult: Not Tested |
| `identity-role` | identity -> guard | partly_connected | 2026-11-23T19:01:45.538Z | Fictional inputs; real isolated application | finalResult: Not Tested |
| `admin-guard` | guard -> admin | partly_connected | 2026-11-23T19:01:45.538Z | Fictional inputs; real isolated application | finalResult: Not Tested |
| `account-management` | admin -> identity | planned | 2026-11-23T19:01:46.351Z | Fictional inputs; real isolated application | record: Not Tested, managementScreen: Not Tested, audit: Not Tested, finalResult: Not Tested |
| `booking-submit` | public -> bookingApi | connected | 2026-11-23T19:01:44.723Z | Fictional inputs; real isolated application | None within stated scope |
| `booking-save` | bookingApi -> db | connected | 2026-11-23T19:01:44.723Z | Fictional inputs; real isolated application | None within stated scope |
| `booking-manage` | admin -> bookingApi | connected | 2026-11-23T19:01:44.723Z | Fictional inputs; real isolated application | None within stated scope |
| `holiday-management` | admin -> bookingApi | connected | 2026-11-23T19:01:44.789Z | Fictional inputs; real isolated application | None within stated scope |
| `booking-notify` | bookingApi -> mail | partly_connected | 2026-11-23T19:01:45.366Z | Fictional inputs; real isolated application | finalResult: Not Tested |
| `booking-patient` | bookingApi -> patientApi | connected | 2026-11-23T19:01:44.723Z | Fictional inputs; real isolated application | None within stated scope |
| `patient-entry` | clinical -> patientApi | connected | 2026-11-23T19:01:44.430Z | Fictional inputs; real isolated application | None within stated scope |
| `patient-save` | patientApi -> db | connected | 2026-11-23T19:01:44.430Z | Fictional inputs; real isolated application | None within stated scope |
| `clinical-read` | db -> clinical | connected | 2026-11-23T19:01:46.350Z | Fictional inputs; real isolated application | None within stated scope |
| `clinical-write` | clinical -> clinicalWrite | connected | 2026-11-23T19:01:44.616Z | Fictional inputs; real isolated application | None within stated scope |
| `clinical-ai` | clinical -> ai | planned | 2026-11-23T19:01:46.351Z | Fictional inputs; real isolated application | record: Not Tested, managementScreen: Not Tested, audit: Not Tested, finalResult: Not Tested |
| `kiosk-request` | kiosk -> kioskApi | connected | 2026-11-23T19:01:45.132Z | Fictional inputs; real isolated application | None within stated scope |
| `kiosk-sms` | kioskApi -> sms | partly_connected | 2026-11-23T19:01:45.132Z | Fictional inputs; real isolated application | finalResult: Not Tested |
| `kiosk-save` | kioskApi -> db | connected | 2026-11-23T19:01:45.132Z | Fictional inputs; real isolated application | None within stated scope |
| `checkin-encounter` | kioskApi -> clinicalWrite | connected | 2026-11-23T19:01:45.132Z | Fictional inputs; real isolated application | None within stated scope |
| `payment-request` | payment -> checkout | connected | 2026-11-23T19:01:44.894Z | Fictional inputs; real isolated application | None within stated scope |
| `payment-platform` | checkout -> stripe | partly_connected | 2026-11-23T19:01:45.433Z | Fictional inputs; real isolated application | finalResult: Not Tested |
| `payment-callback` | stripe -> webhook | partly_connected | 2026-11-23T19:01:45.452Z | Fictional inputs; real isolated application | finalResult: Not Tested |
| `payment-registration` | webhook -> registration | connected | 2026-11-23T19:01:44.894Z | Fictional inputs; real isolated application | None within stated scope |
| `portal-entitlements` | registration -> portals | planned | 2026-11-23T19:01:46.351Z | Fictional inputs; real isolated application | record: Not Tested, managementScreen: Not Tested, audit: Not Tested, finalResult: Not Tested |
| `contact-submit` | contact -> contactApi | connected | 2026-11-23T19:01:44.843Z | Fictional inputs; real isolated application | None within stated scope |
| `contact-mail` | contactApi -> mail | partly_connected | 2026-11-23T19:01:45.408Z | Fictional inputs; real isolated application | finalResult: Not Tested |
| `contact-storage` | contactApi -> db | connected | 2026-11-23T19:01:44.843Z | Fictional inputs; real isolated application | None within stated scope |
| `business-audit` | bookingApi -> audit | connected | 2026-11-23T19:01:45.948Z | Fictional inputs; real isolated application | None within stated scope |
| `webhook-audit` | webhook -> audit | connected | 2026-11-23T19:01:46.008Z | Fictional inputs; real isolated application | None within stated scope |
| `audit-storage` | audit -> db | connected | 2026-11-23T19:01:46.070Z | Fictional inputs; real isolated application | None within stated scope |
| `audit-view` | admin -> audit | connected | 2026-11-23T19:01:46.135Z | Fictional inputs; real isolated application | None within stated scope |
| `ubuntu-application` | ubuntuHost -> public | planned | Not Tested | Not Tested | service: Planned, record: Planned, managementScreen: Planned, audit: Planned, finalResult: Not Tested, negativeCase: Planned |
| `ubuntu-database` | ubuntuHost -> databaseServer | planned | Not Tested | Not Tested | service: Planned, record: Planned, managementScreen: Planned, audit: Planned, finalResult: Not Tested, negativeCase: Planned |
| `database-migration` | db -> databaseServer | planned | Not Tested | Not Tested | service: Planned, record: Planned, managementScreen: Planned, audit: Planned, finalResult: Not Tested, negativeCase: Planned |
| `adapter-scanner` | integrationAdapter -> audit | connected | 2026-11-23T19:01:45.299Z | Fictional inputs; real isolated application | None within stated scope |
| `adapter-sms` | integrationAdapter -> audit | connected | 2026-11-23T19:01:45.299Z | Fictional inputs; real isolated application | None within stated scope |
| `adapter-voice` | integrationAdapter -> audit | connected | 2026-11-23T19:01:45.299Z | Fictional inputs; real isolated application | None within stated scope |
| `adapter-learning` | integrationAdapter -> audit | connected | 2026-11-23T19:01:45.299Z | Fictional inputs; real isolated application | None within stated scope |
| `adapter-storage` | integrationAdapter -> audit | connected | 2026-11-23T19:01:45.300Z | Fictional inputs; real isolated application | None within stated scope |
| `adapter-measurements` | integrationAdapter -> audit | connected | 2026-11-23T19:01:45.300Z | Fictional inputs; real isolated application | None within stated scope |
| `test-center-access` | admin -> testCenter | connected | 2026-11-23T19:01:45.299Z | Fictional inputs; real isolated application | None within stated scope |
| `test-center-simulation` | testCenter -> audit | connected | 2026-11-23T19:01:45.299Z | Fictional inputs; real isolated application | None within stated scope |
| `test-center-live` | testCenter -> audit | connected | 2026-11-23T19:01:45.299Z | Fictional inputs; real isolated application | None within stated scope |

Re-run safe unit/regression checks with `node scripts/test-workflow-evidence.cjs`, `node scripts/test-architecture-status.cjs`, `node scripts/test-system-connections.cjs`, `node scripts/test-architecture-test-center.cjs`, `node scripts/test-kiosk-dashboard-update.cjs`, `node scripts/test-architecture-discovery.cjs`, `node scripts/test-management-record-states.cjs`, `node scripts/test-protected-layouts.cjs` and `node scripts/test-auto-publish.cjs`. The PostgreSQL runner refuses any host/database other than the explicitly enabled fictional `synthetic-db/synthetic_connections`; never point it at an application database.
