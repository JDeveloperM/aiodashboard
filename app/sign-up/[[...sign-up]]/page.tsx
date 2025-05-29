import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
// import { customDarkTheme } from "@/lib/clerk-theme";

export function generateStaticParams() {
  return [{ "sign-up": [] }]
}

export default function SignUpPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      <div className="flex items-center p-4 border-b border-slate-800">
        <Link href="/" className="flex items-center text-white hover:text-blue-400 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
      </div>

      <div className="flex-1 flex justify-center items-center p-4">
        <div className="w-full max-w-md">
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            redirectUrl="/dashboard"
          />
        </div>
      </div>

      <div className="p-4 text-center text-sm text-white border-t border-slate-800">
        <p>© {new Date().getFullYear()} TradeCopy. All rights reserved.</p>
      </div>
    </div>
  );
}
