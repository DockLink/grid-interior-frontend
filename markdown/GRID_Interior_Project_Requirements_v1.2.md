# PROJECT REQUIREMENTS
## GRID Interior — CRM & Project Management System

**Document Version:** v1.2 — Final Confirmed Scope (Original + All Amendments Incorporated)
**Client:** GRID Interior
**Service Provider:** DocLink Technologies
**Prepared By:** Tharindu Dayawansa — Founder & Director, DocLink Technologies
**Date:** [Insert Date]

*DocLink Technologies — Internal Use Only*

---

## 01. Purpose of This Document

This document is the final consolidated project requirements for the GRID Interior CRM and Project Management System. It incorporates the original agreed scope, all amendment requirements, and the answers to all open questions confirmed by GRID Interior in the second requirements meeting. This document serves as the authoritative scope reference for all development work. **No build should proceed on any module without confirmation against this document.**

---

## 02. Design System & UI Guidelines

GRID Interior has confirmed their UI preferences. These apply across the entire system.

| Design Aspect | Confirmed Preference |
|---|---|
| Background | White background throughout — clean and minimal. |
| Fonts | Aptos or Calibri. No accent or decorative fonts. |
| Color theme | Dark color palette — darker blue tones preferred. Avoid bright or neon colors. |
| Alerts / errors | Red used exclusively for alerts and error states. |
| Timeline indicators | Green used for timeline and on-track indicators. |
| Avoid | Dark backgrounds, black fills, gray-heavy layouts. |
| Logo | GRID Interior company logo to be provided — integrated into the system header and login screen. |
| Mobile | System must be fully functional on mobile — mobile usage confirmed by client team. |
| Data deletion | Soft delete only throughout the system — no hard deletes. All deleted records recoverable by admin. |

---

## 03. User Roles & Access Levels

The system has five distinct user roles. Access is scoped per role as follows.

| Role | Access & Permissions |
|---|---|
| Super Admin | Full system access. Manages all user accounts, roles, project assignments, and system configuration. One super admin account. |
| Designer 01 | Access to their own assigned projects only. Can create and manage tasks, upload files, update project phases, and log meeting minutes within their projects. |
| Designer 02 | Same access as Designer 01 — scoped to their own assigned projects only. |
| Project Coordinator | Assigned per project by the super admin. Access to all projects they are assigned to. Manages scheduling, timelines, and task coordination across assigned projects. |
| Social Media / Backend Admin | Restricted role. Can upload content (before/after images, project photos), add and manage supplier records, and access backend data entry functions. No access to financial data, BOQ, or client-facing timelines. |

**Total initial users:** Super Admin + 2 Designers + 1 Project Coordinator + 1 Social Media / Backend Admin = **5 users at go-live.**

---

## 04. Module Overview

| # | Module | Summary | Status |
|---|---|---|---|
| M1 | Client Management | Profiles, history, communication log, lead pipeline, follow-up reminders | Confirmed |
| M2 | Supplier & Sub-Vendor Management | Supplier database, editable rates, BOQ integration, project linkage | Confirmed |
| M3 | Project Hub | Full project lifecycle — all phases fully confirmed with detailed sub-workflows | Confirmed |
| M4 | Task Management & Allocation | Task creation, ownership, status tracking, deadline alerts, comments | Confirmed |
| M5 | Document, File System & Meeting Minutes | Auto folders, all file types including audio, no archiving, client brief upload | Confirmed |
| M6 | Project Timeline & Reporting | Internal + client timeline, Friday updates, permanent shareable link, 10-day post-completion buffer | Confirmed |

---

## 05. M1 — Client Management

*No amendments. Confirmed as originally scoped.*

| Feature | Detail |
|---|---|
| Client profiles | Full record — name, company, contact details, address, preferred communication method. Linked to all projects, invoices, and documents. |
| Project history | All past and current projects per client listed in one place. |
| Communication log | Log calls, emails, and meetings against the client record with date and notes. |
| Lead & inquiry tracking | Source tracking (referral, Instagram, website, walk-in). Stage: New Inquiry → Meeting Booked → Proposal Sent → Won / Lost. |
| Follow-up reminders | Set follow-up date on any client or lead. Assigned team member alerted automatically. |
| Search & filter | Search full client database by name, project, or status. |

---

## 06. M2 — Supplier & Sub-Vendor Management

