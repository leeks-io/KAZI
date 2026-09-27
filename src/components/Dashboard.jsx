import React, { useState } from 'react';
import WorkerDashboard from './WorkerDashboard';
import EmployerDashboard from './EmployerDashboard';

export default function Dashboard({
  user,
  role = 'worker',
  applications = [],
  savedJobs = [],
  myPostings = [],
  onApplyJob,
  onSaveJob,
  onLogout
}) {
  // If user object provides role, use it; otherwise default to role prop or internal state
  const [currentRole, setCurrentRole] = useState(user?.role || role || 'worker');

  if (currentRole === 'employer') {
    return (
      <EmployerDashboard
        user={user || { name: 'Lekki Property Mgt', role: 'employer' }}
        onLogout={onLogout}
        onSwitchToWorker={() => setCurrentRole('worker')}
        initialPage="empDash"
      />
    );
  }

  return (
    <WorkerDashboard
      user={user || { name: 'Ada Okafor', role: 'worker' }}
      onLogout={onLogout}
      onSwitchToEmployer={() => setCurrentRole('employer')}
      initialPage="dashboard"
      externalApplications={applications}
      externalSavedJobs={savedJobs}
      onApplyJob={onApplyJob}
      onSaveJob={onSaveJob}
    />
  );
}
