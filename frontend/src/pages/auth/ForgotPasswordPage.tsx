import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
        <h2 className="text-xl font-bold text-[#173B3F]">Reset Password</h2>
        <p className="text-xs text-[#667477] mt-1">
          Recover access to your RetinaAI clinical account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 sm:px-10 rounded-2xl border border-[#DCE3E3] shadow-sm">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#4D8061]/15 text-[#4D8061] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#173B3F]">Reset Instructions Sent</h3>
              <p className="text-xs text-[#667477] leading-relaxed">
                If an account exists for <strong>{email}</strong>, a secure password reset link has been dispatched. Please contact your district tele-ophthalmology administrator if you require urgent assistance.
              </p>
              <div className="pt-2">
                <Link to="/login">
                  <Button variant="outline" size="sm" className="w-full">
                    Return to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#173B3F] mb-1">Registered Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@health.gov.in"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#DCE3E3] focus:outline-none focus:ring-2 focus:ring-[#2E6F73] bg-[#F7F8F6]/30"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" size="md" className="w-full">
                  Send Recovery Link
                </Button>
              </div>

              <div className="text-center pt-2">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-[#667477] hover:text-[#173B3F]">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to login</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
