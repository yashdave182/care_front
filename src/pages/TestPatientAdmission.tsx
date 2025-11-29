import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const TestPatientAdmission = () => {
  const [testResults, setTestResults] = useState<
    {
      step: string;
      status: "success" | "error" | "pending";
      message: string;
      details?: unknown;
    }[]
  >([]);
  const [testing, setTesting] = useState(false);
  const [patientName, setPatientName] = useState("Test Patient");

  const addResult = (
    step: string,
    status: "success" | "error" | "pending",
    message: string,
    details?: unknown,
  ) => {
    setTestResults((prev) => [...prev, { step, status, message, details }]);
  };

  const runDiagnostics = async () => {
    setTestResults([]);
    setTesting(true);

    try {
      // Step 1: Check environment variables
      addResult("Step 1", "pending", "Checking environment variables...");
      await new Promise((resolve) => setTimeout(resolve, 500));

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const useMock = import.meta.env.VITE_USE_MOCK_DATA;

      if (!supabaseUrl || !supabaseKey) {
        addResult("Step 1", "error", "Environment variables missing!", {
          VITE_SUPABASE_URL: supabaseUrl ? "✓ Set" : "✗ MISSING",
          VITE_SUPABASE_ANON_KEY: supabaseKey ? "✓ Set" : "✗ MISSING",
          VITE_USE_MOCK_DATA: useMock || "not set",
        });
        setTesting(false);
        return;
      }

      addResult("Step 1", "success", "Environment variables configured", {
        VITE_SUPABASE_URL: supabaseUrl,
        VITE_USE_MOCK_DATA: useMock || "false",
      });

      // Step 2: Test basic Supabase connection
      addResult("Step 2", "pending", "Testing Supabase connection...");
      await new Promise((resolve) => setTimeout(resolve, 500));

      try {
        const { data: healthCheck, error: healthError } = await Promise.race([
          supabase.from("patients").select("id").limit(1),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Connection timeout")), 5000),
          ),
        ]);

        if (healthError) {
          addResult("Step 2", "error", "Connection failed", {
            error: healthError.message,
            code: healthError.code,
            hint: healthError.hint,
          });
          setTesting(false);
          return;
        }

        addResult("Step 2", "success", "Supabase connection successful");
      } catch (err) {
        addResult("Step 2", "error", "Connection timeout or network error", {
          error: err instanceof Error ? err.message : "Unknown error",
        });
        setTesting(false);
        return;
      }

      // Step 3: Prepare patient data
      addResult("Step 3", "pending", "Preparing patient data...");
      await new Promise((resolve) => setTimeout(resolve, 500));

      const patientData = {
        patient_name: patientName,
        emergency_type: "General",
        status: "pending_bed",
      };

      addResult("Step 3", "success", "Patient data prepared", patientData);

      // Step 4: Insert patient
      addResult("Step 4", "pending", "Inserting patient into database...");
      await new Promise((resolve) => setTimeout(resolve, 500));

      try {
        const { data: insertedPatient, error: insertError } =
          await Promise.race([
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (supabase as any)
              .from("patients")
              .insert([patientData])
              .select()
              .single(),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error("Insert timeout")), 10000),
            ),
          ]);

        if (insertError) {
          addResult("Step 4", "error", "Failed to insert patient", {
            error: insertError.message,
            code: insertError.code,
            details: insertError.details,
            hint: insertError.hint,
          });
          setTesting(false);
          return;
        }

        addResult("Step 4", "success", "Patient created successfully!", {
          id: insertedPatient.id,
          patient_name: insertedPatient.patient_name,
          status: insertedPatient.status,
        });

        // Step 5: Verify patient exists
        addResult("Step 5", "pending", "Verifying patient in database...");
        await new Promise((resolve) => setTimeout(resolve, 500));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: verifyPatient, error: verifyError } = await (
          supabase as any
        )
          .from("patients")
          .select("*")
          .eq("id", insertedPatient.id)
          .single();

        if (verifyError) {
          addResult("Step 5", "error", "Failed to verify patient", {
            error: verifyError.message,
          });
        } else {
          addResult("Step 5", "success", "Patient verified in database", {
            id: verifyPatient.id,
            patient_name: verifyPatient.patient_name,
          });
        }
      } catch (err) {
        addResult("Step 4", "error", "Insert operation failed", {
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    } catch (err) {
      addResult("Error", "error", "Unexpected error during testing", {
        error: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setTesting(false);
    }
  };

  const getIcon = (status: "success" | "error" | "pending") => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "pending":
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Admission Diagnostic Test</CardTitle>
            <CardDescription>
              This page tests the complete patient admission flow step-by-step
              to help diagnose issues.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patientName">Test Patient Name</Label>
              <Input
                id="patientName"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Enter patient name"
              />
            </div>

            <Button
              onClick={runDiagnostics}
              disabled={testing}
              className="w-full"
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                "Run Diagnostic Test"
              )}
            </Button>
          </CardContent>
        </Card>

        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {testResults.map((result, index) => (
                <Alert
                  key={index}
                  variant={
                    result.status === "error" ? "destructive" : "default"
                  }
                >
                  <div className="flex items-start gap-3">
                    {getIcon(result.status)}
                    <div className="flex-1">
                      <AlertTitle className="font-semibold">
                        {result.step}: {result.message}
                      </AlertTitle>
                      {result.details && (
                        <AlertDescription className="mt-2">
                          <pre className="text-xs bg-black/5 dark:bg-white/5 p-2 rounded overflow-x-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </AlertDescription>
                      )}
                    </div>
                  </div>
                </Alert>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Before running the test:</AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                <p>1. Make sure your .env.local file is configured:</p>
                <pre className="text-xs bg-black/5 dark:bg-white/5 p-2 rounded">
                  {`VITE_USE_MOCK_DATA=false
VITE_SUPABASE_URL=https://mlyigztcpkdxqqbmrbit.supabase.co
VITE_SUPABASE_ANON_KEY=your_key_here`}
                </pre>
                <p>2. Restart your dev server after changing .env.local</p>
                <p>3. Open browser console (F12) to see detailed logs</p>
                <p>4. Click "Run Diagnostic Test" above</p>
              </AlertDescription>
            </Alert>

            <div className="text-sm space-y-2">
              <p className="font-semibold">What this test checks:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Environment variables are configured correctly</li>
                <li>Supabase connection is working</li>
                <li>Patient table is accessible</li>
                <li>Insert operation completes successfully</li>
                <li>Inserted patient can be retrieved</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestPatientAdmission;
