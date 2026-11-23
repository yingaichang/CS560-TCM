# Architecture Test Center and integration contracts

The inventory in `docs/software-connection-repairs.md` and source references in `src/lib/architectureMap.ts` are the baseline. Runtime validators are in `src/lib/integrations/contracts.ts`. Their exact field types, enums, required fields, numeric bounds and `additionalProperties: false` rules are published in [integration-contracts.v1.json](integration-contracts.v1.json). Regenerate with `node scripts/export-integration-contracts.cjs`; check drift with `--check`.

## Access and feature flags

- Page: `/admin/development/architecture-tests`; linked from the administrator development menu and architecture dashboard.
- Administrator authorization is checked on the server page and independently on every test API before reading request data, contracts, history or running checks. Staff, providers, billing users and anonymous visitors cannot execute tests. No test role or Clerk bypass is introduced.
- GET `/api/admin/development/architecture-tests` returns schemas, fixed fictional examples, unrun steps, last ten audit-backed runs, receipt-only event metadata and the separately labeled recorded PostgreSQL verification.
- POST `/api/admin/development/architecture-tests/simulate` requires both `NODE_ENV=development` and `ARCHITECTURE_SIMULATION_ENABLED=true`. The flag defaults off. `NODE_ENV=production` always rejects simulation, even when the flag is true. Changing the flag requires restarting the development process. It is not a browser-provided or `NEXT_PUBLIC_` flag.
- POST `/api/admin/development/architecture-tests/live` performs the existing bounded read-only probes. It works for administrators in production without enabling simulation. It does not send messages, create checkouts, collect balances or change business records. SMTP login and authenticated read-only APIs are contacted; only safe outcomes are retained.
- Both POST APIs require a same-origin `Origin` header and authenticated administrator session. Bodies are streamed with a size limit (16 KiB simulation, 1 KiB live). They accept no command, arbitrary URL, SQL, file path, credentials or real record IDs to operate on.

PowerShell development startup:

```powershell
$env:ARCHITECTURE_SIMULATION_ENABLED = 'true'
npm run dev
```

`npm run dev` sets Next.js development mode. Open the Test Center as an administrator and select **執行虛構流程**. Ubuntu's production `next start` can display the center and run read-only checks, but cannot enable the simulator. No production configuration or credentials are copied by this change.

## Meaning of results

| Result | Exact meaning |
|---|---|
| Passed | The named assertion or real read-only probe actually returned the expected outcome. The row's scope states which. |
| Failed | An executed assertion/probe returned an unexpected result or failed. The SMS rejection scenario deliberately exercises this outcome, then tests safe stopping. |
| Not Tested | Not executed, a prerequisite failed, a setting is missing, or no actual device/provider verification occurred. |
| Planned | A required identity mapping, provider, consent flow, storage/observation model or business rule is not implemented/approved. |
| Not Applicable | A step does not apply in this mode. Simulation never sends real messages, charges money or writes clinical records. |

Overall status uses Failed first, then Planned, then Not Tested. A workflow with passing format checks and an unverified scanner cannot become overall Passed. Real devices, real authentication, actual delivery/payment and real business persistence remain separate rows. Simulation results do not change the architecture dashboard's live connection status or old verification artifacts.

## Development simulator input and isolation

The UI and optional CLI send this envelope to the simulator API:

```json
{
  "runId": "00000000-0000-4000-8000-000000000099",
  "source": "Development Simulation",
  "scenario": "kiosk-arrival",
  "input": { "...": "exact fixture returned for that scenario by the catalog API" }
}
```

The fixtures are version-controlled in `src/lib/architectureTests/fixtures.ts`, use `example.test` mailboxes, reserved fictional phone numbers and synthetic record IDs. The server requires the input to equal the published fixture after canonical JSON comparison. It rejects added/replaced real data, unknown fields/scenarios and source spoofing. The source is assigned by server code, not trusted from a client label.

Every run starts with new in-memory maps/sets. Shared application policies for encounter creation plans, SMTP acceptance classification and payment amount/currency matching are executed. The simulator has no database client, filesystem, HTTP transport or credentials. Its sandbox operations are **not** real kiosk HTTP, Prisma persistence, identity authentication or provider delivery tests. The separate recorded isolated PostgreSQL suite covers actual application handlers and transaction persistence.

Only allowlisted step IDs, status, run UUID, fixed safe scope/summary, authenticated actor identifiers and source are appended through the existing hash-chained audit service. `patientId` is null. No phone, verification code, transcript, audio, card data, token, session cookie, signing header, environment value or provider response body enters test audit summaries. A run and all its outcomes commit atomically. Run UUIDs are globally unique and bound to the authenticated actor. Reusing a run UUID for the same actor/scenario restores the saved outcomes without duplicate audit events; reusing it for a different actor/scenario/source conflicts. If audit persistence fails, the API returns 503 rather than reporting a successfully recorded run. GET reconstructs history from allowlisted audit metadata, not raw summaries.

The optional CLI uses the same public contract:

