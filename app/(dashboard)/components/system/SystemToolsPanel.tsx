"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/ToastProvider";
import { tagsService } from "@/services/tags";
import { filesService } from "@/services/files";
import { logsService } from "@/services/logs";
import { TagApiRow, FilesListResponse } from "@/types/api";
import { FiUpload, FiTrash2, FiRefreshCw } from "react-icons/fi";

type SystemToolsSection = "tags" | "files" | "logs";

interface FlatLogItem {
  source: string;
  dateKey: string;
  fileKey: string;
  content: string;
}

function toDdMmYyyy(dateValue: string): string | undefined {
  if (!dateValue) {
    return undefined;
  }

  const parts = dateValue.split("-");
  if (parts.length !== 3) {
    return undefined;
  }

  const [year, month, day] = parts;
  return `${day}-${month}-${year}`;
}

function getTodayInputValue(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

function flattenLogs(raw: unknown): FlatLogItem[] {
  if (!raw || typeof raw !== "object") {
    return [];
  }

  const result: FlatLogItem[] = [];
  const sourceEntries = Object.entries(raw as Record<string, unknown>);

  sourceEntries.forEach(([source, dateMap]) => {
    if (!dateMap || typeof dateMap !== "object") {
      return;
    }

    Object.entries(dateMap as Record<string, unknown>).forEach(([dateKey, fileMap]) => {
      if (!fileMap || typeof fileMap !== "object") {
        return;
      }

      Object.entries(fileMap as Record<string, unknown>).forEach(([fileKey, content]) => {
        result.push({
          source,
          dateKey,
          fileKey,
          content: typeof content === "string" ? content : JSON.stringify(content),
        });
      });
    });
  });

  return result;
}

function collectFilesByFolder(files: FilesListResponse): Array<{ folder: keyof FilesListResponse; items: string[] }> {
  return [
    { folder: "images", items: files.images || [] },
    { folder: "videos", items: files.videos || [] },
    { folder: "files", items: files.files || [] },
  ];
}

export function SystemToolsPanel({ sections }: { sections?: SystemToolsSection[] }) {
  const toast = useToast();
  const enabledSections = sections ?? ["tags", "files", "logs"];
  const showTags = enabledSections.includes("tags");
  const showFiles = enabledSections.includes("files");
  const showLogs = enabledSections.includes("logs");

  const [tags, setTags] = useState<TagApiRow[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [isSavingTag, setIsSavingTag] = useState(false);
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null);

  const [files, setFiles] = useState<FilesListResponse>({ images: [], videos: [], files: [] });
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [deletingFilePath, setDeletingFilePath] = useState<string | null>(null);

  const [fromDate, setFromDate] = useState(getTodayInputValue());
  const [toDate, setToDate] = useState(getTodayInputValue());
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logs, setLogs] = useState<FlatLogItem[]>([]);

  const fileGroups = useMemo(() => collectFilesByFolder(files), [files]);

  const loadTags = useCallback(async () => {
    setIsLoadingTags(true);
    try {
      const response = await tagsService.getTags({ pageSize: "200" });
      setTags(response.responseData?.rows ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tải danh sách tag.";
      toast.error("Tải tags thất bại", message);
    } finally {
      setIsLoadingTags(false);
    }
  }, [toast]);

  const loadFiles = useCallback(async () => {
    setIsLoadingFiles(true);
    try {
      const response = await filesService.getFiles();
      setFiles(response.responseData ?? { images: [], videos: [], files: [] });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tải danh sách file.";
      toast.error("Tải files thất bại", message);
    } finally {
      setIsLoadingFiles(false);
    }
  }, [toast]);

  useEffect(() => {
    if (showTags) {
      void loadTags();
    }

    if (showFiles) {
      void loadFiles();
    }
  }, [loadFiles, loadTags, showFiles, showTags]);

  const handleCreateTag = async () => {
    const normalizedName = newTagName.trim();

    if (!normalizedName) {
      toast.warning("Thiếu tên tag", "Vui lòng nhập tên tag trước khi tạo.");
      return;
    }

    setIsSavingTag(true);
    try {
      await tagsService.createTag({ name: normalizedName });
      setNewTagName("");
      await loadTags();
      toast.success("Tạo tag thành công", `Tag \"${normalizedName}\" đã được tạo.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tạo tag.";
      toast.error("Tạo tag thất bại", message);
    } finally {
      setIsSavingTag(false);
    }
  };

  const handleDeleteTag = async (tagId: string, tagName: string) => {
    setDeletingTagId(tagId);
    try {
      await tagsService.deleteTag(tagId);
      await loadTags();
      toast.success("Xóa tag thành công", `Tag \"${tagName}\" đã được xóa.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể xóa tag.";
      toast.error("Xóa tag thất bại", message);
    } finally {
      setDeletingTagId(null);
    }
  };

  const handleUploadFile = async (file?: File) => {
    if (!file) {
      return;
    }

    setIsUploadingFile(true);
    try {
      await filesService.uploadFile(file);
      await loadFiles();
      toast.success("Upload thành công", `Đã upload file \"${file.name}\".`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể upload file.";
      toast.error("Upload thất bại", message);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleDeleteFile = async (filePath: string) => {
    setDeletingFilePath(filePath);
    try {
      await filesService.deleteFile(filePath);
      await loadFiles();
      toast.success("Xóa file thành công", `Đã xóa ${filePath}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể xóa file.";
      toast.error("Xóa file thất bại", message);
    } finally {
      setDeletingFilePath(null);
    }
  };

  const handleLoadLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const response = await logsService.getLogs(toDdMmYyyy(fromDate), toDdMmYyyy(toDate));
      const flat = flattenLogs(response.responseData);
      setLogs(flat);
      toast.success("Tải logs thành công", `Đã tải ${flat.length} bản ghi log.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tải logs.";
      toast.error("Tải logs thất bại", message);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {showTags ? (
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Quản lý Tags (API)</CardTitle>
          <Button variant="outline" size="sm" onClick={() => void loadTags()} disabled={isLoadingTags || isSavingTag}>
            <FiRefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="Nhập tên tag mới"
              value={newTagName}
              onChange={(event) => setNewTagName(event.target.value)}
              disabled={isSavingTag}
            />
            <Button onClick={handleCreateTag} disabled={isSavingTag}>
              {isSavingTag ? <Spinner size="sm" className="mr-2" /> : null}
              Tạo tag
            </Button>
          </div>

          {isLoadingTags ? (
            <div className="text-sm text-gray-600">Đang tải tags...</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.length === 0 ? (
                <p className="text-sm text-gray-500">Chưa có tag nào.</p>
              ) : (
                tags.map((tag) => (
                  <div key={tag.id} className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1">
                    <Badge variant="info">{tag.name}</Badge>
                    <button
                      type="button"
                      disabled={deletingTagId === tag.id}
                      onClick={() => {
                        void handleDeleteTag(tag.id, tag.name);
                      }}
                      className="text-gray-400 transition-colors hover:text-red-600"
                      aria-label={`Xóa tag ${tag.name}`}
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
      ) : null}

      {showFiles ? (
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Quản lý Files (API)</CardTitle>
          <Button variant="outline" size="sm" onClick={() => void loadFiles()} disabled={isLoadingFiles || isUploadingFile}>
            <FiRefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="inline-flex cursor-pointer items-center rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
              <FiUpload className="mr-2 h-4 w-4" />
              Chọn file upload
              <input
                type="file"
                className="hidden"
                disabled={isUploadingFile}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  void handleUploadFile(file);
                  event.target.value = "";
                }}
              />
            </label>
            {isUploadingFile ? <span className="text-sm text-gray-500">Đang upload...</span> : null}
          </div>

          {isLoadingFiles ? (
            <div className="text-sm text-gray-600">Đang tải files...</div>
          ) : (
            <div className="space-y-4">
              {fileGroups.map((group) => (
                <div key={group.folder}>
                  <p className="mb-2 text-sm font-semibold text-gray-700 uppercase">{group.folder}</p>
                  {group.items.length === 0 ? (
                    <p className="text-sm text-gray-500">Không có file.</p>
                  ) : (
                    <div className="space-y-2">
                      {group.items.map((path) => (
                        <div key={path} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
                          <span className="truncate text-sm text-gray-700">{path}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={deletingFilePath === path}
                            onClick={() => {
                              void handleDeleteFile(path);
                            }}
                          >
                            <FiTrash2 className="mr-1 h-4 w-4" />
                            Xóa
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      ) : null}

      {showLogs ? (
      <Card>
        <CardHeader>
          <CardTitle>Xem Logs (API)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Input
              label="Từ ngày"
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              disabled={isLoadingLogs}
            />
            <Input
              label="Đến ngày"
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              disabled={isLoadingLogs}
            />
            <div className="flex items-end">
              <Button className="w-full" onClick={() => void handleLoadLogs()} disabled={isLoadingLogs}>
                {isLoadingLogs ? <Spinner size="sm" className="mr-2" /> : null}
                Tải logs
              </Button>
            </div>
          </div>

          {logs.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có dữ liệu logs để hiển thị.</p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Tổng bản ghi: {logs.length}</p>
              {logs.slice(0, 20).map((item, index) => (
                <div key={`${item.source}-${item.dateKey}-${item.fileKey}-${index}`} className="rounded-lg border border-gray-200 p-3">
                  <p className="text-xs text-gray-500">
                    {item.source} / {item.dateKey} / {item.fileKey}
                  </p>
                  <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded bg-gray-50 p-2 text-xs text-gray-700">
                    {item.content}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      ) : null}
    </div>
  );
}
