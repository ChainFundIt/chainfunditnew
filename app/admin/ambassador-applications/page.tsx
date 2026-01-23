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
import { Eye, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";

type ApplicationDecision = "pending" | "maybe" | "yes" | "no";

interface Application {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  stateOfResidence: string;
  age: number;
  massComms: boolean;
  createsContent: boolean;
  handles?: string | null;
  interest: string;
  helpedBefore: boolean;
  helpedDescription?: string | null;
  introVideoLink?: string | null;
  hasCv: boolean;
  hasVideoFile: boolean;
  createdAt: string;
  decision?: ApplicationDecision | null;
}

export default function AmbassadorApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Application | null>(null);
  const [sortBy, setSortBy] = useState<"submitted" | "decision">("submitted");
  const [decisionUpdating, setDecisionUpdating] = useState<
    Record<string, boolean>
  >({});

  const decisionLabels: Record<ApplicationDecision, string> = {
    pending: "Pending",
    maybe: "Under review",
    yes: "Yes",
    no: "No",
  };

  const decisionOrder: Record<ApplicationDecision, number> = {
    pending: 0,
    maybe: 1,
    yes: 2,
    no: 3,
  };

  const normalizeDecision = (
    value?: ApplicationDecision | null
  ): ApplicationDecision => value || "pending";

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      params.append("limit", "50");

      const response = await fetch(
        `/api/admin/ambassador-applications?${params.toString()}`
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

  const sortedApplications = useMemo(() => {
    const list = [...applications];
    if (sortBy === "decision") {
      list.sort((a, b) => {
        const decisionA = normalizeDecision(a.decision);
        const decisionB = normalizeDecision(b.decision);
        if (decisionA !== decisionB) {
          return decisionOrder[decisionA] - decisionOrder[decisionB];
        }
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    } else {
      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return list;
  }, [applications, sortBy]);

  const updateDecision = async (
    applicationId: string,
    decision: ApplicationDecision
  ) => {
    setDecisionUpdating((prev) => ({ ...prev, [applicationId]: true }));
    try {
      const response = await fetch(
        `/api/admin/ambassador-applications/${applicationId}/decision`,
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

      if (decision === "maybe") {
        toast.success("Application marked as under review");
      } else {
        toast.success(`Decision set to ${decision.toUpperCase()}`);
      }
    } catch (error) {
      console.error("Error updating decision:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update decision"
      );
    } finally {
      setDecisionUpdating((prev) => ({ ...prev, [applicationId]: false }));
    }
  };

  const deleteApplication = async (applicationId: string) => {
    const confirmDelete = window.confirm(
      "Delete this application? This cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `/api/admin/ambassador-applications/${applicationId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete application");
      }

      setApplications((prev) =>
        prev.filter((application) => application.id !== applicationId)
      );
      setSelected((prev) => (prev?.id === applicationId ? null : prev));
      toast.success("Application deleted");
    } catch (error) {
      console.error("Error deleting application:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete application"
      );
    }
  };

  const totalCount = useMemo(() => applications.length, [applications.length]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Ambassador Applications
          </h1>
          <p className="text-gray-600 mt-1">
            Review submissions for the Doing Good Series.
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
        <div className="w-full md:w-56">
          <Select
            value={sortBy}
            onValueChange={(value) =>
              setSortBy(value as "submitted" | "decision")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="submitted">Newest first</SelectItem>
              <SelectItem value="decision">Decision status</SelectItem>
            </SelectContent>
          </Select>
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
                <TableHead>State</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Decision</TableHead>
                <TableHead>Assets</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedApplications.map((application) => (
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
                  <TableCell>{application.stateOfResidence}</TableCell>
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
                    <div className="flex flex-col gap-2 text-sm">
                      <span>
                        CV: {application.hasCv ? "Yes" : "No"}
                      </span>
                      <span>
                        Video:{" "}
                        {application.hasVideoFile || application.introVideoLink
                          ? "Yes"
                          : "No"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelected(application)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>

                      {application.hasCv && (
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <a
                            href={`/api/admin/ambassador-applications/${application.id}/cv`}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            CV
                          </a>
                        </Button>
                      )}
                      {application.hasVideoFile && (
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <a
                            href={`/api/admin/ambassador-applications/${application.id}/video`}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Video
                          </a>
                        </Button>
                      )}
                      {application.introVideoLink && (
                        <Button size="sm" variant="outline" asChild>
                          <a
                            href={application.introVideoLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Link
                          </a>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteApplication(application.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm text-gray-700">
              <div className="space-y-2">
                <div className="font-semibold text-gray-500 space-y-1">
                  <div className="font-semibold text-gray-500">Full Name</div>
                  <span className="text-gray-900 font-medium">{selected.fullName}</span>
                </div>
                <div className="font-semibold text-gray-500 space-y-1">
                  <div className="font-semibold text-gray-500">Email</div>
                  <span className="text-gray-900 font-medium">{selected.email}</span>
                </div>
                <div className="font-semibold text-gray-500 space-y-1">
                  <div className="font-semibold text-gray-500">Phone</div>
                  <span className="text-gray-900 font-medium">{selected.phone}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="font-semibold text-gray-500">Decision</div>
                <Badge variant="secondary">
                  {decisionLabels[normalizeDecision(selected.decision)]}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-semibold text-gray-500">State of Residence</div>
                  <span className="text-gray-900 font-medium">{selected.stateOfResidence}</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-500">Age</div>
                  <span className="text-gray-900 font-medium">{selected.age}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-semibold text-gray-500">
                    Mass Communication or related field?
                  </div>
                  <span className="text-gray-900 font-medium">{selected.massComms ? "Yes" : "No"}</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-500">
                    Do you create content on social media?
                  </div>
                  <span className="text-gray-900 font-medium">{selected.createsContent ? "Yes" : "No"}</span>
                </div>
              </div>
              {selected.handles && (
                <div>
                  <div className="font-semibold text-gray-500">
                    Handles/Links
                  </div>
                  <span className="text-gray-900 font-medium">{selected.handles}</span>
                </div>
              )}
              <div>
                <div className="font-semibold text-gray-500">Why are you interested?</div>
                <span className="text-gray-900 font-medium whitespace-pre-wrap">{selected.interest}</span>
              </div>
              <div>
                <div className="font-semibold text-gray-500">
                  Have you helped someone tell their story or fundraise before?
                </div>
                <span className="text-gray-900 font-medium">{selected.helpedBefore ? "Yes" : "No"}</span>
              </div>
              {selected.helpedDescription && (
                <div>
                  <div className="font-semibold text-gray-500">
                    If yes, briefly describe what you helped with and the impact it had.
                  </div>
                  <div className="whitespace-pre-wrap">
                    <span className="text-gray-900 font-medium">{selected.helpedDescription}</span>
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
