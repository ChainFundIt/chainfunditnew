"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye } from "lucide-react";
import { toast } from "sonner";

type ApplicationDecision = "pending" | "maybe" | "yes" | "no";

interface Application {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  cityState: string;
  availability: string;
  startTimeline: string;
  motivation: string;
  targetsComfort: boolean;
  explainChainfundit: string;
  respondToCharity: string;
  dmToCharity: string;
  messageToFamily: string;
  convincedBefore: string;
  handleRejection: string;
  hoursPerWeek: number;
  hasInternet: boolean;
  meaningOfDoingGood: string;
  additionalInfo?: string | null;
  decision?: ApplicationDecision | null;
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

export default function PartnershipApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Application | null>(null);
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
        `/api/admin/partnership-applications?${params.toString()}`
      );
      if (!response.ok) throw new Error("Failed to fetch applications");
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [search]);

  const totalCount = useMemo(() => applications.length, [applications.length]);

  const updateDecision = async (
    applicationId: string,
    decision: ApplicationDecision
  ) => {
    setDecisionUpdating((prev) => ({ ...prev, [applicationId]: true }));
    try {
      const response = await fetch(
        `/api/admin/partnership-applications/${applicationId}/decision`,
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Partnerships Applications
          </h1>
          <p className="text-gray-600 mt-1">
            Review submissions for Partnerships & Growth Associate.
          </p>
        </div>
        <Button variant="outline" onClick={fetchApplications}>
          Refresh
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Badge variant="secondary">{totalCount} applications</Badge>
      </div>

      {loading ? (
        <div className="text-center text-gray-600">Loading applications...</div>
      ) : applications.length === 0 ? (
        <div className="text-center text-gray-600">
          No applications found.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>City/State</TableHead>
                <TableHead>Availability</TableHead>
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
                  <TableCell>{application.cityState}</TableCell>
                  <TableCell>{application.availability}</TableCell>
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
                        <SelectItem value="pending" disabled>
                          Pending
                        </SelectItem>
                        <SelectItem value="maybe">Maybe</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelected(application)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <div className="font-semibold text-gray-900">Applicant</div>
                <div>{selected.fullName}</div>
                <div>{selected.email}</div>
                <div>{selected.phone}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-semibold text-gray-900">City/State</div>
                  <div>{selected.cityState}</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Availability</div>
                  <div>{selected.availability}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-semibold text-gray-900">Start timeline</div>
                  <div>{selected.startTimeline}</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Hours per week</div>
                  <div>{selected.hoursPerWeek}</div>
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  Why ChainFundIt
                </div>
                <div className="whitespace-pre-wrap">{selected.motivation}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  Measured by targets?
                </div>
                <div>{selected.targetsComfort ? "Yes" : "No"}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  Explain ChainFundIt benefits
                </div>
                <div className="whitespace-pre-wrap">
                  {selected.explainChainfundit}
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  Respond to charity objection
                </div>
                <div className="whitespace-pre-wrap">
                  {selected.respondToCharity}
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">DM to charity</div>
                <div className="whitespace-pre-wrap">{selected.dmToCharity}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  Message to family
                </div>
                <div className="whitespace-pre-wrap">
                  {selected.messageToFamily}
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  Convince someone
                </div>
                <div className="whitespace-pre-wrap">
                  {selected.convincedBefore}
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  Handle rejection
                </div>
                <div className="whitespace-pre-wrap">
                  {selected.handleRejection}
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  Reliable internet?
                </div>
                <div>{selected.hasInternet ? "Yes" : "No"}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  Doing good means
                </div>
                <div className="whitespace-pre-wrap">
                  {selected.meaningOfDoingGood}
                </div>
              </div>
              {selected.additionalInfo && (
                <div>
                  <div className="font-semibold text-gray-900">
                    Additional info
                  </div>
                  <div className="whitespace-pre-wrap">
                    {selected.additionalInfo}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
