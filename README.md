# SafeNest – Rental Listing Verification Platform
**Motto:** Where trust builds homes. 
## Project Overview

SafeNest is a rental listing verification platform designed to reduce rental fraud by providing verified property listings, secure holding deposits, and transparent communication between renters, landlords, and agents.
The platform combines trust and safety systems, secure transactions, and marketplace functionality to create a safer rental experience for users.
## Project Status
SafeNest is currently being developed as a capstone project. Features and technical specifications may evolve during implementation and testing phases.
## Problem Statement

Rental fraud remains a major issue across many African cities where property transactions frequently occur through informal channels such as social media platforms, messaging apps, and unverified agent networks.
Common problems include:
- Fake property listings
- Advance payment scams
- Duplicate advertisements
- Unverified agents
- Poor dispute resolution systems
These challenges create financial risks and reduce trust within rental transactions.
## Proposed Solution
SafeNest introduces a secure rental verification ecosystem that improves trust and transparency between renters, landlords, and agents.
The platform provides:
- Identity verification workflows
- Verified property listings
- Secure holding deposits
- In-app communication
- Scam reporting systems
- Admin moderation and dispute support
## Competitive Advantage

SafeNest differentiates itself from traditional rental platforms by prioritizing trust, transparency, and fraud prevention through verification workflows, escrow-style deposits, and logged communication systems.

| Feature	| Traditional Listings / Social Media	| SafeNest |
|---------|-------------------------------------|----------|
| Verified Users	| Limited or unavailable	| Mandatory verification |
|Payment Security	| Direct/off-platform payments	| Escrow-style holding deposits |
| Communication	| WhatsApp/social media	| Logged in-app communication |
| Fraud Reporting	| Minimal support	| Built-in report scam system |
| Verification Badges	| Often unavailable	| Admin-approved badges |
| Dispute Support	| Limited accountability	| Stored logs and dispute workflows |
## Research Foundation
This project was informed by:
- Industry gap analysis 
- Competitor research 
- Rental fraud pattern analysis 
- Target user research
## Core Features

### Authentication System
Role-based registration and login for renters, landlords, and agents.
### Property Listings
Users can browse, search, and filter verified rental properties by location, property type, and price range.
### Verification Badges
Verified landlords and agents receive badges after successful document review and approval.
### In-App Chat System
Secure communication between renters and landlords/agents through monitored in-app messaging.
### Holding Deposit Workflow
Renters can securely pay holding deposits within the platform using escrow-style payment handling.
### Report Scam System
Users can report suspicious listings, fake agents, or fraudulent activity through the report system.
### User Dashboards
Dedicated dashboards allow renters, landlords, and agents to manage activities, listings, chats, deposits, and verification status.
## Trust & Safety Features

### Identity Verification
Landlords and agents are required to submit identification and supporting documents for verification before receiving verification badges.
### Property Verification
Property ownership documents are reviewed to help reduce fake or misleading listings.
### Secure Deposit Handling
Holding deposits are processed within the platform to reduce unsafe off-platform transactions.
### Communication Logging
Chats and transaction-related activities may be logged to support transparency and dispute investigations.
### Fraud Reporting
Users can report suspicious listings, fake agents, payment scams, or other fraudulent activities directly within the platform.
### Admin Moderation
Admins review verification requests, moderate listings, investigate reports, and manage disputes.
## Platform Workflows

### Verification Workflow
Register → Upload documents → Admin review → Approval or rejection → Badge assignment
### Deposit Workflow
Renter selects property → Holding deposit paid in-app → Funds securely held → Deposit refunded or released based on agreement outcome
### Scam Reporting Workflow
User submits report → Evidence reviewed by admin → Appropriate moderation or enforcement action taken
### Communication Workflow
Users communicate through in-app chat → Chat history stored for transparency and dispute support
## Key Platform Modules

