# Impact Hub

VISTAAR — COMPLETE AI-POWERED GOVERNMENT INNOVATION PLATFORM

SMART INDIA HACKATHON 2026

You are an autonomous senior full-stack engineer, frontend engineer, backend/workflow engineer, AI engineer, database engineer, UI/UX designer, security engineer and QA engineer.

Your task is to BUILD the complete working VISTAAR web application from scratch.

This is NOT a request for a UI mockup.

This is NOT a request for a landing page only.

This is NOT a collection of static screens.

Build a fully connected, functional, responsive and demo-ready application.

1. PRODUCT NAME

VISTAAR

Tagline

From Government Challenges to Scalable Impact.

Core Lifecycle

DISCOVER → MATCH → TEST → PROVE → SCALE

2. PROBLEM

Governments face a critical gap between innovation and impact.

Promising solutions exist, but:

The right solutions are difficult to discover.

Startups are difficult to compare.

Government challenges are often disconnected from innovators.

Pilots are inconsistent.

Evidence is scattered across departments.

Solution effectiveness is difficult to validate.

Successful solutions rarely scale beyond their original location.

Decision makers lack a unified evidence-driven system.

Innovation data is often locked inside organizational silos.

This leads to:

Wasted resources

Repeated experimentation

Poor visibility

Limited scalability

Weak evidence

Lost opportunities for public impact

3. VISTAAR SOLUTION

VISTAAR is an:

Evidence-Driven Government Innovation Lifecycle Platform

It connects:

Government Challenges

with

Startups and Solutions

and manages the complete journey:

Challenge → AI Match → Pilot → Evidence → Impact → Scale

VISTAAR helps governments:

Discover solutions

Match challenges with startups

Test solutions through structured pilots

Collect evidence

Measure KPIs

Prove impact

Make transparent decisions

Scale successful solutions

Replicate innovations across departments and states

4. MOST IMPORTANT PRODUCT PRINCIPLE

VISTAAR must NOT behave like:

A simple government portal

A simple startup marketplace

A simple AI chatbot

A normal analytics dashboard

It must behave like a:

GOVERNMENT INNOVATION OPERATING SYSTEM

Every major feature must connect to the lifecycle:

DISCOVER

↓

MATCH

↓

TEST

↓

PROVE

↓

SCALE

The platform must preserve the complete history of an innovation from the original challenge to its eventual scaling.

5. TECHNOLOGY STACK

FRONTEND

Use:

React

TypeScript

Vite

Tailwind CSS

React Router

Framer Motion

Reusable components

Modern charting library

Form validation

Centralized API service layer

BACKEND / WORKFLOW

Use:

n8n

n8n is the primary backend workflow/orchestration layer.

Use modular n8n workflows for:

Authentication

Registration

User management

Challenges

Startups

AI Match

Pilots

Evidence

Impact

Scale

Notifications

Reports

Audit Trail

AI Model

DATABASE

Use:

PostgreSQL

Use persistent database storage.

Do NOT store important application data only in React state.

6. AUTHENTICATION — MANDATORY

Authentication is required.

Create:

SIGN UP

Fields:

Full Name

Email

Password

Confirm Password

Organization

Role

Roles:

Government Officer

Startup Owner

Evaluator

Admin

LOGIN

Fields:

Email

Password

Features:

Show/hide password

Form validation

Loading state

Error state

Successful login

Logout

Session management

Protected routes

Role-based redirection

Never store plaintext passwords.

Never expose passwords, authentication tokens or secrets in the frontend.

7. ROLE-BASED ACCESS CONTROL

Implement proper RBAC.

GOVERNMENT OFFICER

Can:

Create challenges

Edit challenges

Publish challenges

Search startups

Run AI Match

Invite startups

Create pilots

Manage milestones

Review evidence

Evaluate impact

Generate reports

Initiate scale

Approve scaling

View audit trail

STARTUP OWNER

Can:

Create startup profile

Add startup solution

Add team

Add technology

Add case studies

Add deployments

Upload evidence

Submit solutions

View challenges

View AI matches

Participate in pilots

Track pilot progress

View feedback

View scale opportunities

EVALUATOR

Can:

Review startups

Review pilot proposals

Review evidence

Verify evidence

