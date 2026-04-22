"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, setup2FA, activate2FA } from "@/services/authService";
import { updateProfile, updatePassword } from "@/services/userService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "react-hot-toast";
import { 
  User, Shield, Key, Loader2, Camera, CheckCircle, 
  ArrowRight, Lock, Eye, EyeOff 
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState("");

  
  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPass, setShowPass] = useState(false);

  
  const [scanning, setScanning] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [activating2FA, setActivating2FA] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await getMe();
      setUser(res.data);
      setName(res.data.name);
      setPreview(res.data.avatar);
    } catch (err) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload a JPG, PNG or WEBP image.");
      e.target.value = ""; 
      return;
    }

    
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 2MB.");
      e.target.value = ""; 
      return;
    }

    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    const formData = new FormData();
    formData.append("name", name);
    if (avatar) formData.append("avatar", avatar);

    try {
      await updateProfile(formData);
      toast.success("Profile updated successfully");
      fetchUser();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      return toast.error("New passwords do not match");
    }
    setChangingPass(true);
    try {
      await updatePassword(passData);
      toast.success("Password updated!");
      setPassData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Password update failed");
    } finally {
      setChangingPass(false);
    }
  };

  const handleSetup2FA = async () => {
    try {
      const res = await setup2FA();
      setQrCodeUrl(res.dataUrl);
      setScanning(true);
    } catch (err) {
      toast.error("Could not generate 2FA QR code");
    }
  };

  const handleActivate2FA = async (e) => {
    e.preventDefault();
    setActivating2FA(true);
    try {
      await activate2FA(twoFactorToken);
      toast.success("2FA Enabled!");
      setScanning(false);
      fetchUser();
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid code");
    } finally {
      setActivating2FA(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-terracotta animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-parchment">
      <Header />
      <main className="flex-grow py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12">
            <h1 className="text-4xl font-serif text-near-black mb-2">Account Settings</h1>
            <p className="text-olive-gray font-sans">Manage your profile, security, and preferences.</p>
          </header>

          <div className="space-y-12">
            
            <section className="bg-ivory border border-border-cream rounded-[32px] p-8 md:p-12 shadow-whisper">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-warm-sand/50 rounded-full flex items-center justify-center text-terracotta">
                  <User className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-serif">Public Profile</h2>
              </div>

              <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-12">
                
                <div className="flex flex-col items-center">
                  <div className="relative group cursor-pointer w-40 h-40">
                    <div className="w-full h-full rounded-full bg-warm-sand/30 border-2 border-dashed border-border-cream overflow-hidden transition-all group-hover:border-terracotta/50">
                      {preview ? (
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-stone-gray font-serif">
                          {user?.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/20 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="w-8 h-8" />
                      <input type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
                    </label>
                  </div>
                  <p className="mt-4 text-xs text-stone-gray text-center font-sans">Click to change avatar</p>
                </div>

                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-charcoal-warm font-sans">Full Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-warm-sand/20 border border-border-cream rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400/20 font-sans"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-charcoal-warm font-sans">Email Address (Read-only)</label>
                    <input 
                      type="email" 
                      disabled
                      className="w-full bg-warm-sand/10 border border-border-cream rounded-xl px-4 py-3 text-stone-gray font-sans cursor-not-allowed"
                      value={user?.email}
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={updating}
                    className="btn-terracotta px-8 py-3 flex items-center gap-2"
                  >
                    {updating ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </section>

            
            <section className="bg-ivory border border-border-cream rounded-[32px] p-8 md:p-12 shadow-whisper">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-warm-sand/50 rounded-full flex items-center justify-center text-terracotta">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-serif">Password & Security</h2>
              </div>

              <form onSubmit={handlePasswordUpdate} className="max-w-md space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-charcoal-warm font-sans">Current Password</label>
                  <input 
                    type={showPass ? "text" : "password"}
                    required
                    className="w-full bg-warm-sand/20 border border-border-cream rounded-xl px-4 py-3 font-sans"
                    value={passData.currentPassword}
                    onChange={(e) => setPassData({...passData, currentPassword: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-charcoal-warm font-sans">New Password</label>
                  <input 
                    type={showPass ? "text" : "password"}
                    required
                    className="w-full bg-warm-sand/20 border border-border-cream rounded-xl px-4 py-3 font-sans"
                    value={passData.newPassword}
                    onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-charcoal-warm font-sans">Confirm New Password</label>
                  <input 
                    type={showPass ? "text" : "password"}
                    required
                    className="w-full bg-warm-sand/20 border border-border-cream rounded-xl px-4 py-3 font-sans"
                    value={passData.confirmPassword}
                    onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                  />
                </div>
                <button 
                    type="submit" 
                    disabled={changingPass}
                    className="btn-terracotta px-8 py-3 flex items-center gap-2"
                  >
                    {changingPass ? "Updating..." : "Update Password"}
                  </button>
              </form>
            </section>

            
            <section className="bg-ivory border border-border-cream rounded-[32px] p-8 md:p-12 shadow-whisper">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-warm-sand/50 rounded-full flex items-center justify-center text-terracotta">
                  <Shield className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-serif">Two-Factor Authentication</h2>
              </div>
              
              {!user?.isTwoFactorEnabled ? (
                <div className="max-w-xl">
                  <p className="text-olive-gray mb-8 font-sans">
                    Secure your account with a 6-digit code from an authenticator app.
                  </p>
                  
                  {!scanning ? (
                    <button onClick={handleSetup2FA} className="btn-warm-sand px-8 py-3">
                      Configure Authenticator
                    </button>
                  ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className="bg-white p-6 rounded-2xl border border-border-cream inline-block">
                        {qrCodeUrl ? (
                          <img src={qrCodeUrl} alt="QR" className="w-48 h-48" />
                        ) : (
                          <div className="w-48 h-48 flex items-center justify-center animate-pulse bg-warm-sand/10">
                            <Loader2 className="animate-spin text-stone-gray" />
                          </div>
                        )}
                      </div>
                      <form onSubmit={handleActivate2FA} className="space-y-6 max-w-sm">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-charcoal-warm font-sans">Verification Code</label>
                          <input 
                            type="text"
                            required
                            className="w-full bg-warm-sand/20 border border-border-cream rounded-xl px-4 py-3 text-center text-2xl tracking-widest font-mono"
                            value={twoFactorToken}
                            onChange={(e) => setTwoFactorToken(e.target.value)}
                            maxLength={6}
                          />
                        </div>
                        <div className="flex gap-4">
                          <button type="submit" disabled={activating2FA} className="btn-terracotta flex-1 py-3">
                            {activating2FA ? "Checking..." : "Verify & Enable"}
                          </button>
                          <button type="button" onClick={() => setScanning(false)} className="px-6 py-3 text-stone-gray">Cancel</button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-6 p-6 bg-green-50 border border-green-100 rounded-2xl text-green-700">
                  <CheckCircle className="w-12 h-12 shrink-0" />
                  <div>
                    <p className="font-semibold text-lg">2FA is active</p>
                    <p className="text-sm italic">You're protected with an extra layer of security.</p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
