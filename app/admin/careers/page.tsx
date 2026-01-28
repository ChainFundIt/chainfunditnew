"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, RefreshCcw } from "lucide-react";

interface CareerOpening {
  id: string;
  title: string;
  department?: string | null;
  location?: string | null;
  employmentType?: string | null;
  summary?: string | null;
  responsibilities?: string[] | null;
  requirements?: string[] | null;
  customFields?: Array<{ label: string; value: string }> | null;
  applyUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const emptyForm = {
  title: "",
  department: "",
  location: "",
  employmentType: "",
  summary: "",
  responsibilities: "",
  requirements: "",
  customFields: [] as Array<{ label: string; value: string }>,
  applyUrl: "",
  isActive: true,
  sortOrder: 0,
};

export default function AdminCareersPage() {
  const [openings, setOpenings] = useState<CareerOpening[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [showNewField, setShowNewField] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");
  const employmentOptions = useMemo(
    () => ["Full-time", "Part-time", "Contract", "Internship", "Volunteer"],
    []
  );

  const fetchOpenings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/careers");
      if (!response.ok) {
        throw new Error("Failed to fetch roles");
      }
      const data = await response.json();
      setOpenings(data.openings || []);
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Failed to load careers data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpenings();
  }, []);

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setShowNewField(false);
    setNewFieldLabel("");
    setNewFieldValue("");
  };

  const handleAddCustomField = () => {
    const label = newFieldLabel.trim();
    const value = newFieldValue.trim();
    if (!label || !value) {
      toast.error("Custom field label and value are required");
      return;
    }

    setForm((prev) => ({
      ...prev,
      customFields: [...prev.customFields, { label, value }],
    }));
    setNewFieldLabel("");
    setNewFieldValue("");
    setShowNewField(false);
  };

  const handleRemoveCustomField = (index: number) => {
    setForm((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((_, idx) => idx !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error("Role title is required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        department: form.department.trim() || null,
        location: form.location.trim() || null,
        employmentType: form.employmentType || null,
        summary: form.summary.trim() || null,
        responsibilities: form.responsibilities.trim(),
        requirements: form.requirements.trim(),
        customFields: form.customFields,
        applyUrl: form.applyUrl.trim() || null,
      };

      const response = await fetch(
        editingId ? `/api/admin/careers/${editingId}` : "/api/admin/careers",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save role");
      }

      await fetchOpenings();
      toast.success(editingId ? "Role updated" : "Role added");
      resetForm();
    } catch (error) {
      console.error("Error saving role:", error);
      toast.error("Failed to save role");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (opening: CareerOpening) => {
    setEditingId(opening.id);
    setForm({
      title: opening.title || "",
      department: opening.department || "",
      location: opening.location || "",
      employmentType: opening.employmentType || "",
      summary: opening.summary || "",
      responsibilities: (opening.responsibilities || []).join("\n"),
      requirements: (opening.requirements || []).join("\n"),
      customFields: opening.customFields || [],
      applyUrl: opening.applyUrl || "",
      isActive: opening.isActive,
      sortOrder: opening.sortOrder ?? 0,
    });
  };

  const handleToggleStatus = async (opening: CareerOpening) => {
    try {
      const response = await fetch(`/api/admin/careers/${opening.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !opening.isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      await fetchOpenings();
      toast.success(
        opening.isActive ? "Role closed" : "Role reopened"
      );
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update role status");
    }
  };

  const handleDelete = async (opening: CareerOpening) => {
    const confirmed = window.confirm(
      `Delete "${opening.title}"? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/careers/${opening.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete role");
      }
      await fetchOpenings();
      toast.success("Role deleted");
    } catch (error) {
      console.error("Error deleting role:", error);
      toast.error("Failed to delete role");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Careers</h1>
            <p className="text-gray-600">
              Add and manage open roles on the Careers page.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchOpenings}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Role" : "Add New Role"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Role Title</label>
                <Input
                  value={form.title}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="e.g. Community Partnerships Lead"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Input
                  value={form.department}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      department: event.target.value,
                    }))
                  }
                  placeholder="Growth, Marketing, Operations..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={form.location}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      location: event.target.value,
                    }))
                  }
                  placeholder="Remote, Lagos, Abuja..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Employment Type</label>
                <Select
                  value={form.employmentType}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, employmentType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {employmentOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Summary</label>
                <Textarea
                  value={form.summary}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      summary: event.target.value,
                    }))
                  }
                  placeholder="Short overview of the role"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Apply URL</label>
                <Input
                  value={form.applyUrl}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      applyUrl: event.target.value,
                    }))
                  }
                  placeholder="https:// or mailto:"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Responsibilities (one per line)
                </label>
                <Textarea
                  value={form.responsibilities}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      responsibilities: event.target.value,
                    }))
                  }
                  placeholder="Lead partnerships&#10;Coordinate onboarding"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Requirements (one per line)
                </label>
                <Textarea
                  value={form.requirements}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      requirements: event.target.value,
                    }))
                  }
                  placeholder="3+ years experience&#10;Excellent writing"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={form.isActive ? "open" : "closed"}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      isActive: value === "open",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort Order</label>
                <Input
                  type="number"
                  value={String(form.sortOrder)}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      sortOrder: Number(event.target.value || 0),
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-700">
                    Custom fields
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewField((prev) => !prev)}
                  >
                    {showNewField ? "Cancel" : "Add new field"}
                  </Button>
                </div>

                {form.customFields.length > 0 && (
                  <div className="space-y-2">
                    {form.customFields.map((field, index) => (
                      <div
                        key={`${field.label}-${index}`}
                        className="flex items-center justify-between gap-3 rounded-md border border-gray-200 px-3 py-2"
                      >
                        <div className="text-sm">
                          <span className="font-medium">{field.label}:</span>{" "}
                          {field.value}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCustomField(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {showNewField && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Field label
                      </label>
                      <Input
                        value={newFieldLabel}
                        onChange={(event) => setNewFieldLabel(event.target.value)}
                        placeholder="e.g. Reporting Line"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Field value</label>
                      <Input
                        value={newFieldValue}
                        onChange={(event) => setNewFieldValue(event.target.value)}
                        placeholder="e.g. Growth / Partnerships Lead"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Button onClick={handleAddCustomField}>
                        Add field
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting
                  ? "Saving..."
                  : editingId
                    ? "Update Role"
                    : "Add Role"}
              </Button>
              {editingId && (
                <Button variant="outline" onClick={resetForm}>
                  Cancel Edit
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open Roles</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-gray-600">Loading roles...</div>
            ) : openings.length === 0 ? (
              <div className="text-sm text-gray-600">
                No roles yet. Add the first one above.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {openings.map((opening) => (
                    <TableRow key={opening.id}>
                      <TableCell>
                        <div className="font-medium">{opening.title}</div>
                        <div className="text-xs text-gray-500">
                          {opening.employmentType || "Unspecified"}
                        </div>
                      </TableCell>
                      <TableCell>{opening.department || "-"}</TableCell>
                      <TableCell>{opening.location || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={opening.isActive ? "default" : "secondary"}
                        >
                          {opening.isActive ? "Open" : "Closed"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(opening)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleStatus(opening)}
                          >
                            {opening.isActive ? "Close" : "Reopen"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(opening)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
