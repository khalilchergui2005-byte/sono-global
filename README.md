# SafarOS (Sono Global) — Travel Booking Platform

SafarOS is a full-stack web platform designed for travel and hospitality management, allowing users to search and book flights and hotels seamlessly. 

This repository serves as a functional prototype and practical laboratory, demonstrating modern web development practices, secure authentication mechanisms, and integration with third-party APIs.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Framework:** [Next.js](https://nextjs.org/) (React & TypeScript)
- **Styling:** Tailwind CSS / Modern UI Component Library
- **Database & ORM:** PostgreSQL hosted on [Supabase](https://supabase.com/), managed via [Prisma ORM](https://www.prisma.io/)
- **Authentication & Security:** Custom role-based access control (RBAC), password hashing with `bcrypt`, rate-limiting logic
- **Payments & External APIs:**
  - **Flight/Hotel Search:** [Duffel API](https://duffel.com/) (Integrated in Test Mode)
  - **Payment Gateway:** [Chargily Pay](https://chargily.com/) (HMAC-SHA256 signature verification)
- **CI/CD & Deployment:** Automated code verification via **GitHub Actions**, hosted on [Vercel](https://vercel.com/)

---

## Key Features & Technical Highlights

### 1. Booking Workflow & API Integration
- Asynchronous API requests to **Duffel API (Test Mode)** for real-time flight data fetching.
- Secure payment processing workflow using **Chargily Pay**, enforcing webhook signature validation via HMAC-SHA256 to prevent request tampering.

### 2. Custom Admin Dashboard & Security Controls
- **Role-Based Access Control (RBAC):** Distinct permissions for administrators and end-users.
- **Authentication Security:** Passwords hashed using `bcrypt`.
- **Brute-Force Protection:** Rate-limiting implementation allowing a maximum of 5 login attempts per 15-minute window.

### 3. Automated Quality Assurance
- Integrated **GitHub Actions** workflow for continuous integration (CI) to validate TypeScript types and code linting on every push.

---

## ⚙️ Local Development Setup

To run this project locally, follow these steps:

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm** or **yarn** or **pnpm**
- A **PostgreSQL** database instance (or Supabase project)

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/khalilchergui2005-byte/sono-global.git](https://github.com/khalilchergui2005-byte/sono-global.git)
   cd sono-global
