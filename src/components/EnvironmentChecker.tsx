import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

export const EnvironmentChecker = () => {
  const [show, setShow] = useState(false);
  const [config, setConfig] = useState({
    useMockData: false,
    hasSupabaseUrl: false,
    hasSupabaseKey: false,
    isValid: false,
  });

  useEffect(() => {
    const useMockData = import.meta.env.VITE_USE_MOCK_DATA === "true";
    const hasSupabaseUrl = !!import.meta.env.VITE_SUPABASE_URL;
    const hasSupabaseKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;
    const isValid = useMockData || (hasSupabaseUrl && hasSupabaseKey);

    setConfig({
      useMockData,
      hasSupabaseUrl,
      hasSupabaseKey,
      isValid,
    });

    // Show alert if configuration is invalid
    if (!isValid) {
      setShow(true);
    }
  }, []);

  if (!show || config.isValid) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-sm border-b">
      <Alert variant="destructive" className="max-w-4xl mx-auto">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle className="text-lg font-semibold">
          Configuration Error: Missing Environment Variables
        </AlertTitle>
        <AlertDescription className="mt-3 space-y-3">
          <p>
            The application cannot start because environment variables are not configured
            properly.
          </p>

          <div className="bg-black/10 dark:bg-white/10 p-3 rounded text-sm space-y-2">
            <p className="font-semibold">Current Status:</p>
            <ul className="space-y-1 ml-4">
              <li className="flex items-center gap-2">
                {config.useMockData ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span>
                  VITE_USE_MOCK_DATA:{" "}
                  <code>{String(config.useMockData)}</code>
                </span>
              </li>
              <li className="flex items-center gap-2">
                {config.hasSupabaseUrl ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span>
                  VITE_SUPABASE_URL: {config.hasSupabaseUrl ? "✓ Set" : "✗ Missing"}
                </span>
              </li>
              <li className="flex items-center gap-2">
                {config.hasSupabaseKey ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span>
                  VITE_SUPABASE_ANON_KEY:{" "}
                  {config.hasSupabaseKey ? "✓ Set" : "✗ Missing"}
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded text-sm">
            <p className="font-semibold mb-2">Quick Fix for Vercel:</p>
            <ol className="space-y-1 ml-4 list-decimal">
              <li>Go to Vercel Dashboard → Your Project → Settings</li>
              <li>Click "Environment Variables"</li>
              <li>
                Add: <code className="bg-black/20 px-1 rounded">VITE_USE_MOCK_DATA</code> ={" "}
                <code className="bg-black/20 px-1 rounded">true</code>
              </li>
              <li>Check all environments (Production, Preview, Development)</li>
              <li>Save and redeploy</li>
            </ol>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded text-sm">
            <p className="font-semibold mb-2">For Local Development:</p>
            <p>Create/edit <code>.env.local</code> file:</p>
            <pre className="bg-black/20 p-2 rounded mt-2 overflow-x-auto">
{`VITE_USE_MOCK_DATA=true
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here`}
            </pre>
            <p className="mt-2 text-xs">
              Then restart dev server: <code>npm run dev</code>
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShow(false)}
            >
              Dismiss (Not Recommended)
            </Button>
            <Button
              size="sm"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default EnvironmentChecker;