```powershell
$env:NODE_ENV = 'development'
$env:ARCHITECTURE_SIMULATION_ENABLED = 'true'
$env:ARCHITECTURE_SIMULATION_ORIGIN = 'http://localhost:3000'
# Set ARCHITECTURE_TEST_SESSION_COOKIE privately to your own current development
# administrator cookie. Do not commit or share it. Prefer the browser UI.
node scripts/send-architecture-simulation.cjs kiosk-arrival
```

It refuses non-loopback origins, redirects, missing administrator session and production mode. It never bypasses authentication and prints only safe source/status/step metadata. Available scenario IDs: `kiosk-arrival`, `sms-failure`, `contact-delivery`, `payment-registration`, `identity-event`, `voice-intake`, `course-completion`, `document-storage`, `measurements`.

## Proposed v1 receiving protocol

These adapters are this application's proposed protocol, **not claims that an unselected device or vendor implements it**. Stripe and Clerk retain their existing native endpoints described below.

`POST /api/integrations/{service}` supports `scanner`, `sms`, `voice`, `learning`, `storage`, `measurements`. It is receipt-only, disabled by default and never used by the development simulator. Enable a service only after configuring `INTEGRATION_RECEIPTS_ENABLED=true` and that service's private signing secret of at least 32 characters:

| service | Private variable |
|---|---|
| scanner | `SCANNER_ADAPTER_SIGNING_SECRET` |
| sms | `SMS_ADAPTER_SIGNING_SECRET` |
| voice | `VOICE_ADAPTER_SIGNING_SECRET` |
| learning | `LEARNING_ADAPTER_SIGNING_SECRET` |
| storage | `STORAGE_ADAPTER_SIGNING_SECRET` |
| measurements | `MEASUREMENTS_ADAPTER_SIGNING_SECRET` |

All requests require `Content-Type: application/json`, `X-Adapter-Timestamp` (Unix seconds) and `X-Adapter-Signature: sha256=<64 lowercase hexadecimal characters>`. Sign the exact UTF-8 request bytes with HMAC-SHA256 over `timestamp + "." + service + "." + body`, using that service's secret. Timestamp must be within five minutes. Comparison uses constant time; the service name is signed to prevent cross-adapter replay. The key authenticates a gateway, not a patient's identity or an enrolled device.

All envelopes require exactly `version: 1`, `eventId` UUID, `occurredAt` ISO UTC datetime, `kind` and `data`. Maximum body is 16 KiB. Extra fields, raw credentials and arbitrary URLs are not accepted by the schemas. The sender keeps the event UUID and semantic payload stable for retries, but signs with a fresh timestamp. Repeating a known event returns the same receipt; changed data under the same UUID returns 409.

Example scanner event (fictional):

```json
{
  "version": 1,
  "eventId": "00000000-0000-4000-8000-000000000001",
  "occurredAt": "2030-01-07T09:00:00.000Z",
  "kind": "scanner.read",
  "data": {
    "deviceId": "dev_sim_scanner",
    "scanType": "membership_token",
    "token": "00000000-0000-4000-8000-000000000002"
  }
}
```

Successful receipt is HTTP 202:

```json
{
  "receiptId": "adapter:scanner:<sha256 of eventId>",
  "accepted": true,
  "applied": false,
  "duplicate": false,
  "status": "Planned",
  "reason": "record_mapping_not_configured"
}
```

The receipt ID and canonical payload fingerprint are persisted with a safe audit event, source **External Adapter**. Raw payloads are discarded. `accepted=true` means only that the receipt committed. It is **not** identity verification, successful delivery, file existence, course entitlement, medical validation or clinical persistence. Recent receipt metadata appears in the protected Test Center. There is no automatic business dispatch until mappings and rules are specified.

Errors: 400 malformed JSON/schema, 401 invalid/stale signature, 404 unsupported service, 409 event UUID conflict, 413 body limit, 415 wrong media type, 503 disabled/missing configuration or uncommitted receipt. No raw validation payloads or secret values are echoed. Do not automatically retry a 4xx; resolve its cause. Retry 503 with the same event UUID. This is a new namespace in existing receipt/audit tables; no schema migration is required.

## Device and service boundary details

The named schema keys below refer to the complete machine-readable JSON Schema document. Native provider schemas are consumed-field projections for tests; their full authenticated payloads still go through their SDKs.

