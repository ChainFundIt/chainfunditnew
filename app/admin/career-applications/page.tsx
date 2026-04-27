"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Eye } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ApplicationDecision = "pending" | "maybe" | "yes" | "no";

interface CareerApplication {
  id: string;
  careerOpeningId: string;
  roleTitle: string;
  fullName: string;
  email: string;
  phone: string;
  cityState?: string | null;
  linkedInUrl?: string | null;
  portfolioUrl?: string | null;
  coverLetter: string;
  additionalInfo?: string | null;
  consentToContact: boolean;
  decision?: ApplicationDecision | null;
  hasResume: boolean;
  createdAt: string;
}

const decisionLabels: Record<ApplicationDecision, string> = {
  pending: "Pending",
  maybe: "Under review",
  yes: "Yes",
  no: "No",
};

const normalizeDecision = (
  value?: ApplicationDecision | null
): ApplicationDecision => value || "pending";

export default function CareerApplicationsPage() {
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CareerApplication | null>(null);
  const [decisionUpdating, setDecisionUpdating] = useState<
    Record<string, boolean>
  >({});

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      params.append("limit", "50");

      const response = await fetch(
        `/api/admin/career-applications?${params.toString()}`
      );
      if (!response.ok) throw new Error("Failed to fetch applications");
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error("Error fetching career applications:", error);
      toast.error("Failed to load career applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [search]);

  const updateDecision = async (
    applicationId: string,
    decision: ApplicationDecision
  ) => {
    setDecisionUpdating((prev) => ({ ...prev, [applicationId]: true }));
    try {
      const response = await fetch(
        `/api/admin/career-applications/${applicationId}/decision`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ decision }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update decision");
      }

      const data = await response.json();
      setApplications((prev) =>
        prev.map((application) =>
          application.id === applicationId
            ? {
                ...application,
                decision: data.application?.decision || decision,
              }
            : application
        )
      );
      toast.success(`Decision set to ${decision.toUpperCase()}`);
    } catch (error) {
      console.error("Error updating decision:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update decision"
      );
    } finally {
      setDecisionUpdating((prev) => ({ ...prev, [applicationId]: false }));
    }
  };

  const totalCount = useMemo(() => applications.length, [applications.length]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Career Applications
          </h1>
          <p className="mt-1 text-gray-600">
            Review applications submitted through admin-created roles.
          </p>
        </div>
        <Button variant="outline" onClick={fetchApplications}>
          Refresh
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex-1">
          <Input
            placeholder="Search by role, name, email, or phone..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Badge variant="secondary">{totalCount} applications</Badge>
      </div>

      {loading ? (
        <div className="text-center text-gray-600">Loading applications...</div>
      ) : applications.length === 0 ? (
        <div className="text-center text-gray-600">No applications found.</div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Decision</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <div className="font-medium">{application.fullName}</div>
                    <div className="text-sm text-gray-500">
                      {application.email}
                    </div>
                    <div className="text-xs text-gray-400">
                      {application.phone}
                    </div>
                  </TableCell>
                  <TableCell>{application.roleTitle}</TableCell>
                  <TableCell>{application.cityState || "Not provided"}</TableCell>
                  <TableCell>
                    {new Date(application.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={normalizeDecision(application.decision)}
                      onValueChange={(value) =>
                        updateDecision(
                          application.id,
                          value as ApplicationDecision
                        )
                      }
                      disabled={decisionUpdating[application.id]}
                    >
                      <SelectTrigger className="h-8 w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="maybe">Maybe</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelected(application)}
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        View
                      </Button>
                      {application.hasResume && (
                        <Button size="sm" variant="outline" asChild>
                          <a
                            href={`/api/admin/career-applications/${application.id}/resume`}
                          >
                            <Download className="mr-1 h-4 w-4" />
                            Resume
                          </a>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <div className="font-semibold text-gray-900">Role</div>
                <div>{selected.roleTitle}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Applicant</div>
                <div>{selected.fullName}</div>
                <div>{selected.email}</div>
                <div>{selected.phone}</div>
                {selected.cityState && <div>{selected.cityState}</div>}
              </div>
              <div>
                <div className="font-semibold text-gray-900">Decision</div>
                <div>{decisionLabels[normalizeDecision(selected.decision)]}</div>
              </div>
              {selected.linkedInUrl && (
                <div>
                  <div className="font-semibold text-gray-900">LinkedIn</div>
                  <a
                    href={selected.linkedInUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#104109] underline"
                  >
                    {selected.linkedInUrl}
                  </a>
                </div>
              )}
              {selected.portfolioUrl && (
                <div>
                  <div className="font-semibold text-gray-900">Portfolio</div>
                  <a
                    href={selected.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#104109] underline"
                  >
                    {selected.portfolioUrl}
                  </a>
                </div>
              )}
              <div>
                <div className="font-semibold text-gray-900">Cover Letter</div>
                <div className="whitespace-pre-wrap">{selected.coverLetter}</div>
              </div>
              {selected.additionalInfo && (
                <div>
                  <div className="font-semibold text-gray-900">
                    Additional Information
                  </div>
                  <div className="whitespace-pre-wrap">
                    {selected.additionalInfo}
                  </div>
                </div>
              )}
              <div>
                <div className="font-semibold text-gray-900">Consent</div>
                <div>
                  {selected.consentToContact
                    ? "Applicant consented to be contacted."
                    : "No consent provided."}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
