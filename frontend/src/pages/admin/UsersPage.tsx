import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Shield, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { adminService } from '../../services/api';
import { User } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserStatus = async (user: User) => {
    try {
      await adminService.updateUser(user.id, { is_active: !user.is_active });
      setUsers(users.map((u) => (u.id === user.id ? { ...u, is_active: !u.is_active } : u)));
    } catch (e) {
      alert('Failed to update user status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#173B3F]">Authorized Personnel</h1>
          <p className="text-xs text-[#667477] mt-0.5">
            Manage rural health screening operators and district tele-ophthalmology administrators
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchUsers}
          icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Refresh Users
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-[#DCE3E3] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8F6] text-[#667477] border-b border-[#DCE3E3] uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3">Operator Name</th>
                <th className="px-6 py-3">Email Address</th>
                <th className="px-6 py-3">Assigned Facility</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Account Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE3E3] text-[#172326]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#F7F8F6]/60 transition-colors">
                  <td className="px-6 py-3.5 font-bold text-[#173B3F]">
                    {u.name}
                  </td>
                  <td className="px-6 py-3.5 text-[#667477] font-mono">
                    {u.email}
                  </td>
                  <td className="px-6 py-3.5 text-[#172326]">
                    {u.facility || 'Primary Health Centre'}
                  </td>
                  <td className="px-6 py-3.5">
                    <Badge
                      variant={u.role === 'ADMINISTRATOR' ? 'teal' : 'default'}
                      size="sm"
                    >
                      {u.role.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${u.is_active ? 'text-[#4D8061]' : 'text-[#B94A48]'}`}>
                      {u.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {u.is_active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button
                      onClick={() => toggleUserStatus(u)}
                      className={`text-xs font-semibold hover:underline cursor-pointer ${
                        u.is_active ? 'text-[#B94A48]' : 'text-[#4D8061]'
                      }`}
                    >
                      {u.is_active ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
