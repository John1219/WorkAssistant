# ShiftSync — Training Duty Workforce Scheduler

A web application designed for scheduling employees for training events, specifically balancing **Parking Duty**, **Classroom Support**, and operational logistics. Built for seamless hosting on **GitHub Pages**.

![ShiftSync](https://img.shields.io/badge/Hosting-GitHub%20Pages-blue)
![React](https://img.shields.io/badge/React-19-indigo)
![Tailwind](https://img.shields.io/badge/Tailwind%20CSS-v4-cyan)
![Vite](https://img.shields.io/badge/Vite-6-purple)

---

## 🚀 Key Features

- **Employee Roster Management**:
  - Add staff members individually or use **Bulk Add Staff** to paste lists from Excel or emails.
  - Tag qualifications (e.g. *Parking Duty*, *Classroom Support*, *Registration*, *Floater*).
  - Track shift limits and set unavailable dates.

- **Flexible Training Class & Shift Setup**:
  - Configure multi-day training events and daily sessions (e.g., Morning 7:30 AM – 12:00 PM, Afternoon 12:30 PM – 5:00 PM).
  - Customize dynamic headcounts needed for Parking Duty and Classroom Support independently for each shift.
  - One-click "Copy to +1 Day" to replicate shift patterns across multi-day classes.

- **Intelligent Fair Auto-Scheduler**:
  - Automatically balances workloads among available staff.
  - Rotates duties so no individual is overloaded with parking duty while others only support classes.
  - Guarantees no double-booking and respects employee availability dates.

- **Multi-User Collaboration & Sharing**:
  - **Zero Server Costs**: Runs entirely on client-side GitHub Pages.
  - **1-Click JSON Backup / Restore**: Export the full schedule to send to a coworker, or import their version.
  - **Export to CSV / Excel**: Generate clean spreadsheets of all shift duties.
  - **Print-Optimized Duty Sheet**: Formatted for clipboards, bulletin boards, and attendee hand-outs.
  - **Optional Real-Time Cloud Sync**: Built-in support for free Firebase Realtime Database if live simultaneous editing is desired.

---

## 🌐 Deploying to Your GitHub Pages (2 Steps)

1. **Push this repository to your GitHub account**:
   ```bash
   git add .
   git commit -m "Initial commit of Training Shift Scheduler"
   git branch -M main
   git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub.
   - Click **Settings** → **Pages** (in the left sidebar).
   - Under **Build and deployment** → **Source**, select **GitHub Actions**.
   - The included `.github/workflows/deploy.yml` workflow will automatically build and publish the web app to `https://<YOUR-USERNAME>.github.io/<YOUR-REPO-NAME>/`.

---

## 💻 Local Development

To run the application locally on your computer:

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Build production bundle
npm run build
```
