"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { mockTasks } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import { FiPlus, FiSearch, FiCheckCircle } from "react-icons/fi";

const priorityColors: Record<
  string,
  "default" | "info" | "warning" | "danger"
> = {
  low: "default",
  medium: "info",
  high: "warning",
  urgent: "danger",
};

const statusColors: Record<string, "default" | "info" | "success" | "default"> =
{
  todo: "default",
  in_progress: "info",
  completed: "success",
  cancelled: "default",
};

const priorityLabels: Record<string, string> = {
  low: "Thấp",
  medium: "Trung bình",
  high: "Cao",
  urgent: "Khẩn cấp",
};

const statusLabels: Record<string, string> = {
  todo: "Cần làm",
  in_progress: "Đang thực hiện",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

export default function TasksPage() {
  const [tasks] = useState(mockTasks);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const todoTasks = filteredTasks.filter((t) => t.status === "todo");
  const inProgressTasks = filteredTasks.filter(
    (t) => t.status === "in_progress",
  );
  const completedTasks = filteredTasks.filter((t) => t.status === "completed");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="mt-1 text-gray-500">Quản lý và theo dõi công việc hằng ngày</p>
        </div>
        <Button>
          <FiPlus className="w-5 h-5 mr-2" />
          Thêm công việc
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent>
            <p className="text-sm text-gray-600">Cần làm</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {todoTasks.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-gray-600">Đang thực hiện</p>
            <p className="mt-2 text-2xl font-bold text-blue-600">
              {inProgressTasks.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-gray-600">Hoàn thành</p>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {completedTasks.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm công việc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">Lọc</Button>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardContent className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="mt-1">
                  <FiCheckCircle
                    className={`w-5 h-5 ${task.status === "completed"
                      ? "text-green-600"
                      : "text-gray-300"
                      }`}
                  />
                </div>

                <div className="flex-1">
                  <h3
                    className={`text-lg font-semibold ${task.status === "completed"
                      ? "line-through text-gray-500"
                      : "text-gray-900"
                      }`}
                  >
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="mt-1 text-sm text-gray-600">
                      {task.description}
                    </p>
                  )}

                  <div className="mt-3 flex items-center space-x-3">
                    <Badge variant={priorityColors[task.priority]}>
                      {priorityLabels[task.priority] ?? task.priority}
                    </Badge>
                    <Badge variant={statusColors[task.status]}>
                      {statusLabels[task.status] ?? task.status.replace("_", " ")}
                    </Badge>
                    {task.dueDate && (
                      <span className="text-sm text-gray-600">
                        Hạn: {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>

                  {task.tags && task.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {task.tags.map((tag) => (
                        <Badge key={tag} variant="info">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy công việc nào</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
