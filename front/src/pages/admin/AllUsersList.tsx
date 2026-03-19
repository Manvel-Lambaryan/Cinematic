import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Crown,
  Edit3,
  Trash2,
  Fingerprint,
  Activity,
  Zap,
  Check,
} from "lucide-react";
import { useAdminStore } from "../../store/admin/useAdminStore";
import { useAdminUIStore } from "../../store/admin/useAdminUIStore";

export const Users = () => {
  // Admin store selectors - using precise typing
  const users = useAdminStore(state => state.users);
  const usersLoading = useAdminStore(state => state.usersLoading);
  const usersError = useAdminStore(state => state.usersError);
  const selectedUser = useAdminStore(state => state.selectedUser);
  const isUserEditModalOpen = useAdminStore(state => state.isUserEditModalOpen);
  
  // Admin store actions
  const fetchUsers = useAdminStore(state => state.fetchUsers);
  const updateUser = useAdminStore(state => state.updateUser);
  const deleteUser = useAdminStore(state => state.deleteUser);
  const setSelectedUser = useAdminStore(state => state.setSelectedUser);
  const toggleUserEditModal = useAdminStore(state => state.toggleUserEditModal);
  const clearUsersError = useAdminStore(state => state.clearUsersError);
  
  // Admin UI store selectors
  const addNotification = useAdminUIStore(state => state.addNotification);
  const setPageLoading = useAdminUIStore(state => state.setPageLoading);
  
  // Local state for form handling
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRole, setEditingRole] = useState<'user' | 'admin'>('user');
  // Fetch users on component mount with proper error handling
  useEffect(() => {
    const loadUsers = async () => {
      setPageLoading(true);
      try {
        await fetchUsers();
      } catch (error) {
        // Error is handled in the store, but we ensure page loading is turned off
        console.error('Failed to load users:', error);
      } finally {
        setPageLoading(false);
      }
    };
    
    loadUsers();
  }, [fetchUsers, setPageLoading]);
  
  // Handle error notifications with proper cleanup
  useEffect(() => {
    if (usersError) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: usersError,
      });
      clearUsersError();
    }
  }, [usersError, addNotification, clearUsersError]);
  
  // Handle user edit modal state
  useEffect(() => {
    if (selectedUser) {
      setEditingRole(selectedUser.role);
    }
  }, [selectedUser]);
  
  // Handle user role update
  const handleRoleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    try {
      await updateUser(selectedUser._id, { role: editingRole });
      
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'User role updated successfully',
      });
      
      setSelectedUser(null);
      toggleUserEditModal();
    } catch (error) {
      // Error is handled in the store and notification system
      console.error('Failed to update user role:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await deleteUser(userId);
      
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'User deleted successfully',
      });
    } catch (error) {
      // Error is handled in the store and notification system
      console.error('Failed to delete user:', error);
    }
  };
  
  // Handle user edit
  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditingRole(user.role);
    toggleUserEditModal();
  };
  
  // Handle modal close
  const handleCloseModal = () => {
    setSelectedUser(null);
    toggleUserEditModal();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-slate-200 font-sans p-4 md:p-12 relative overflow-hidden transition-colors duration-700">
      {/* --- BACKGROUND EFFECTS --- */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(225,29,72,0.05),transparent_50%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* --- HEADER --- */}
        <header className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/10 rounded-full mb-6">
              <Zap size={12} className="text-red-600 fill-current" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">
                Control Panel
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none mb-4 italic">
              Users & <span className="text-red-600">Admin List </span> 
            </h1>
          </motion.div>
        </header>

        {/* --- REGISTRY LIST --- */}
        <div className="space-y-3">
          {usersLoading ? (
            <div className="flex items-center justify-center py-12">
              <Activity className="animate-spin text-red-600" size={24} />
              <span className="ml-2 text-slate-400">Loading users...</span>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {users.map((user) => (
              <motion.div
                key={user._id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="group"
              >
                <div className="bg-white dark:bg-white/[0.03] backdrop-blur-md border border-slate-200 dark:border-white/5 p-5 md:p-6 rounded-[30px] transition-all duration-300 hover:border-red-600/30">
                  <div className="flex flex-col md:flex-row items-center gap-5">
                    <div className="w-16 h-16 rounded-[22px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-white/10 group-hover:scale-105 transition-transform duration-500">
                      {user.role === "admin" ? (
                        <Crown size={28} className="text-red-600" />
                      ) : (
                        <User size={28} className="text-slate-400" />
                      )}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-center gap-3">
                        <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                          {user.name}
                        </h3>
                        <span className="px-3 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400">
                          {user.role}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-400 mt-1">
                        {user.email}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-3.5 bg-slate-50 dark:bg-white/5 rounded-full hover:bg-red-600 hover:text-white transition-all"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="p-3.5 bg-red-600/5 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* --- MODAL WITH BOUNCY ANIMATION --- */}
      <AnimatePresence>
        {isUserEditModalOpen && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 100 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }} // Bouncy effect
              className="bg-white dark:bg-slate-900 w-full max-w-[400px] rounded-[40px] border border-white/10 shadow-2xl relative z-[110] overflow-hidden p-8"
            >
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-red-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Fingerprint size={28} className="text-red-600" />
                </div>
                <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                  Role <span className="text-red-600">Access</span>
                </h2>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                  {selectedUser.name}
                </p>
              </div>

              <form onSubmit={handleRoleUpdate} className="space-y-6">
                {/* ROLE TOGGLE WITH SLIDING ANIMATION */}
                <div className="relative p-1.5 bg-slate-100 dark:bg-black rounded-[25px] flex gap-1 border border-slate-200 dark:border-white/5">
                  {["user", "admin"].map((role) => {
                    const isActive = editingRole === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setEditingRole(role as 'user' | 'admin')}
                        className={`relative flex-1 py-3 text-[11px] font-black uppercase tracking-[0.1em] transition-colors duration-500 z-10 ${
                          isActive ? "text-red-600" : "text-slate-400"
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeRole" // Magic animation for sliding
                            className="absolute inset-0 bg-white dark:bg-slate-800 rounded-[20px] shadow-sm -z-10"
                            transition={{
                              type: "spring",
                              bounce: 0.35,
                              duration: 0.6,
                            }}
                          />
                        )}
                        <span className="flex items-center justify-center gap-2">
                          {role} {isActive && <Check size={12} />}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-red-600 text-white rounded-[25px] font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-red-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Activity size={18} className="animate-spin" />
                  ) : (
                    "Commit Security Update"
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