### Landing Page
Introduces the platform, trust systems, featured listings, and navigation links.
### Browse Properties Page
Allows users to search and filter verified property listings.
### Property Details Page
Displays detailed property information, verification status, authenticity indicators, and landlord/agent details.
### Chat System
Supports secure communication between renters and landlords or agents.
### Deposit Payment Page
Handles secure holding deposit payments and escrow tracking.
### Report Scam Page
Allows users to report suspicious listings, payment scams, or fraudulent behavior.
### User Dashboards
Provides role-based dashboards for renters, landlords, agents, and admins.
## Target Users
### Primary Users
- Renters
- Landlords
- Property Agents
### Secondary Users
- Property Management Companies
- Housing Cooperatives
- Real Estate Firms
## Team Roles
### Product Management
Defines product goals, workflows, MVP scope, and feature prioritization.
### Product Design (UI/UX)
Designs user interfaces, user flows, and platform experience.
### Frontend Development
Builds the web interface and implements user-facing functionality.
### Backend Development
Develops APIs, authentication systems, verification workflows, payment handling, and database management.
### Mobile Development
Builds the mobile application experience using React Native.
### Technical Writing
Creates platform documentation, onboarding guides, verification policies, safety documentation, FAQs, and technical documentation.
## Contributors

This project was developed collaboratively by the SafeNest capstone team, including:

### Product Management:
- Laurette Chiamaka Ibekwe
- Favour Dike
- Mariam Aramide Olaniyi
- Quawiyyah Adegbola
- Joy Udeh
- Susan Bako

### Product Design:
- Victor Akinkugbe
- Aminu Oyindamola Ayodeji
- Ajeigbe Oluwatosin
- Miracle Onayemi
- Ogunrinu Love Eunice
- Eghosa Oyegun, Dorcas Oguntominiyi
- Opeodu Adebisi Oluwafikunayomi
- Musa Rukayah Wuraola
- Miracle Aniekedorenyin Ukpe
- Naabura Jessica Dumlesi
- Obatunwase Emmanuel

### Frontend Development: 
- Arafat Oluwadamilola Shuaib
- Razaq Habeeb Temitope
- Paul Ayomide Olorunto
- Laila Binta Usman
- Oluwafemi Ahmed Ali

### Backend Development: 
- Marvellous Henry
- Chiemena Chibuzo
- Maxwell Sunday Agada
- Chinedu Umeh
- Kailotachukwu Igwe

### Mobile App Development:
- Ayinde Tobi Oyelade
- Lawal Akeem
- Chinbana Joshua Atiku

### Technical Writing: 
- Maryam Oyinkansola Abdulwahab

## Documentation
The platform documentation includes:
- README
- Verification Policy
- Fraud Prevention Strategy
- Renter Safety Guide
- Dispute Resolution Guide
- Compliance Documentation
- Renter Onboarding Guide
- Landlord Onboarding Guide
- Agent Onboarding Guide
- FAQ
- API Documentation
- Release Notes
## Repository Structure
SafeNest/
│
├── docs/
│ ├── Research and Product Documentation
│ ├── Trust, Safety and Compliance Documentation
│ └── User Guide and Technical Documentation
│
├── src/
│ └── Frontend and backend source code
│
└── assets/
└── Design assets and screenshots

## Tech Stack
### Frontend
- React
- Vite
- Tailwind CSS
### Backend
- Node.js
- Express.js
### Database
- MongoDB
- Mongoose
### Authentication & Security
- JSON Web Tokens (JWT)
### Communication
- Socket.IO (Real-Time Messaging)
### Mobile
- Mobile Application Module (In Development)
## Installation
1. Repository URL to be provided by the development team.

2. Clone the repository.

git clone <repository-url>

3. Navigate into the project directory.

cd safenest

4. Install dependencies.

npm install

5. Start the development server.

npm run dev
Detailed setup instructions will be provided during implementation.
## Future Improvements
Possible future enhancements include:
- AI fraud detection
- Duplicate image detection
- Reputation scoring systems
- Smart property recommendations
- GPS property verification
- Digital rental agreements
## Conclusion

SafeNest aims to improve trust, transparency, and safety within rental transactions by combining verification systems, secure payments, communication transparency, and fraud prevention workflows into a single platform.
The project focuses on addressing key rental challenges while providing a safer and more structured rental experience for users.
## Technical Writing Deliverables
The Technical Writing team produced the following documentation for the SafeNest project:
### README
- Project overview and repository documentation
### Research and Product Documentation
- Problem Statement
- Industry Gap Analysis
- Competitor Research
- Fraud Pattern Analysis
- Product Workflows
### Trust, Safety and Compliance Documentation
- Verification Policy
- Fraud Prevention Strategy
- Renter Safety Guide
- Compliance Documentation
- Dispute Resolution Guide

### User Guide and Technical Documentation
- Renter Onboarding Guide
- Landlord Onboarding Guide
- Agent Onboarding Guide
- Platform Usage Guide
- FAQ
- API Documentation
- Release Notes
- Help Center and Support Documentation


