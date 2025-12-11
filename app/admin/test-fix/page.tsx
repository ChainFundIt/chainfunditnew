"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function TestFixPage() {
  const [checking, setChecking] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Charity-specific state
  const [checkingCharities, setCheckingCharities] = useState(false);
  const [fixingCharities, setFixingCharities] = useState(false);
  const [charityResult, setCharityResult] = useState<any>(null);
  const [charityError, setCharityError] = useState<string | null>(null);

  const checkIssues = async () => {
    setChecking(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/admin/fix-undefined-urls", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check issues");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check");
    } finally {
      setChecking(false);
    }
  };

  const fixIssues = async () => {
    if (!confirm("Are you sure you want to fix all undefined/ URLs? This will update the database.")) {
      return;
    }

    setFixing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/admin/fix-undefined-urls", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fix issues");
      }

      setResult(data);
      alert(`Successfully fixed ${data.fixed} out of ${data.total} campaign(s)!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fix");
    } finally {
      setFixing(false);
    }
  };

  const checkCharityIssues = async () => {
    setCheckingCharities(true);
    setCharityError(null);
    setCharityResult(null);

    try {
      const response = await fetch("/api/admin/check-charity-images", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check charity issues");
      }

      setCharityResult(data);
    } catch (err) {
      setCharityError(err instanceof Error ? err.message : "Failed to check");
    } finally {
      setCheckingCharities(false);
    }
  };

  const fixCharityIssues = async () => {
    if (!confirm("Are you sure you want to fix all charity undefined/ URLs? This will update the database.")) {
      return;
    }

    setFixingCharities(true);
    setCharityError(null);
    setCharityResult(null);

    try {
      const response = await fetch("/api/admin/fix-charity-image-urls", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fix charity issues");
      }

      setCharityResult(data);
      alert(`Successfully fixed ${data.fixed} out of ${data.total} charity(ies)!`);
    } catch (err) {
      setCharityError(err instanceof Error ? err.message : "Failed to fix");
    } finally {
      setFixingCharities(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Fix Undefined Image URLs</h1>

      {/* Campaigns Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Campaigns</h2>
        <div className="space-y-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              This tool checks for campaigns with "undefined/" in their image URLs and fixes them
              by replacing with the correct R2_PUBLIC_ACCESS_KEY base URL.
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={checkIssues}
              disabled={checking || fixing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {checking ? "Checking..." : "Check Issues (Dry Run)"}
            </Button>

            <Button
              onClick={fixIssues}
              disabled={checking || fixing || !result}
              className="bg-green-600 hover:bg-green-700"
            >
              {fixing ? "Fixing..." : "Fix All Issues"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 font-semibold">Error:</p>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Results</h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Base URL:</p>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                  {result.baseUrl || "NOT SET"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Campaigns with issues:</p>
                <p className="text-2xl font-bold text-blue-600">{result.count || result.total || 0}</p>
              </div>

              {result.fixed !== undefined && (
                <div>
                  <p className="text-sm text-gray-600">Campaigns fixed:</p>
                  <p className="text-2xl font-bold text-green-600">{result.fixed}</p>
                </div>
              )}

              {result.campaigns && result.campaigns.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-2">Affected Campaigns:</p>
                  <div className="space-y-2">
                    {result.campaigns.map((campaign: any, index: number) => (
                      <div
                        key={campaign.id || index}
                        className="bg-gray-50 p-3 rounded border border-gray-200"
                      >
                        <p className="font-semibold">{campaign.title}</p>
                        {campaign.coverImageUrl && (
                          <p className="text-xs text-gray-600 mt-1">
                            Cover: {campaign.coverImageUrl}
                          </p>
                        )}
                        {campaign.fixes && campaign.fixes.length > 0 && (
                          <p className="text-xs text-green-600 mt-1">
                            Fixed: {campaign.fixes.join(", ")}
                          </p>
                        )}
                        {campaign.hasGalleryIssues && (
                          <p className="text-xs text-orange-600 mt-1">Gallery images have issues</p>
                        )}
                        {campaign.hasDocumentIssues && (
                          <p className="text-xs text-orange-600 mt-1">Documents have issues</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.message && (
                <div className="bg-green-50 border border-green-200 rounded p-3 mt-4">
                  <p className="text-green-800">{result.message}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Charities Section */}
      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-semibold mb-4">Charities</h2>
        <div className="space-y-4 mb-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-800">
              This tool checks for charities with "undefined/" in their logo or coverImage URLs and fixes them
              by replacing with the correct R2_PUBLIC_ACCESS_KEY base URL.
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={checkCharityIssues}
              disabled={checkingCharities || fixingCharities}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {checkingCharities ? "Checking..." : "Check Charity Issues (Dry Run)"}
            </Button>

            <Button
              onClick={fixCharityIssues}
              disabled={checkingCharities || fixingCharities || !charityResult}
              className="bg-green-600 hover:bg-green-700"
            >
              {fixingCharities ? "Fixing..." : "Fix All Charity Issues"}
            </Button>
          </div>
        </div>

        {charityError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 font-semibold">Error:</p>
            <p className="text-red-700">{charityError}</p>
          </div>
        )}

        {charityResult && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Charity Results</h3>

            <div className="space-y-4">
              {charityResult.summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Charities:</p>
                    <p className="text-2xl font-bold">{charityResult.summary.total}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Valid Images:</p>
                    <p className="text-2xl font-bold text-green-600">{charityResult.summary.valid}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Issues Found:</p>
                    <p className="text-2xl font-bold text-red-600">
                      {charityResult.summary.undefinedPrefix + 
                       charityResult.summary.invalidLogo + 
                       charityResult.summary.invalidCoverImage}
                    </p>
                  </div>
                  {charityResult.summary.undefinedPrefix > 0 && (
                    <div>
                      <p className="text-sm text-gray-600">Undefined Prefix:</p>
                      <p className="text-2xl font-bold text-orange-600">{charityResult.summary.undefinedPrefix}</p>
                    </div>
                  )}
                </div>
              )}

              {charityResult.fixed !== undefined && (
                <div>
                  <p className="text-sm text-gray-600">Charities fixed:</p>
                  <p className="text-2xl font-bold text-green-600">{charityResult.fixed}</p>
                </div>
              )}

              {charityResult.issues?.undefinedPrefix && charityResult.issues.undefinedPrefix.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-2">Charities with undefined/ prefix:</p>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {charityResult.issues.undefinedPrefix.map((charity: any, index: number) => (
                      <div
                        key={charity.id || index}
                        className="bg-gray-50 p-3 rounded border border-gray-200"
                      >
                        <p className="font-semibold">{charity.name}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {charity.field}: {charity.url}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {charityResult.fixedCharities && charityResult.fixedCharities.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-2">Fixed Charities:</p>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {charityResult.fixedCharities.map((charity: any, index: number) => (
                      <div
                        key={charity.id || index}
                        className="bg-green-50 p-3 rounded border border-green-200"
                      >
                        <p className="font-semibold">{charity.name}</p>
                        {charity.fixes && charity.fixes.length > 0 && (
                          <div className="text-xs text-green-700 mt-1">
                            {charity.fixes.map((fix: string, i: number) => (
                              <p key={i}>{fix}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {charityResult.message && (
                <div className="bg-green-50 border border-green-200 rounded p-3 mt-4">
                  <p className="text-green-800">{charityResult.message}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