Evaluate KPIs

Score impact

Provide feedback

Request additional evidence

ADMIN

Can:

Manage users

Manage roles

Manage departments

Manage states

View system activity

Manage AI model configuration

View security events

View complete audit trail

Users must never access unauthorized routes or actions.

8. LOCKED VISUAL DESIGN

The uploaded reference image is the PRIMARY visual design reference.

The provided VISTAAR logo must also be used.

DO NOT replace the theme with a traditional white/blue government design.

DO NOT use generic Bootstrap dashboard styling.

DO NOT create a plain white admin panel.

The visual identity is LOCKED.

9. VISTAAR COLOR PALETTE

PRIMARY BACKGROUND

Use dark navy / midnight colors:

#050816

#080B1A

#0B1022

#10162B

PURPLE

Primary accent:

#6C3BFF

#7C3AED

#8B5CF6

#9B5CFF

BLUE

Technology / AI accent:

#2563EB

#3B82F6

#4F46E5

MAGENTA / PINK

Secondary accent:

#EC4899

#F43F8C

#FF4FD8

TEXT

Primary:

#FFFFFF

Secondary:

#A7AEC4

Muted:

#6B7280

10. SIGNATURE VISTAAR GRADIENT

Use:

Purple → Blue → Pink

Example:

linear-gradient(135deg, #6C3BFF, #3B82F6, #EC4899)

Use it selectively for:

Primary buttons

AI Match

Hero highlights

Selected states

Important metrics

Scale visualization

Decorative glow

Do NOT put gradients on everything.

11. UI STYLE

The website should feel:

Premium + Futuristic + Government + AI + Enterprise

Use:

Dark navy background

Glass-style cards

Rounded corners

Subtle borders

Soft shadows

Purple/blue glow

White typography

Strong data visualization

Modern charts

Large clean headings

Minimal layout

Premium spacing

Cards should be dark and slightly translucent.

Avoid excessive glassmorphism.

12. GLOW EFFECTS

Use subtle ambient glow.

Purple:

rgba(124,58,237,0.15)

Blue:

rgba(59,130,246,0.12)

Pink:

rgba(236,72,153,0.10)

Use glow around:

AI Match

Hero

CTA

Important metrics

Active navigation

Scale visualization

Do not overuse neon effects.

13. 3D + ANIMATION

Use Framer Motion.

Create professional animations related to VISTAAR.

Examples:

Landing Page

Animated network:

Government → Challenge → AI → Startup → Pilot → Evidence → Scale

AI Match

Animated connection between:

Government Challenge

and

Startup Solution

Evidence Maker

Animate:

Raw Data → Analysis → Evidence → Verification → Impact

Scale

Animate:

One Pilot → Department → Multiple Departments → State → Multiple States

Also use:

Page transitions

Hover animations

Number counters

Progress animations

Chart animations

Glowing nodes

Floating cards

Subtle 3D depth

Micro-interactions

Do NOT use random 3D objects.

Do NOT overload the website with animations.

14. LANDING PAGE

Create a highly polished landing page.

Hero:

VISTAAR

From Government Challenges to Scalable Impact.

Text:

Discover the right innovators. Test solutions. Prove impact. Scale what works.

Buttons:

Explore Solutions

Submit a Challenge

I'm a Startup

Hero visual:

Create a futuristic animated innovation network/dashboard using:

Dark navy

Purple

Blue

Magenta

Glowing nodes

Data connections

Floating cards

15. LANDING PAGE SECTIONS

Include:

Problem

Explain the government innovation gap.

Solution

Explain VISTAAR.

How VISTAAR Works

DISCOVER

MATCH

TEST

PROVE

SCALE

AI Match

Explain intelligent matching.

Evidence Maker

Explain evidence-driven evaluation.

Impact

Show measurable outcomes.

Scale

Explain replication across departments and states.

For Government

Government benefits.

For Startups

Startup benefits.

Trust & Transparency

Explain auditability and evidence.

Final CTA

Build the next generation of government innovation with VISTAAR.

16. MAIN NAVIGATION

After authentication, use a modern dashboard layout.

Sidebar:

Overview

Challenges

AI Match

Startups

Pilots

Evidence Maker

Impact

Scale

Reports

Notifications

Audit Trail

AI Model

Settings

Navigation must change based on role.

17. GOVERNMENT DASHBOARD

Show:

Active Challenges

Active Pilots

Startups

Verified Solutions

Proven Solutions

Scaled Solutions

Total Beneficiaries

Total Impact

Create:

Innovation Funnel

Challenges → Matches → Pilots → Proven → Scaled

Charts:

Challenges by department

Pilot success rate

Impact trend

Solutions by sector

Geographic distribution

Scaling progress

Recent activity:

Challenge created

Startup matched

Pilot created

Evidence submitted

Pilot approved

Solution scaled

18. CHALLENGE MANAGEMENT

Government can create challenges.

Fields:

Title

Problem Statement

Department

State

Location

Sector

Category

Current Process

Existing Limitations

Target Beneficiaries

Expected Outcome

Budget

Timeline

Required Technology

Required Capabilities

KPIs

Eligibility

Certifications

Priority

Workflow:

Draft → Published → Matching → Pilot → Completed

Buttons must actually work:

Save Draft

Publish

Edit

Find AI Matches

Close Challenge

Persist data.

19. CHALLENGE MARKETPLACE

Create searchable challenge cards.

Display:

Challenge

Department

State

Sector

Priority

Deadline

Status

Technology

Number of matches

Filters:

Department

State

Sector

Technology

Priority

Status

20. AI MATCH ENGINE

This is a CORE VISTAAR FEATURE.

Government clicks:

FIND AI MATCHES

The system analyzes challenge requirements against startup solutions.

Scoring:

Problem Fit — 30%

Technology Fit — 20%

Impact Potential — 20%

Evidence Strength — 15%

Scalability — 10%

Deployment Readiness — 5%

Example:

92% MATCH

Display:

Problem Fit: 95%

Technology Fit: 90%

Impact Potential: 94%

Evidence Strength: 87%

Scalability: 91%

Deployment Readiness: 89%

Show top matching startups ranked by score.

21. AI EXPLAINABILITY

AI must NOT be a black box.

Every match must show:

WHY THIS STARTUP?

Examples:

Strong problem alignment

Technology compatibility

Similar previous deployment

Strong evidence

High scalability

Suitable deployment environment

Create:

AI DECISION TRACE

Show:

Input factors

Match factors

Score calculation

Evidence considered

Confidence

Limitations

Clearly distinguish:

AI RECOMMENDATION

from:

GOVERNMENT DECISION

The AI recommends.

The authorized government user decides.

22. STARTUP MARKETPLACE

Create:

STARTUPS

Government can discover startups.

Cards:

Logo

Startup name

Domain

Solution

Match score

Evidence score

Scale readiness

Deployment status

Filters:

Sector

Technology

State

Evidence

Deployment

Match Score

Scalability

23. STARTUP PROFILE

Show:

Startup name

Founder

Description

Problem

Solution

Technology

Team

Previous deployments

Government deployments

Case studies

Certifications

Evidence

KPIs

Geographic coverage

Scale readiness

Government actions:

Invite to Challenge

Start Collaboration

View Evidence

24. STARTUP IDEA SUBMISSION

Startup owners must be able to add their own startup idea.

Create a multi-step onboarding process.

STEP 1

Startup information

STEP 2

Problem

STEP 3

Solution

STEP 4

Technology

STEP 5

Team

STEP 6

Previous deployments

STEP 7

Evidence

STEP 8

KPIs

STEP 9

Scalability

STEP 10

Documents

STEP 11

Submit for verification

Include:

Progress bar

Save draft

Validation

Success screen

25. PILOT MANAGEMENT

When government selects a startup:

Create a structured pilot.

Pilot fields:

Pilot Name

Government Department

Startup

Location

Start Date

End Date

Budget

Objectives

KPIs

Status

Statuses:

Not Started → In Progress → Under Review → Completed

Milestones:

Deployment

Initial Testing

Data Collection

Mid-Term Evaluation

Final Evaluation

Each milestone:

Owner

Deadline

Target

Status

Evidence

Comments

Approval

26. EVIDENCE MAKER

Create a major feature:

EVIDENCE MAKER

Allow users to upload:

PDF

CSV

Images

Reports

KPI data

Survey results

Before/after data

Deployment data

Transform this into structured evidence.

27. EVIDENCE PASSPORT

Create:

EVIDENCE PASSPORT

Fields:

Problem

Solution

Pilot Location

Baseline

Intervention

KPI

Target

Actual Result

Improvement

Data Source

Verification Status

Date

Responsible Person

Example:

Baseline:

1000 KL/day

After Solution:

720 KL/day

Improvement:

28%

Status:

Verified

28. AI EVIDENCE ANALYSIS

AI should:

Extract KPIs

Summarize uploaded documents

Identify important metrics

Compare baseline and outcome

Detect missing evidence

Detect inconsistencies

Generate insights

Recommend additional evidence

Generate impact summaries

Clearly label:

USER-PROVIDED DATA

VERIFIED DATA

AI ANALYSIS

Never represent AI assumptions as verified facts.

29. PROVE — IMPACT EVALUATION

Create:

IMPACT

Show:

Baseline

Target

Current

Improvement

Achievement %

Charts:

Before/after

KPI progress

Trend

Impact breakdown

Create:

IMPACT SCORE

Example:

87 / 100

Breakdown:

Outcome

Efficiency

Cost Effectiveness

Adoption

Evidence Strength

Sustainability

Show:

WHY THIS SCORE?

30. SCALE ENGINE

Create:

SCALE

Workflow:

Pilot Completed

↓

Evidence Verified

↓

Impact Proven

↓

Scale Assessment

↓

Government Approval

↓

Deployment

Display:

Current deployment

Target departments

Target states

Budget

Infrastructure

Team requirements

Timeline

Risks

Dependencies

Expected beneficiaries

31. AI SCALE RECOMMENDATION

Analyze successful pilots.

Recommend potential replication locations.

Example:

14 potential departments identified

Show:

Location

Similarity

Expected Impact

Estimated Cost

Complexity

Required Modifications

Risks

Government must approve the recommendation.

32. STARTUP DASHBOARD

Show:

Profile Completion

AI Matches

Opportunities

Applications

Active Pilots

Evidence Requests

Pilot Progress

Feedback

Scale Opportunities

Example:

3 New AI Matches

2 Active Pilots

85% Profile Complete

33. EVALUATOR DASHBOARD

Show:

Pending Evaluations

Evidence Awaiting Verification

Pilot Reviews

KPI Evaluations

Completed Reviews

Actions:

Score

Comment

Verify

Reject

Request More Evidence

34. ADMIN DASHBOARD

Show:

Total Users

Government Users

Startup Users

Evaluators

Active Challenges

Active Pilots

System Activity

Failed Logins

Security Events

Audit Events

35. AUDIT TRAIL

Create:

SYSTEM AUDIT TRAIL

Every important action must be logged.

Examples:

Registration

Login

Logout

Failed login

User creation

Role change

Challenge creation

Challenge publication

Startup submission

AI Match

Pilot creation

Milestone update

Evidence upload

Evidence verification

KPI modification

Impact evaluation

Scale approval

Each audit record:

Timestamp

User

Role

Action

Entity

Entity ID

Status

Previous value when appropriate

New value when appropriate

NEVER log:

Passwords

Authentication tokens

API secrets

Private credentials

Add filters:

User

Role

Action

Entity

Date

Status

36. NOTIFICATION CENTER

Create notifications for:

New challenge

New AI match

Startup invitation

Pilot milestone

Evidence request

Evidence approval

Evidence rejection

Pilot completion

Scale recommendation

Government approval

Security events

Notifications should be persisted.

37. REPORT GENERATION

Create:

REPORTS

Reports:

Challenge Report

Pilot Report

Evidence Report

Impact Report

Scale Report

Include:

VISTAAR branding

Executive summary

KPIs

Charts

Evidence

Impact

Recommendations

Audit information

Provide PDF export if feasible.

38. AI MODEL MANAGEMENT

Create:

AI MODEL

Admin dashboard should display:

Current model

Model version

Training dataset size

Last training date

Evaluation metrics

Match success rate

Training data may include:

Historical challenges

Startup profiles

Successful matches

Pilot outcomes

Evidence strength

Expert evaluations

Impact scores

Features:

Train Model

Evaluate Model

Compare Models

Deploy Model

For the SIH prototype, create the complete architecture/workflow without requiring a massive production ML training infrastructure.

39. SEARCH

Create global search across:

Challenges

Startups

Solutions

Pilots

Evidence

Departments

States

Add useful filters.

40. DATABASE ENTITIES

Create proper database structures for:

Users

Roles

Departments

States

Startups

Startup Solutions

Challenges

Challenge Requirements

Matches

Match Factors

Pilots

Milestones

KPIs

Evidence

Evidence Verification

Impact Scores

Scale Projects

Notifications

Audit Logs

AI Model Versions

Use relationships.

41. N8N WORKFLOWS

Create modular workflows.

AUTHENTICATION

React

→ n8n

→ Validation

→ Database

→ Authentication

→ Audit Log

→ Response

AI MATCH

React

→ n8n

→ Challenge Data

→ Startup Data

→ AI Processing

→ Match Calculation

→ Database

→ Response

EVIDENCE

React

→ n8n

→ File/Data

→ Processing

→ AI Analysis

→ Evidence Record

→ Verification

→ Database

PILOT

React

→ n8n

→ Pilot

→ Milestones

→ KPI

→ Notifications

→ Audit Log

SCALE

React

→ n8n

→ Evidence

→ Impact

→ AI Scale Recommendation

→ Government Approval

→ Audit Log

42. FRONTEND API ARCHITECTURE

Create one centralized API/service layer.

Examples:

/auth/register

/auth/login

/auth/logout

/auth/me

/users

/challenges

/challenges/:id

/startups

/startups/:id

/matches

/matches/:id

/pilots

/pilots/:id

/evidence

/evidence/:id

/impact

/scale

/reports

/notifications

/audit

/ai/match

/ai/evidence

/ai/scale

/ai/model

Do not hardcode API URLs throughout React components.

Use environment variables.

43. SECURITY

Implement:

Authentication

Authorization

RBAC

Protected routes

Backend authorization

Secure password hashing

Input validation

File validation

Secure file handling

Rate limiting where appropriate

Environment variables

No API keys in frontend

No secrets in Git

Audit logging

Secure error handling

Never expose internal backend errors to users.

44. ERROR HANDLING

Every major feature must have:

Loading state

Skeleton state

Empty state

Success state

Error state

Retry state

Handle:

Network errors

Authentication errors

Unauthorized access

Database errors

AI errors

File upload errors

n8n workflow errors

45. DEMO DATA

Seed realistic demo data.

GOVERNMENT CHALLENGES

AI-Based Water Leakage Detection

Department:

Municipal Corporation

AI-Based Traffic Optimization

Department:

Urban Development

Smart Waste Segregation

Department:

Municipal Services

Rural Healthcare Access

Department:

Health Department

Create fictional startups with:

Solutions

Technologies

Evidence

KPIs

Previous deployments

Match scores

Pilot data

Impact data

The dashboard should look populated immediately after login.

46. DEVELOPMENT DEMO ACCOUNTS

Create safe development/demo accounts for:

Government Officer

Startup Owner

Evaluator

Admin

Use a development-only seed mechanism.

Do not hardcode production passwords.

47. COMPLETE SIH DEMO FLOW

The complete demo must work like this:

STEP 1

Government Officer logs in.

STEP 2

Creates:

AI-Based Water Leakage Detection

STEP 3

Clicks:

Find AI Matches

STEP 4

VISTAAR displays top startup matches.

STEP 5

Government opens startup profile.

STEP 6

Government selects startup.

STEP 7

Creates pilot.

STEP 8

Pilot dashboard displays milestones and KPIs.

STEP 9

Startup uploads evidence.

STEP 10

Evidence Maker extracts KPI information.

STEP 11

Impact dashboard displays:

Baseline → Result → Impact Score

STEP 12

Government clicks:

Evaluate for Scale

STEP 13

AI recommends departments/states.

STEP 14

Government approves scale.

STEP 15

Audit Trail shows the complete lifecycle.

This should be possible within a 5–10 minute hackathon demonstration.

48. RESPONSIVE DESIGN

Support:

Desktop

Laptop

Tablet

Mobile

Desktop:

Full dashboard.

Mobile:

Simplified navigation and responsive cards.

Maintain the same VISTAAR visual identity across all screen sizes.

49. ACCESSIBILITY

Implement:

Semantic HTML

Keyboard navigation

Proper labels

Good contrast

Focus states

Accessible buttons

Meaningful errors

Screen-reader-friendly structure where practical

50. CODE QUALITY

Use:

TypeScript

Reusable components

Reusable hooks

Service layer

Clean routing

Modular pages

Modular n8n workflows

Environment configuration

Clear naming

Avoid:

Duplicate code

Huge components

Hardcoded API URLs

Hardcoded secrets

Unnecessary libraries

Fake buttons

Fake workflows

Dead pages

51. PROJECT STRUCTURE

Use a clean structure such as:

src/
├── components/
├── pages/
├── layouts/
├── routes/
├── services/
├── hooks/
├── utils/
├── types/
├── auth/
├── charts/
├── animations/
├── data/
└── styles/


Keep n8n workflow configuration organized separately.

52. IMPORTANT — NO FAKE FUNCTIONALITY

Do NOT create:

Buttons that do nothing

Forms that do not save

Fake login

Fake dashboards disconnected from data

Static match scores without a workflow

Fake audit records that never update

Static startup submissions

Static pilot progress

If a feature is difficult to fully integrate, implement the simplest functional version with a clean architecture that can later be expanded.

53. TESTING

Before declaring the project complete:

Install dependencies.

Start React.

Start/connect n8n.

Connect PostgreSQL.

Test registration.

Test login.

Test logout.

Test protected routes.

Test RBAC.

Test challenge creation.

Test startup creation.

Test AI Match.

Test pilot creation.

Test milestone updates.

Test evidence upload.

Test Evidence Maker.

Test impact calculation.

Test scale workflow.

Test notifications.

Test audit trail.

Test search.

Test responsive design.

Fix console errors.

Fix broken routes.

Fix API errors.

Verify important buttons.

Verify data persistence.

54. ENVIRONMENT VARIABLES

Use environment variables.

Create:

.env.example

Never hardcode:

Database passwords

API keys

AI keys

Authentication secrets

n8n credentials

55. FINAL DESIGN CHECK

Before completion, verify every page follows the locked VISTAAR visual system:

Background

Dark Navy

Primary Accent

Purple

Secondary Accent

Blue

Highlight

Magenta/Pink

Text

White / Light Gray

Cards

Dark Glass / Subtle Border

Buttons

Purple → Blue → Pink gradient

Animations

Smooth + Premium

3D

Subtle + Relevant

Charts

Purple / Blue / Pink

There must be NO random color palette.

56. FINAL PRODUCT EXPERIENCE

When a user opens VISTAAR, it should immediately feel like:

AI + Government + Innovation + Evidence + Trust + Scale

The interface should be futuristic but trustworthy.

It should look suitable for:

Smart India Hackathon

Government departments

Startup ecosystem

Innovation teams

Evaluators

Enterprise decision makers

57. FINAL BRAND MESSAGE

Use throughout the product:

Discover the right innovation.

Match with confidence.

Test with structure.

Prove with evidence.

Scale what works.

58. FINAL COMMAND TO ANTIGRAVITY

BUILD VISTAAR NOW.

Use the uploaded VISTAAR logo.

Use the uploaded reference image as the locked visual design direction.

Build the actual working project.

Do not only explain what you would build.

Do not stop at UI generation.

Implement the frontend.

Implement authentication.

Implement RBAC.

Implement n8n workflows.

Implement PostgreSQL persistence.

Implement AI Match.

Implement startup onboarding.

Implement challenge management.

Implement pilots.

Implement Evidence Maker.

Implement impact evaluation.

Implement Scale.

Implement notifications.

Implement reports.

Implement AI Model management.

Implement Audit Trail.

Connect all modules.

Seed realistic demo data.

Run the project.

Test the complete SIH demonstration flow.

Fix errors before finishing.

Prioritize:

FUNCTIONALITY → DATA CONNECTION → SECURITY → UX → VISUAL POLISH

The final result must be a fully working VISTAAR prototype, not a static website.

VISTAAR

From Government Challenges to Scalable Impact.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2e6fa8cf-8d71-437a-9fb8-2754a8f03c88).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
