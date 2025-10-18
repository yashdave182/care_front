# CareFlow Nexus - AI Hospital Management System

An advanced AI-powered hospital management system with intelligent emergency response, real-time bed tracking, and automated resource allocation.

## Features

- **Real-time Hospital Monitoring Dashboard**: Visualizes active emergencies and bed occupancy
- **3D Bed Map**: Interactive 3D visualization of hospital beds using Three.js
- **Emergency Trigger & Management**: Component to trigger and view active emergencies
- **Role-based Access Control**: Admin, Nurse, and Doctor dashboards
- **AI-powered Staff Assignment**: Uses Google Gemini API to intelligently assign nurses and doctors to patients
- **User Authentication**: Secure login for different user roles
- **Setup Wizard**: Initial configuration for hospital settings

## User Roles

### Admin
- Full system access
- Add new patients with AI-powered staff assignment
- Monitor all hospital resources
- View analytics and reports

### Nurse
- View personal assignments
- See patient locations and details
- Update assignment status

### Doctor
- View assigned patients
- Access patient information
- Mark patients as seen

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Add your Gemini API key to the `.env` file:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Demo Credentials

- **Admin**: admin@hospital.com / admin123
- **Nurse**: n001@hospital.com / nurse123
- **Doctor**: d001@hospital.com / doctor123

## Technologies Used

- React with Vite
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Zustand for state management
- Three.js for 3D visualization
- Google Gemini API for AI capabilities
- React Router for navigation

## AI Features

The system uses Google's Gemini API to:
- Analyze patient conditions and requirements
- Match patients with the most suitable nurses and doctors
- Optimize resource allocation based on staff specialization and availability
- Provide reasoning for all AI-powered assignments

To enable AI features, you must provide a valid Gemini API key in your environment variables.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
├── integrations/   # Third-party service integrations
├── lib/            # Utility functions and services
├── pages/          # Page components
├── store/          # Global state management
└── App.tsx         # Main application component
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## License

This project is licensed under the MIT License.