| Feature | Detail |
|---|---|
| Supplier database | Centralised list of all suppliers categorised by type with full contact details. |
| Rates & terms — editable | Store supplier rate cards, credit terms, lead times. Rates editable at any time by authorised users — not locked after entry. |
| Sub-vendor records | Separate database for sub-contractors — specialty, availability, past project history, payment records. |
| Order history | Every order placed per supplier — delivery status and payment made. |
| Project linkage | Each supplier linked to relevant projects. System shows which active projects each supplier is currently involved in. |
| BOQ integration | Supplier module connects directly to the Execution phase BOQ. Supplier selection, quotation comparison, and confirmation tracked here. |
| Social Media Admin access | Social media / backend admin role can add and manage supplier records. |

---

## 07. M3 — Project Hub

The project hub manages the full project lifecycle across six phases. Each phase can also function as a standalone engagement — some clients commission only one phase. The system allows a project to start at any phase.

### Site Location
- Google Maps integration — pin the site address directly within the project record.
- Distance from GRID Interior's Dehiwala office to the site is auto-calculated and displayed. This is used by the team for planning site visits and determining consultation eligibility.

### Historical Project Records (From 2023 Onwards)
- Covers approximately 15 projects from 2023 to present.
- Each historical record captures: client name, project start date, project completion date, brief description of work done, project status, and completed project photo uploads.
- No full phase workflow required for historical records — lightweight upload format only.

### Phase 1 — Consultation

The consultation phase has two types — **Free Consultation** and **Paid Consultation** — selectable via toggle by the system user when creating the consultation record.

| Aspect | Free Consultation | Paid Consultation |
|---|---|---|
| Eligibility | Client must be within a 10 km radius of GRID Interior's Dehiwala office. | Available to all clients regardless of location. |
| Selection | Toggle on consultation record — Free or Paid. | Toggle on consultation record — Free or Paid. |
| Mode | Online or offline. | Online or offline. |
| Questionnaire | Not included. | Full structured questionnaire (provided by Shehara). Covers: property type (rented / owned / leased), project limitations, furniture to retain, client preferences and requirements. |
| Physical site visit | Not included. | Included — team visits the site. |
| Site measurements | Not included. | Team takes and records all site measurements. Measurement sketch image uploaded directly. |
| Inventory list | Not included. | Optional — toggle to include or exclude. If included: full inventory of items client wants to retain. |
| Thread / notes | Task updates only. | Comment / thread section under each section for notes and follow-up discussion. |
| Audio upload | Not included. | Audio recordings of the site visit can be uploaded. |

**Paid Consultation — Inventory List Detail**
- Inventory list is optional — system user toggles whether an inventory list is needed for this project.
- If included, each inventory item is logged with:
  - Item name
  - Specifications / description
  - Height, width, length (where applicable)
  - Quantity
  - Notes
- Each item has a tick-off option to confirm measurements have been taken during the site visit.

### Phase 2 — Concept Design

Concept design is structured per area (room / space). Each area receives its own concept development workflow. Areas are defined at the start of the project (e.g., office room, meeting room, lobby, directors room).

- Concepts are created per area — not per project as a whole.
- Standard offering: 1 concept per area (e.g., 1 concept for the lobby, 1 for the directors room). In some cases, a client may commission more than 1 concept per area — the system supports multiple concepts per area without a hard cap.
- Each concept has two stages:
  - **Non-Render:** initial design direction, layout sketches, mood. Non-render is optional — it is skipped if the client has not paid for this stage. The system allows the user to mark non-render as included or excluded per concept.
  - **Render:** full 3D rendered visuals.
- Both stages include a virtual walkthrough presented to the client within the design software.
- At each stage: client presentation → client feedback → client confirmation before proceeding to the next stage.
- Revision policy: 2 free revisions included per stage as standard. Any revisions beyond 2 are chargeable. The system should allow the user to log the revision count and flag when the free allowance has been exceeded.
- Final confirmed presentation file uploaded to the system upon client sign-off.
- Files are never archived — all uploads remain permanently accessible within the project.
- Timeline set manually — different renders take different amounts of time (example: 2 working days per space).
- Team members can be assigned to concept tasks. Standard task creation and ownership applies.

### Phase 3 — Layout