| Device/service | Must send to application | Must receive from application | Adapter/remaining boundary |
|---|---|---|---|
| Driver-license scanner | `scanner`: `scanner.read`; device ID, `license_token`, opaque one-time UUID token | Receipt-only 202; no patient data or authentication grant | Hardware parser must discard raw AAMVA/license text locally. Token issuer/enrollment and authorized patient lookup are Planned. Existing kiosk license option remains unavailable. |
| Membership scanner | Same schema with `membership_token` | Same receipt-only acknowledgement | A card/token is not identity proof. No automatic lookup or check-in before approved mapping and independent verification. |
| SMS gateway | Synchronous `smsAcceptance`: messageId and accepted/rejected; optional signed `sms` callback with messageId, delivered/failed/unknown and attempt 1–10 | Outgoing `smsRequest`: exact `{to, code}`; 10–15 phone digits with optional leading `+`, six-digit code | Existing `SMS_PROVIDER_WEBHOOK_URL` is outbound. Its legacy HTTP acceptance does not prove delivery. New callback is receipt-only until messageId-to-appointment mapping exists. Never log OTP/phone. |
| SMTP service | Nodemailer result `accepted[]`, `rejected[]` and safe error code | `smtpMessage`: from, nonempty recipient list, optional replyTo, subject, text; private transport authentication | Existing SMTP adapters continue. Full acceptance is `sent` (server acceptance only); partial acceptance/timeout is unknown. Rejection has safe manual retry; uncertainty must be investigated. |
| Stripe | Native event ID/type and Checkout Session ID, metadata.topicId, payment_status, mode, currency, amount_total; raw body and `Stripe-Signature` | SDK Checkout request: mode=payment, card, line items, currency=twd, feeTwd×100 minor units, success/cancel URLs, topic metadata, idempotency key. Returns session id/url | Existing `/api/payment/checkout-session` and `/api/webhooks/stripe`. No card details collected by this app. Matching existing registration required; mismatch requires review; late failures cannot downgrade paid state. |
| Clerk | Native session.created/ended `{id,user_id}`, user.created/updated/deleted `{id}`; raw body and `svix-id`, `svix-timestamp`, `svix-signature` | Managed SDK sign-in/session exchanges; server uses private Clerk API authentication; webhook receives safe `{received:true}` or duplicate acknowledgement | Existing `/api/webhooks/clerk` verifies via Clerk SDK. Format checks never assert successful login or assign admin roles. Role synchronization/recovery is Planned. |
| Microphone | Browser-recorded audio must eventually match `audioMetadata`: webm/ogg, byte size, duration, sample rate and SHA-256 | Local permission/capture state; later a protected storage object reference | No actual recording/upload endpoint is enabled. Metadata example is not evidence of captured audio. No binary body is accepted by the receipt endpoint. |
| AI/transcription service | `voice`: voice.result, interviewId, consentReference, input mode, transcript, reviewRequired=true | Proposed `voiceRequest`: request/interview/consent UUIDs, locale, patient_reported_intake purpose, text or audio object+metadata, requireProviderReview=true | No outbound AI call or clinical save is enabled. Consent must be independently established; a UUID is not proof. Provider clinical review remains required. |
| Learning platform | `learning`: course.completed, registrationId, subjectReference, courseId, completedAt, creditUnits | Proposed `learningGrantRequest`: verified registration reference, mapped subject/course and course_access request | No grants/credits are sent or awarded. Payment, person mapping, course rules and completion verification remain Planned. |
| Document storage | `storage`: document.stored, documentReference, objectReference, SHA-256, contentType and bytes | Proposed `storageUploadRequest`: request/document/subject references and bounded object metadata; actual protected byte transport depends on selected SDK | No upload/download is implemented by receipt-only acceptance. No external URL is fetched. The service, object access and record mapping are Planned. |
| Blood-pressure device | `measurements`: deviceId, subjectReference, reading `{metric:blood_pressure,systolic,diastolic,unit:mmHg}` | Receipt-only acknowledgement; no dosing, calibration or treatment command | Positive finite numbers validate transport type only, not medical plausibility. Actual device and identity/observation mapping are not verified. |
| Glucose device | Same envelope; reading `{metric:blood_glucose,value,unit:mg/dL or mmol/L}` | Same | No unit conversion, threshold classification or medical advice. |
| Scale | Same envelope; reading `{metric:weight,value,unit:kg}` | Same | No health conclusion or clinical persistence. |
| Sleep tracker | Same envelope; reading `{metric:sleep,durationMinutes:integer 0..1440}` | Same | No sleep diagnosis or inferred history. |
| School HTTPS proxy | Forward to `http://192.168.60.112:80`, preserving `Host:cse03.tcmusa.ai` and trusted forwarded headers | Homepage HTTP 200 and matching deployed asset fingerprint | IT must actually update upstream routing; Test Center cannot change it. Ubuntu PostgreSQL and Caddy probes remain read-only. |

Native protocol references: [Stripe webhook verification](https://docs.stripe.com/webhooks), [Clerk webhook delivery and signatures](https://clerk.com/docs/guides/development/webhooks/overview), [Nodemailer SMTP transport](https://nodemailer.com/smtp). These native services do **not** use the proposed `X-Adapter-*` signature format.

## Verification commands

```text
node scripts/export-integration-contracts.cjs --check
node scripts/test-architecture-test-center.cjs
node scripts/test-architecture-status.cjs
node scripts/test-system-connections.cjs
```

The isolated PostgreSQL software suite additionally runs real test-center endpoints, fixed fixture enforcement, flags/production rejection, role denials, audit-history reconstruction, replay/conflict handling and signed receipt-only adapters using fictional records. It never contacts real providers. No production data, migrations, credentials or external routing are changed.
