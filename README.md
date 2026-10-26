# SilverCart 🛒

SilverCart is a mobile application developed as a Final Year Project (FYP) designed to provide an accessible, secure, and intuitive shopping experience tailored for seniors. The application leverages a React Native and Expo frontend integrated with a Supabase backend to offer features like family/trusted contact emergency alerts, simplified user interfaces, and robust security workflows.

## 🚀 Features

* **Senior-Centric UI/UX:** Clean design layouts optimized for readability and ease of navigation based on a custom project design system.
* **Trusted Contacts & Alerts:** Integrated emergency workflows (SMS and email configurations) allowing users to connect with family or caregivers.
* **Robust Database Integration:** Real-time synchronization and secure data storage managed entirely via Supabase.
* **Offline & Rapid Infrastructure Setup:** Migration scripts and guides tailored for seamless local and cloud deployment.

## 📂 Project Architecture & Structure

```text
silvercart/
├── .cursor/               # AI development configurations
├── assets/                # Images, icons, and application media
├── docs/                  # Project documentation and architectural logs
├── mcp/                   # Model Context Protocol integrations
├── src/                   # React Native source application code
│   ├── components/        # Reusable UI components
│   ├── screens/           # Application views and screens
│   ├── services/          # API, Supabase, and notification connectors
│   └── utils/             # Helper functions and constants
└── supabase/              # Database configurations, migrations, and Edge Functions
```

For a comprehensive breakdown of the coding paradigms, state management, and file routing structures, please review `PROJECT_STRUCTURE_AND_ARCHITECTURE.md`.

## 🛠️ Prerequisites & Tech Stack

Ensure you have the following frameworks and packages installed on your development machine:

* **Node.js** (v18+ recommended) & npm
* **Expo CLI** (`npm install -g expo-cli`)
* **Supabase CLI** (for running local database instances)
* **Git**

## 🔧 Installation & Setup

Follow these steps to configure your local development environment:

### 1. Clone the Repository
```bash
git clone https://github.com
cd silvercart
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configurations
Create a copy of the environmental variables template file:
```bash
cp .env.example .env
```
Open `.env` and fill out your specific configuration metrics:
* `SUPABASE_URL`
* `SUPABASE_ANON_KEY`
* SMS / Email API provider keys for emergency workflows

### 4. Database Setup & Migrations
Before spinning up the application, initialize your Supabase schema:

1. Refer to `SETUP_GUIDE.md` and `DATABASE_SETUP_GUIDE_V2.md` for baseline setups.
2. Apply the schema and core workflows using the provided migration files sequentially inside your Supabase SQL editor or through the CLI:
```bash
database_migration_v2.sql
database_migration_v3_trusted_contacts.sql
```

### 5. Start the Application
Run the Expo developer server:
```bash
npx expo start
```
* Press **`a`** to open the app on an Android emulator or connected device.
* Press **`i`** to open the app on an iOS simulator.
* Scan the QR code using the **Expo Go** application on your physical device.

## 🧪 Testing

Test execution pipelines and logging configurations are tracked locally. To run tests, execute:
```bash
npm test
```
Refer to `testing_report.md` for full breakdown analyses on unit tests, error validations, and output logs.

## 📑 Project Documentation

For more granular details regarding the operational framework of SilverCart, consult these documents located in the repository root:
* **Product Requirements:** `SilverCart_PRD_v2.0_UPDATED.md`
* **Design Guidelines:** `DESIGN_SYSTEM.md`
* **Database Models:** `DATABASE_ERD_DETAILED.md`
* **Developer Onboarding:** `QUICK_REFERENCE.md`
