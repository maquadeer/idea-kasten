# Idea-Kasten App

**Idea-Kasten** is a project management application designed to help teams collaborate effectively by breaking down project components, organizing meetings, sharing resources, and visualizing the project's journey through a timeline view. Built with **Next.js**, **Appwrite**, and **PNPM**, the app ensures a modern and seamless user experience.

---

## Features

### 1. **Project Component Breakdown**
- Divide your project into manageable components.
- Assign tasks and deadlines for each component.

### 2. **Organize Meetings**
- Schedule and track team meetings.
- Maintain meeting agendas and notes.

### 3. **Shared Resources**
- Add, manage, and share project-related resources.
- Centralized repository for team assets.

### 4. **Timeline Visualization**
- Get a clear, chronological view of your project’s progress.
- Visualize milestones and deadlines.

---

## Tech Stack

### Frontend:
- **Next.js**: React-based framework for creating fast and scalable web applications.

### Backend:
- **Appwrite**: Backend-as-a-Service for managing databases, authentication, and more.

### Package Manager:
- **PNPM**: Efficient and fast package manager for managing dependencies.

---

## Getting Started

### Prerequisites
Ensure you have the following installed:
- **Node.js** (>= 16.0.0)
- **PNPM** (>= 8.0.0)
- **Appwrite Server** (self-hosted or Appwrite Cloud)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/idea-kasten.git
   cd idea-kasten
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Set Up Appwrite Backend**
   - Install and configure Appwrite server locally or connect to Appwrite Cloud.
   - Set up a new project in the Appwrite dashboard.
   - Update the `.env.local` file with your Appwrite project details:
     ```env
     NEXT_PUBLIC_APPWRITE_ENDPOINT=https://your-appwrite-endpoint/v1
     NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
     NEXT_PUBLIC_APPWRITE_API_KEY=your-api-key
     ```

4. **Run the Development Server**
   ```bash
   pnpm dev
   ```

5. **Build for Production**
   ```bash
   pnpm build
   ```

6. **Start the Production Server**
   ```bash
   pnpm start
   ```

---

---

## Scripts

- **Development**: `pnpm dev`  
- **Build**: `pnpm build`  
- **Production Start**: `pnpm start`  
- **Lint**: `pnpm lint`  

---
