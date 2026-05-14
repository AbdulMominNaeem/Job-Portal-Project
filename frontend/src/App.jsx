import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import JobsList from './pages/JobsList.jsx';
import JobDetail from './pages/JobDetail.jsx';
import Companies from './pages/Companies.jsx';
import NotFound from './pages/NotFound.jsx';

import CandidateDashboard from './pages/candidate/Dashboard.jsx';
import CandidateProfile from './pages/candidate/Profile.jsx';
import CandidateApplications from './pages/candidate/Applications.jsx';
import CandidateSaved from './pages/candidate/Saved.jsx';

import EmployerDashboard from './pages/employer/Dashboard.jsx';
import EmployerJobs from './pages/employer/Jobs.jsx';
import EmployerJobForm from './pages/employer/JobForm.jsx';
import EmployerApplicants from './pages/employer/Applicants.jsx';
import EmployerCompany from './pages/employer/Company.jsx';

import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminUsers from './pages/admin/Users.jsx';
import AdminJobs from './pages/admin/Jobs.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={<JobsList />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/companies" element={<Companies />} />

        <Route
          path="/candidate"
          element={
            <ProtectedRoute roles={['CANDIDATE']}>
              <CandidateDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/profile"
          element={
            <ProtectedRoute roles={['CANDIDATE']}>
              <CandidateProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/applications"
          element={
            <ProtectedRoute roles={['CANDIDATE']}>
              <CandidateApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/saved"
          element={
            <ProtectedRoute roles={['CANDIDATE']}>
              <CandidateSaved />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer"
          element={
            <ProtectedRoute roles={['EMPLOYER']}>
              <EmployerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/jobs"
          element={
            <ProtectedRoute roles={['EMPLOYER']}>
              <EmployerJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/jobs/new"
          element={
            <ProtectedRoute roles={['EMPLOYER']}>
              <EmployerJobForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/jobs/:id/edit"
          element={
            <ProtectedRoute roles={['EMPLOYER']}>
              <EmployerJobForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/jobs/:id/applicants"
          element={
            <ProtectedRoute roles={['EMPLOYER']}>
              <EmployerApplicants />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/company"
          element={
            <ProtectedRoute roles={['EMPLOYER']}>
              <EmployerCompany />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/jobs"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminJobs />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
