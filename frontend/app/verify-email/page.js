"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import { verifyEmail, resendVerification } from "@/services/authService";
import { toast } from "react-hot-toast";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("verifying"); 

  useEffect(() => {
    if (token) {
      handleVerify();
    } else {
      setStatus("error");
    }
  }, [token]);

  const handleVerify = async () => {
    try {
      await verifyEmail(token);
      setStatus("success");
      toast.success("Email verified successfully!");
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      setStatus("error");
      toast.error(err.response?.data?.message || "Verification failed.");
    }
  };

  return (
    <AuthLayout 
      title="Email Verification" 
      subtitle={status === "verifying" ? "We're validating your email address..." : status === "success" ? "Verification complete." : "Something went wrong."}
    >
      <div className="text-center py-12">
        {status === "verifying" && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-terracotta animate-spin mb-6" />
            <p className="text-olive-gray">Please wait while we confirm your identity.</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6 border border-green-100">
              <CheckCircle className="w-10 h-10" />
            </div>
            <p className="text-near-black font-medium text-lg mb-2">Successfully Verified!</p>
            <p className="text-olive-gray mb-8">Redirecting you to login...</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6 border border-red-100">
              <XCircle className="w-10 h-10" />
            </div>
            <p className="text-near-black font-medium text-lg mb-2">Invalid or Expired Link</p>
            <p className="text-olive-gray mb-8 px-4">The verification link is either invalid or has expired. Please try resending the verification email.</p>
            <button 
              onClick={() => router.push("/login")}
              className="btn-warm-sand w-full py-4"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
