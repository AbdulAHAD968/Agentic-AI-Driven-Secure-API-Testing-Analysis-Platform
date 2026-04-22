"use client";

import { useEffect, useState } from "react";
import AdminLayoutWrapper from "@/components/AdminLayoutWrapper";
import { getUsers, updateUser, deleteUser } from "@/services/adminService";
import ConfirmModal from "@/components/ConfirmModal";
import { toast } from "react-hot-toast";
import { 
  Search, Filter, MoreVertical, Trash2, 
  UserCheck, UserX, Shield, Mail, Calendar, User
} from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, loading: false });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    setFilteredUsers(
      users.filter(u => 
        u.name.toLowerCase().includes(term) || 
        u.email.toLowerCase().includes(term)
      )
    );
  }, [search, users]);

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (user) => {
    try {
      const newStatus = !user.isEmailVerified; 
      await updateUser(user._id, { isEmailVerified: newStatus });
      toast.success(`User updated.`);
      fetchUsers();
    } catch (err) {
      toast.error("Update failed.");
    }
  };

  const handleDelete = async () => {
    setDeleteModal(prev => ({ ...prev, loading: true }));
    try {
      await deleteUser(deleteModal.id);
      toast.success("User removed.");
      fetchUsers();
      setDeleteModal({ open: false, id: null, loading: false });
    } catch (err) {
      toast.error("Delete failed.");
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleRoleToggle = async (user) => {
    try {
      const newRole = user.role === "admin" ? "user" : "admin";
      await updateUser(user._id, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (err) {
      toast.error("Role update failed.");
    }
  };

  return (
    <AdminLayoutWrapper>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl mb-2">User Directory</h1>
          <p className="text-olive-gray font-sans">Manage permissions and oversee account statuses.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-gray" />
            <input 
              type="text" 
              placeholder="Filter by name or email..." 
              className="bg-ivory border border-border-cream rounded-xl pl-12 pr-4 py-2.5 text-sm w-64 outline-none focus:ring-2 focus:ring-terracotta/10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-border-cream rounded-xl text-sm font-medium hover:bg-warm-sand/20 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      <div className="bg-ivory border border-border-cream rounded-[32px] overflow-hidden shadow-whisper">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-warm-sand/10 border-b border-border-cream">
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-stone-gray">User</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-stone-gray">Role</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-stone-gray">Verification</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-stone-gray">Joined</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-stone-gray text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-cream">
              {filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-warm-sand/5 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-warm-sand/30 flex items-center justify-center overflow-hidden border border-border-cream">
                        {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-stone-gray" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-near-black">{u.name}</p>
                        <p className="text-xs text-olive-gray font-sans">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <button 
                      onClick={() => handleRoleToggle(u)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        u.role === "admin" 
                          ? "bg-terracotta/10 border-terracotta/20 text-terracotta" 
                          : "bg-warm-sand/20 border-border-cream text-stone-gray"
                      }`}
                    >
                      <Shield className="w-3 h-3" /> {u.role}
                    </button>
                  </td>
                  <td className="px-8 py-5">
                    <button 
                      onClick={() => handleStatusToggle(u)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        u.isEmailVerified 
                          ? "bg-green-50 border-green-100 text-green-600" 
                          : "bg-red-50 border-red-100 text-red-600"
                      }`}
                    >
                      {u.isEmailVerified ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                      {u.isEmailVerified ? "Verified" : "Pending"}
                    </button>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-xs text-olive-gray font-sans">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setDeleteModal({ open: true, id: u._id, loading: false })}
                        className="p-2 text-stone-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-stone-gray hover:text-near-black hover:bg-warm-sand/20 rounded-lg transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-warm-sand/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-stone-gray" />
              </div>
              <p className="text-olive-gray font-serif text-lg">No users found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal 
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null, loading: false })}
        onConfirm={handleDelete}
        loading={deleteModal.loading}
        title="Delete Narrative Profile"
        message="Are you sure you want to permanently erase this user account? All associated data will be purged. This action is irreversible."
      />
    </AdminLayoutWrapper>
  );
}
