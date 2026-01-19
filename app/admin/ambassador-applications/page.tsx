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
import { Eye, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";

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
}

export default function AmbassadorApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Application | null>(null);

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
                <TableHead>Assets</TableHead>
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
                  <TableCell>{application.stateOfResidence}</TableCell>
                  <TableCell>
                    {new Date(application.createdAt).toLocaleString()}
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl">
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
                  <div className="font-semibold text-gray-900">State</div>
                  <div>{selected.stateOfResidence}</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Age</div>
                  <div>{selected.age}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-semibold text-gray-900">
                    Mass Comms/Related
                  </div>
                  <div>{selected.massComms ? "Yes" : "No"}</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    Creates Content
                  </div>
                  <div>{selected.createsContent ? "Yes" : "No"}</div>
                </div>
              </div>
              {selected.handles && (
                <div>
                  <div className="font-semibold text-gray-900">
                    Handles/Links
                  </div>
                  <div>{selected.handles}</div>
                </div>
              )}
              <div>
                <div className="font-semibold text-gray-900">Why interested</div>
                <div className="whitespace-pre-wrap">{selected.interest}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  Helped before
                </div>
                <div>{selected.helpedBefore ? "Yes" : "No"}</div>
              </div>
              {selected.helpedDescription && (
                <div>
                  <div className="font-semibold text-gray-900">
                    Helped description
                  </div>
                  <div className="whitespace-pre-wrap">
                    {selected.helpedDescription}
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
