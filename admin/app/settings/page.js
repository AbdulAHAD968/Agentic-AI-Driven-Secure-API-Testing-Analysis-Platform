"use client";

import { useEffect, useState } from "react";
import AdminLayoutWrapper from "@/components/AdminLayoutWrapper";
import { getMe, updateProfile, updatePassword, setup2FA, activate2FA, disable2FA } from "@/services/adminService";
import { toast } from "react-hot-toast";
import { 
  User, Shield, Key, Camera, Loader2, CheckCircle, 
  ArrowRight, Lock, Eye, EyeOff, X, ShieldAlert,
  Smartphone, Fingerprint
} from "lucide-react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  
  
  const [updating, setUpdating] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState("");
  const [passData, setPassData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  
  const [scanning, setScanning] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [activating2FA, setActivating2FA] = useState(false);
  const [disabling2FA, setDisabling2FA] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [showDisableModal, setShowDisableModal] = useState(false);

  useEffect(() => {
    fetchAdmin();
  }, []);

  const fetchAdmin = async () => {
    try {
      const res = await getMe();
      setAdmin(res.data);
      setName(res.data.name);
      setPreview(res.data.avatar);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    const formData = new FormData();
    formData.append("name", name);
    if (avatar) formData.append("avatar", avatar);

    try {
      await updateProfile(formData);
      toast.success("Identity updated");
      fetchAdmin();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    setChangingPass(true);
    try {
      await updatePassword(passData);
      toast.success("Security token updated");
      setPassData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setChangingPass(false);
    }
  };

  
  const handleSetup2FA = async () => {
    setScanning(true);
    try {
      const res = await setup2FA();
      setQrCodeUrl(res.dataUrl);
    } catch (err) {
      toast.error("Failed to generate QR code");
      setScanning(false);
    }
  };

  const handleActivate2FA = async (e) => {
    e.preventDefault();
    setActivating2FA(true);
    try {
      await activate2FA(twoFactorToken);
      toast.success("2FA Protection Active");
      setScanning(false);
      setQrCodeUrl("");
      setTwoFactorToken("");
      fetchAdmin();
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid authentication token");
    } finally {
      setActivating2FA(false);
    }
  };

  const handleDisable2FA = async (e) => {
     e.preventDefault();
     setDisabling2FA(true);
     try {
       await disable2FA(disablePassword);
       toast.success("2FA Protection Disabled");
       setShowDisableModal(false);
       setDisablePassword("");
       fetchAdmin();
     } catch (err) {
       toast.error(err.response?.data?.message || "Invalid password");
     } finally {
       setDisabling2FA(false);
     }
  };

  const tabs = [
    { id: "profile", label: "Identity", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "authentication", label: "Two-Factor", icon: Shield },
  ];

  return (
    <AdminLayoutWrapper>
      <div className="mb-12">
        <h1 className="text-4xl mb-2">Platform Settings</h1>
        <p className="text-olive-gray font-sans">Manage your workspace presence and security protocols.</p>
      </div>

      <div className="max-w-4xl bg-ivory border border-border-cream rounded-[48px] overflow-hidden shadow-whisper">
        <div className="flex border-b border-border-cream">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-grow py-6 flex items-center justify-center gap-3 transition-all ${
                activeTab === tab.id 
                  ? "bg-warm-sand/20 text-terracotta border-b-2 border-terracotta" 
                  : "text-stone-gray hover:bg-warm-sand/10"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-[0.2em]">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-12">
          {activeTab === "profile" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="mb-10">
                  <h3 className="text-2xl font-serif mb-2">Administrative Identity</h3>
                  <p className="text-sm text-olive-gray">Update how you appear to other staff members.</p>
               </div>
               <form onSubmit={handleProfileUpdate} className="space-y-10">
                  <div className="flex flex-col items-center">
                    <div className="w-44 h-44 rounded-full border-2 border-border-cream p-1 overflow-hidden relative group">
                       <div className="w-full h-full rounded-full overflow-hidden bg-parchment relative shadow-inner">
                          {preview ? (
                            <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl text-stone-gray font-serif">
                              {name?.charAt(0)}
                            </div>
                          )}
                          <label className="absolute inset-0 bg-near-black/70 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm">
                            <Camera className="w-8 h-8 mb-2" />
                            <span className="text-[10px] font-bold tracking-widest uppercase">Change Photo</span>
                            <input type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
                          </label>
                       </div>
                    </div>
                    <p className="mt-4 text-[10px] font-bold text-terracotta uppercase tracking-[0.3em]">Operator Avatar</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-stone-gray ml-1">Full Identity Name</label>
                        <input type="text" className="input-warm" value={name || ""} onChange={(e) => setName(e.target.value)} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-stone-gray ml-1">System Email</label>
                        <input type="email" disabled className="w-full bg-warm-sand/10 border border-border-cream rounded-xl px-4 py-3 text-stone-gray opacity-60 cursor-not-allowed" value={admin?.email || ""} />
                     </div>
                  </div>

                  <button type="submit" disabled={updating} className="btn-terracotta w-full py-5 text-lg">
                    {updating ? <Loader2 className="animate-spin" /> : "Commit Identity Changes"}
                  </button>
               </form>
            </div>
          )}

          {activeTab === "security" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="mb-10">
                  <h3 className="text-2xl font-serif mb-2">Access Credentials</h3>
                  <p className="text-sm text-olive-gray">Maintain your administrative access tokens.</p>
               </div>
               <form onSubmit={handlePasswordUpdate} className="space-y-8 max-w-xl">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-gray ml-1">Current Password</label>
                    <input type="password" required className="input-warm" value={passData.currentPassword} onChange={(e) => setPassData({...passData, currentPassword: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-gray ml-1">New System Password</label>
                    <input type="password" required className="input-warm" value={passData.newPassword} onChange={(e) => setPassData({...passData, newPassword: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-stone-gray ml-1">Confirm New Password</label>
                    <input type="password" required className="input-warm" value={passData.confirmPassword} onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})} />
                  </div>
                  <button type="submit" disabled={changingPass} className="btn-terracotta w-full py-5">
                    {changingPass ? <Loader2 className="animate-spin" /> : "Update Access Tokens"}
                  </button>
               </form>
            </div>
          )}

          {activeTab === "authentication" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="mb-10">
                  <h3 className="text-2xl font-serif mb-2">Two-Factor Authentication</h3>
                  <p className="text-sm text-olive-gray">Add an extra layer of secondary encryption to your workspace.</p>
               </div>

               {admin?.isTwoFactorEnabled ? (
                 <div className="bg-green-50 border border-green-100 rounded-[32px] p-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-green-600 shadow-sm mb-6 border border-green-100">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-serif text-near-black mb-2">Maximum Protection Active</h4>
                    <p className="text-olive-gray max-w-md mx-auto mb-10">Your administrator account is verified with secondary hardware encryption.</p>
                    <button 
                      onClick={() => setShowDisableModal(true)}
                      className="text-stone-gray text-xs font-bold uppercase tracking-[0.2em] hover:text-red-500 transition-colors"
                    >
                      Disable Secondary Layer
                    </button>
                 </div>
               ) : (
                 <div className="space-y-10">
                   {!scanning ? (
                     <div className="bg-warm-sand/10 border border-border-cream rounded-[32px] p-10 text-center">
                        <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center text-stone-gray shadow-sm border border-border-cream mb-6">
                           <Smartphone className="w-8 h-8" />
                        </div>
                        <h4 className="text-xl font-serif mb-4">Hardware Verification Required</h4>
                        <p className="text-olive-gray max-w-sm mx-auto mb-8">Secure your administrative identity using Google Authenticator or generic T-OTP hardware.</p>
                        <button onClick={handleSetup2FA} className="btn-warm-sand py-4 px-10">
                           Initialize Secure Setup
                        </button>
                     </div>
                   ) : (
                     <div className="flex flex-col md:flex-row gap-12 items-center bg-white p-10 rounded-[40px] border border-border-cream shadow-sm">
                        <div className="bg-ivory p-4 rounded-3xl border border-border-cream shrink-0">
                           {qrCodeUrl ? (
                             <img src={qrCodeUrl} alt="QR" className="w-48 h-48" />
                           ) : (
                             <div className="w-48 h-48 flex items-center justify-center">
                               <Loader2 className="animate-spin text-terracotta" />
                             </div>
                           )}
                        </div>
                        <div className="space-y-6 flex-grow">
                           <div>
                             <h4 className="text-lg font-serif mb-1">Pair Device</h4>
                             <p className="text-xs text-olive-gray">Scan the code and enter the 6-digit verification sequence.</p>
                           </div>
                           <form onSubmit={handleActivate2FA} className="space-y-4">
                              <input 
                                type="text"
                                placeholder="Verification Code"
                                className="input-warm !py-4 text-center text-xl tracking-[0.5em] font-mono"
                                maxLength={6}
                                value={twoFactorToken}
                                onChange={(e) => setTwoFactorToken(e.target.value)}
                              />
                              <button type="submit" disabled={activating2FA} className="btn-terracotta w-full py-4">
                                {activating2FA ? <Loader2 className="animate-spin" /> : "Authorize Device"}
                              </button>
                              <button onClick={() => setScanning(false)} type="button" className="w-full text-xs font-bold uppercase tracking-widest text-stone-gray hover:text-near-black">
                                Cancel
                              </button>
                           </form>
                        </div>
                     </div>
                   )}
                 </div>
               )}
            </div>
          )}
        </div>
      </div>

      
      {showDisableModal && (
        <div className="fixed inset-0 bg-near-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
           <div className="bg-ivory w-full max-w-lg rounded-[48px] border border-border-cream overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="p-12 text-center">
                 <div className="w-16 h-16 bg-red-50 rounded-2xl mx-auto flex items-center justify-center text-red-600 mb-6 border border-red-100">
                    <ShieldAlert className="w-8 h-8" />
                 </div>
                 <h3 className="text-2xl font-serif text-near-black mb-2">Disable Security Layer?</h3>
                 <p className="text-sm text-olive-gray mb-10">Removing T-OTP protection lowers the security score of your administrative identity.</p>
                 
                 <form onSubmit={handleDisable2FA} className="space-y-6">
                    <div className="space-y-2 text-left">
                       <label className="text-xs font-bold uppercase tracking-widest text-stone-gray ml-1">Confirm Identity Password</label>
                       <input 
                         type="password" 
                         required 
                         className="input-warm" 
                         value={disablePassword}
                         onChange={(e) => setDisablePassword(e.target.value)}
                       />
                    </div>
                    <div className="flex gap-4">
                       <button type="submit" disabled={disabling2FA} className="btn-terracotta w-full py-4 text-sm uppercase tracking-widest font-bold">
                          {disabling2FA ? <Loader2 className="animate-spin mx-auto h-5 w-5 text-white" /> : "Confirm & Disable"}
                       </button>
                       <button 
                         type="button" 
                         onClick={() => setShowDisableModal(false)}
                         className="btn-warm-sand w-full py-4 text-sm"
                       >
                         Abort
                       </button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}
    </AdminLayoutWrapper>
  );
}
