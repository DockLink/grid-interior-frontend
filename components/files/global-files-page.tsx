"use client";

import { useMemo, useState } from "react";
import { Search, Upload } from "lucide-react";
import { toast } from "sonner";

import { DemoCaption } from "@/components/demo/demo-caption";
import { FileTypeIcon } from "@/components/projects/files/file-type-icon";
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
import { fileExtension } from "@/lib/files/format";
import { MOCK_GLOBAL_FILES } from "@/lib/files/mock-global-files";

export function GlobalFilesPage() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return MOCK_GLOBAL_FILES.filter(
      (f) =>
        !q ||
        f.fileName.toLowerCase().includes(q) ||
        f.project.toLowerCase().includes(q) ||
        f.folder.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold text-[#16233D]">Files</h2>
          <p className="text-[14px] text-[#5B6B85]">Across all studio projects</p>
          <DemoCaption className="mt-1" />
        </div>
        <Button
          className="rounded-full bg-[#0FA8A0] text-white hover:bg-[#0B9990]"
          onClick={() => toast.message("Upload is available inside a project folder.")}
        >
          <Upload size={14} /> Upload
        </Button>
      </div>

      <div className="relative mb-5 w-72">
        <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-[#5B6B85]" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search files or projects…"
          className="h-9 pl-8"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E4E9F0] bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Folder</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((f) => (
              <TableRow key={f.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileTypeIcon ext={fileExtension(f.fileName)} size={15} />
                    <span className="font-medium text-[#16233D]">{f.fileName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-[#5B6B85]">{f.project}</TableCell>
                <TableCell className="text-[#5B6B85]">{f.folder}</TableCell>
                <TableCell className="text-[#5B6B85]">{f.size}</TableCell>
                <TableCell className="text-[#5B6B85]">{f.updatedAt}</TableCell>
                <TableCell className="text-[#5B6B85]">{f.uploadedBy}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
