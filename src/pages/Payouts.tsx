import { useEffect, useState } from "react";
import {
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

/* ================= DATA ================= */
const initialPayslips = [
  { empId: "EMP001", name: "Arun Kumar", dept: "Engineering", month: "January", year: "2024", gross: 75000, deductions: 11400, net: 52450, status: "Paid" },
  { empId: "EMP002", name: "Priya Sharma", dept: "HR", month: "January", year: "2024", gross: 68000, deductions: 9800, net: 48200, status: "Paid" },
  { empId: "EMP003", name: "Rahul Verma", dept: "Finance", month: "December", year: "2023", gross: 72000, deductions: 10944, net: 50400, status: "Pending" },
  { empId: "EMP004", name: "Sneha Iyer", dept: "Marketing", month: "December", year: "2023", gross: 64000, deductions: 9000, net: 45000, status: "Pending" },
];

export function PayoutsPage() {
  const { toast } = useToast();

  const [payslips, setPayslips] = useState(initialPayslips);
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState<any>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);

  const pageSize = 3;

  useEffect(() => setPage(1), [search, year, status]);

  /* ================= FILTER ================= */
  const filtered = payslips.filter(
    (p) =>
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.empId.toLowerCase().includes(search.toLowerCase())) &&
      (year === "all" || p.year === year) &&
      (status === "all" || p.status === status)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  /* ================= SUMMARY ================= */
  const totalNet = filtered.reduce((s, p) => s + p.net, 0);
  const pendingCount = payslips.filter((p) => p.status === "Pending").length;

  /* ================= ACTIONS ================= */
  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelected(
      selected.length === paginated.length
        ? []
        : paginated.map((p) => p.empId)
    );
  };

  const updateStatus = (value: "Paid" | "Rejected" | "Pending") => {
    setPayslips((prev) =>
      prev.map((p) =>
        selected.includes(p.empId) ? { ...p, status: value } : p
      )
    );
    setSelected([]);
    toast({ title: `Payslips marked as ${value}` });
  };

  /* ================= CSV ================= */
  const downloadCSV = (rows: any[], name = "payslips.csv") => {
    if (!rows.length) {
      toast({ variant: "destructive", title: "No data to download" });
      return;
    }
    const header = Object.keys(rows[0]).join(",");
    const body = rows.map((r) => Object.values(r).join(",")).join("\n");
    const csv = `${header}\n${body}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadSingle = (p: any) => {
    setDownloading(p.empId);
    setTimeout(() => {
      downloadCSV([p], `${p.empId}.csv`);
      setDownloading(null);
    }, 700);
  };

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Payroll & Payouts</h1>
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => downloadCSV(filtered)}>
          <Download className="h-4 w-4 mr-2" /> Download All
        </Button>
      </div>

      {/* SUMMARY */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Summary title="Employees" value={filtered.length} type="employee" />
        <Summary title="Net Pay" value={`₹${totalNet.toLocaleString()}`} type="money" />
        <Summary title="Pending" value={pendingCount} type="pending" />
        <Summary title="Status" value="Active" type="status" />
      </div>

      {/* FILTER */}
      <Card>
        <CardContent className="pt-6 flex flex-wrap gap-4">
          <Input placeholder="Search name / ID" value={search} onChange={(e) => setSearch(e.target.value)} />

          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Year" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* BULK ACTIONS */}
      <div className="flex gap-2">
        <Button disabled={!selected.length} className="bg-green-600 hover:bg-green-700" onClick={() => updateStatus("Paid")}>
          Approve
        </Button>
        <Button disabled={!selected.length} className="bg-yellow-500 hover:bg-yellow-600 text-white" onClick={() => updateStatus("Pending")}>
          Pending
        </Button>
        <Button disabled={!selected.length} className="bg-red-500 hover:bg-red-600" onClick={() => updateStatus("Rejected")}>
          Reject
        </Button>
      </div>

      {/* TABLE */}
      <Card>
        <CardHeader><CardTitle>Payslips</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><input type="checkbox" onChange={selectAll} /></TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Net Pay</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginated.map((p) => (
                <TableRow key={p.empId} className={selected.includes(p.empId) ? "bg-indigo-50" : "hover:bg-slate-50"}>
                  <TableCell>
                    <input type="checkbox" checked={selected.includes(p.empId)} onChange={() => toggleSelect(p.empId)} />
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.empId}</p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>{p.month} {p.year}</TableCell>

                  <TableCell>
                    <span className="px-3 py-1 rounded-lg font-bold text-green-700 bg-green-50 border border-green-200">
                      ₹{p.net.toLocaleString()}
                    </span>
                  </TableCell>

                  <TableCell>
                    <Badge className={
                      p.status === "Paid"
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                        : p.status === "Rejected"
                        ? "bg-gradient-to-r from-red-500 to-rose-600 text-white"
                        : "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                    }>
                      {p.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={!selected.includes(p.empId)}
                      onClick={() => updateStatus("Pending")}
                    >
                      <Pencil className="h-4 w-4 text-yellow-600" />
                    </Button>

                    <Button size="icon" variant="ghost" onClick={() => setPreview(p)}>
                      <Eye className="h-4 w-4 text-indigo-600" />
                    </Button>

                    <Button size="icon" variant="ghost" onClick={() => downloadSingle(p)}>
                      {downloading === p.empId
                        ? <Loader2 className="animate-spin h-4 w-4" />
                        : <Download className="h-4 w-4 text-green-600" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* PAGINATION */}
      <div className="flex justify-end gap-2">
        <Button size="icon" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
          <ChevronLeft />
        </Button>
        <span>Page {page} / {totalPages}</span>
        <Button size="icon" variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
          <ChevronRight />
        </Button>
      </div>

      {/* PREVIEW */}
      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent>
          {preview && (
            <>
              <DialogHeader><DialogTitle>Payslip Preview</DialogTitle></DialogHeader>
              <p className="font-bold">{preview.name}</p>
              <p>{preview.dept}</p>
              <p>Gross: ₹{preview.gross}</p>
              <p>Deductions: ₹{preview.deductions}</p>
              <p className="font-bold text-green-600">Net: ₹{preview.net}</p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ================= SUMMARY CARD ================= */
function Summary({
  title,
  value,
  type,
}: {
  title: string;
  value: any;
  type: "employee" | "money" | "pending" | "status";
}) {
  const styles = {
    employee: "from-indigo-500 to-blue-600",
    money: "from-green-500 to-emerald-600",
    pending: "from-yellow-400 to-orange-500",
    status: "from-purple-500 to-pink-500",
  };

  return (
    <Card className={`border-0 shadow-lg bg-gradient-to-br ${styles[type]} text-white`}>
      <CardContent className="pt-6">
        <p className="text-sm opacity-90">{title}</p>
        <p className="text-3xl font-extrabold mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}