import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export const SupabaseStatus = () => {
  const [status, setStatus] = useState<"checking" | "connected" | "error">(
    "checking"
  );
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState({
    url: "",
    keyConfigured: false,
    mockMode: false,
  });

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Check environment variables
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const useMockData = import.meta.env.VITE_USE_MOCK_DATA === "true";

        setConfig({
          url: supabaseUrl || "NOT SET",
          keyConfigured: !!supabaseKey,
          mockMode: useMockData,
        });

        if (!supabaseUrl || !supabaseKey) {
          setStatus("error");
          setError(
            "Supabase configuration missing. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local"
          );
          return;
        }

        if (useMockData) {
          setStatus("connected");
          return;
        }

        // Try to query a table to verify connection
        console.log("[STATUS] Testing Supabase connection...");
        const { error: testError } = await supabase
          .from("patients")
          .select("id")
          .limit(1);

        if (testError) {
          console.error("[STATUS] Connection test failed:", testError);
          setStatus("error");
          setError(
            `Connection failed: ${testError.message} (${testError.code || "unknown"})`
          );
        } else {
          console.log("[STATUS] Connection successful");
          setStatus("connected");
        }
      } catch (err) {
        console.error("[STATUS] Exception during check:", err);
        setStatus("error");
        setError(
          err instanceof Error ? err.message : "Unknown error occurred"
        );
      }
    };

    checkConnection();
  }, []);

  if (config.mockMode) {
    return (
      <Alert className="border-blue-500">
        <CheckCircle2 className="h-4 w-4 text-blue-500" />
        <AlertTitle>Mock Data Mode</AlertTitle>
        <AlertDescription>
          Using mock data (not connected to Supabase). Toggle data mode to use
          real database.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "checking") {
    return (
      <Alert>
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>Checking Connection</AlertTitle>
        <AlertDescription>Verifying Supabase connection...</AlertDescription>
      </Alert>
    );
  }

  if (status === "error") {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Connection Error</AlertTitle>
        <AlertDescription>
          <p className="mb-2">{error}</p>
          <div className="text-xs space-y-1 mt-3 p-2 bg-black/10 rounded">
            <p>
              <strong>URL:</strong> {config.url}
            </p>
            <p>
              <strong>API Key:</strong>{" "}
              {config.keyConfigured ? "Configured" : "NOT SET"}
            </p>
          </div>
          <p className="mt-3 text-xs">
            To fix this, create a <code>.env.local</code> file with:
            <br />
            <code className="text-xs">
              VITE_SUPABASE_URL=your_supabase_url
              <br />
              VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
            </code>
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-green-500">
      <CheckCircle2 className="h-4 w-4 text-green-500" />
      <AlertTitle>Connected</AlertTitle>
      <AlertDescription className="flex items-center gap-2">
        <span>Supabase connection is active</span>
        <Badge variant="outline" className="text-xs">
          {config.url}
        </Badge>
      </AlertDescription>
    </Alert>
  );
};

export default SupabaseStatus;
