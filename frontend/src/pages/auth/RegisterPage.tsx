import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [facility, setFacility] = useState('Shirpur Primary Health Centre');
  const [role, setRole] = useState<'HEALTHCARE_WORKER' | 'ADMINISTRATOR'>('HEALTHCARE_WORKER');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        facility: facility.trim(),
      });
      navigate(role === 'ADMINISTRATOR' ? '/admin' : '/app');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. An account with this email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F6] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#173B3F] text-white flex items-center justify-center shadow-xs">
            <Eye className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold text-[#173B3F] tracking-tight">RetinaAI</span>
        </Link>
        <h2 className="text-xl font-bold text-[#173B3F]">Register Healthcare Account</h2>
        <p className="text-xs text-[#667477] mt-1">
          Set up credentials for rural health screening or district administration
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 sm:px-10 rounded-2xl border border-[#DCE3E3] shadow-sm">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-[#B94A48]/10 border border-[#B94A48]/30 flex gap-2 text-xs text-[#B94A48]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#173B3F] mb-1">Full Name & Title</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Rajesh Kumar / Sunita Rao (CHO)"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#DCE3E3] focus:outline-none focus:ring-2 focus:ring-[#2E6F73] bg-[#F7F8F6]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#173B3F] mb-1">Official Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@health.gov.in"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#DCE3E3] focus:outline-none focus:ring-2 focus:ring-[#2E6F73] bg-[#F7F8F6]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#173B3F] mb-1">Assigned Health Facility / PHC</label>
              <input
                type="text"
                required
                value={facility}
                onChange={(e) => setFacility(e.target.value)}
                placeholder="e.g. Wardha Primary Health Centre"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#DCE3E3] focus:outline-none focus:ring-2 focus:ring-[#2E6F73] bg-[#F7F8F6]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#173B3F] mb-1">System Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#DCE3E3] focus:outline-none focus:ring-2 focus:ring-[#2E6F73] bg-[#F7F8F6]/30 text-[#172326]"
              >
                <option value="HEALTHCARE_WORKER">Healthcare Worker / CHO (Screening)</option>
                <option value="ADMINISTRATOR">Administrator (Analytics & Governance)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#173B3F] mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#DCE3E3] focus:outline-none focus:ring-2 focus:ring-[#2E6F73] bg-[#F7F8F6]/30"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                isLoading={loading}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Create Account
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-[#DCE3E3] text-center text-xs text-[#667477]">
            <span>Already registered? </span>
            <Link to="/login" className="font-semibold text-[#2E6F73] hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