- Follows concept sign-off.
- Layout drawings created and reviewed with the client.
- Client presentation and confirmation required before proceeding.
- Timeline set manually (example: 10 working days per space).
- Documents and files uploaded within this phase's dedicated section.
- Team members assigned, tasks created within the phase.

### Phase 4 — 3D Design

- Full 3D visualisation of the confirmed layout.
- Virtual walkthrough presented to the client.
- Client confirmation required before proceeding.
- Final files uploaded to the system.
- Manual timeline set per project.

### Phase 5 — Detail Drawings

The final technical documentation before execution. Changes at this stage are rare and only occur when issues arise during the physical build. Director access required for review.

- Directors have full visibility across all detail drawing documents — the director overview shows all active projects at this phase.
- The detail drawings section is broken into the following confirmed categories, each with its own dedicated upload section:

| Category | Content |
|---|---|
| Electrical | Electrical plan, wiring layouts, and all electrical specification documents. |
| Flooring | Flooring plans, material specifications, and layout drawings. |
| Ceiling | Ceiling design drawings and specifications. |
| Walls, Doors & Windows | Wall elevations, door and window schedules, finish specifications. This is one combined category. |
| Furniture | Furniture layout plans and custom piece specifications. |
| Interior Elements | Custom decorative items — paintings, sculptures, signage, branding, sticker walls, advertising graphics, and any designer-recommended custom decor pieces. |

- The estimate breakdown (BOQ summary by category) is also stored at this phase: broken down by electrical, flooring, ceiling, walls/doors/windows, furniture, and interior elements.

### Phase 6 — Execution

The most complex phase. The execution section connects directly to the Supplier module and follows a structured multi-stage workflow. Timelines can overlap across stages — the system supports parallel timelines.

**BOQ Structure**

The BOQ is built from the confirmed detail drawings. Each BOQ line item contains:
- Specification — item name and what it is.
- Size / dimensions — where applicable (may not apply to all items).
- Quantity.
- Image — included only for physical items.
- Supplier column — up to 3 supplier quotations can be compared per line item (maximum 3 comparisons).
- Supplier price — quoted price from each supplier.
- Design firm price — GRID Interior's price to the client for that item.
- Each BOQ function / category has its own budget and its own timeline.

**Supplier Quotation Process**
- Step 1: As a team, identify who to contact for each requirement — suppliers and sub-contractors for site preparation, masonry, electrical, plumbing, walls, ceiling, and flooring.
- Step 2: Obtain quotations. Maximum 3 supplier comparisons per line item.
- Step 3: Select supplier and confirm for each item.

**Execution Stages**

| # | Stage | Detail |
|---|---|---|
| 1 | BOQ Development | Bill of Quantities built from detail drawings. Connected to supplier module. Up to 3 supplier quotations per item. |
| 2 | Supplier Negotiation | Negotiation status tracked per supplier — pending, in progress, agreed. |
| 3 | Supplier Confirmation | Supplier confirmed and locked in for each BOQ line item. |
| 4 | Advance Payment | Payment status logged — not paid, partially paid, paid. |
| 5 | Contract Sign | Supplier contract signed — upload confirmation document. |
| 6 | Commence Project | Site work begins. Full sub-stage breakdown below. |

**Site Execution Sub-Stages (Stage 6)**

These sub-stages form the on-site execution sequence. Note: timelines can overlap — the system must support parallel running timelines across these sub-stages.

| # | Sub-Stage | Detail |
|---|---|---|
| 6.1 | Mobilisation (Days 1–3) | Site preparation: purchases, basic requirements, cover floors with polythene, get equipment ready. |
| 6.2 | Preliminary Works | Begin preliminary works. Color selection finalized here. Furniture detailing finalized with suppliers. Order of works: preliminary first, then proceed. |
| 6.3 | Floor Mapping | Once preliminary works complete: floor plan marked on the floor with duct tape to guide all subsequent works. |
| 6.4 | Electrical & Wiring | Electrical and wiring work commences after preliminary works. Runs in parallel with other applicable stages. |
| 6.5 | Walls, Doors & Windows | Wall works, door and window installation. May run in parallel with ceiling work. |
| 6.6 | Ceiling Works | Ceiling construction and finishing. Can run in parallel with 6.5. |
| 6.7 | Deep Clean #1 | Any work generating significant dust (masonry, cement, etc.) triggers a deep clean before flooring begins. This is a mandatory checkpoint. |
| 6.8 | Flooring | Flooring installation after the first deep clean. |
| 6.9 | Interior Elements & Installation | Interior decor, custom pieces, furniture delivery and installation, and light fittings installed. This stage brings all supplier-delivered items on site. |
| 6.10 | Deep Clean #2 | Second deep clean after installation work completes. Mandatory before final stages. |
| 6.11 | Soft Clean | Final soft clean — light cleaning after all furniture and fittings are in place. |
| 6.12 | Audit & Snagging | Full walkthrough of the site. Review all detailing, check everything against the design drawings. Flag and resolve any outstanding issues. |
| 6.13 | Handover | Formal handover to the client. |

> **Note:** Two mandatory deep cleans are built into every site execution — the first after any masonry or high-dust work and before flooring begins; the second after installation work before soft clean.

---

## 08. M4 — Task Management & Allocation

*No amendments. Confirmed as originally scoped.*

| Feature | Detail |
|---|---|
| Task creation | Title, description, due date, priority (High / Medium / Low). |
| Task ownership | Every task assigned to a named team member. Visible on their personal dashboard immediately. |
| Status tracking | To Do → In Progress → Under Review → Completed. |
| My Tasks view | All tasks across all projects in one personal dashboard. |
| Deadline alerts | Automatic in-app and email notifications for approaching or missed deadlines. |
| Task comments | Team members can comment and update directly on each task. |

---

## 09. M5 — Document, File System & Meeting Minutes

| Feature | Detail |
|---|---|
| Auto folder structure | Every new project: Drawings, Mood Boards, Supplier Quotes, Contracts, Client Approvals, Site Photos — automatically created. |
| File uploads | Upload any file type — PDFs, images, CAD exports, Excel BOQs, audio files. |
| Photo management | Mood boards, material swatches, site photos, progress images — organised by date. Before/after images uploadable by social media admin role. |
| Meeting minutes | Log meeting notes directly in the project. Record date, attendees, key decisions, and action items. Supports: typed notes, PDF upload, or audio recording upload. |
| Client briefing upload | Dedicated upload area at the project level for the initial client brief document. |
| No archiving | Files are never archived or hidden. All uploads remain permanently accessible within the project. |
| Upload notifications | Team members notified when a new file or document is added to a project they are assigned to. |
| Searchable records | All meeting minutes and documents indexed and searchable within each project. |

---

## 10. M6 — Project Timeline & Reporting

### Timeline Structure
- Each project runs two parallel timelines:
  - **Internal timeline** — visible to the full project team and directors. All phases, tasks, and actual deadlines.
  - **Client-facing timeline** — milestone-only view visible to the client. System users can edit the client timeline independently of the internal one.
- Timelines are set manually. Each phase has a duration input — deadline calculated from entry.
- Dragging to reschedule milestones is supported.
- Each BOQ function / execution sub-stage has its own individual timeline — stages can overlap and run in parallel.

### Client Portal
- A permanent shareable link is generated per project — active for the full duration of the project.
- Client can view their timeline via this link at any time throughout the project.
- Every Friday, the team updates the timeline and the link is sent to the client with the latest progress.
- The client-facing view also includes the finalized material list — view only, no interaction.
- Once the project is complete, the link and portal remain accessible for 10 days post-completion as a buffer period. After 10 days, the portal closes.
- Client view is read-only. No commenting or interaction.

### Reporting & Director Dashboard

| Feature | Detail |
|---|---|
| Project status report | Auto-generated: completed tasks, outstanding tasks, overdue items, upcoming milestones. |
| Director dashboard | All active projects — name, client, current phase, status (On Track / At Risk / Overdue), next deadline. |
| Milestone alerts | Team notified as milestones approach. Directors alerted if a milestone is overdue. |
| In-app notifications | Real-time notification bell — task updates, file uploads, deadline alerts. |
| Admin panel | Super admin manages all user accounts, access levels, and project assignments. |

---

## 11. Document Sign-Off

By signing below, both parties confirm that all requirements, workflows, and specifications in this document have been reviewed, agreed, and form the authoritative scope for development. **No scope additions or changes are permitted after sign-off without a separate written change request.**

**DOCLINK TECHNOLOGIES**
Tharindu Dayawansa — Founder & Director
Date: ___________________________

**GRID INTERIOR**
Shehara — Director
Date: ___________________________

---

*DocLink Technologies — Colombo, Sri Lanka — Internal Use Only*
