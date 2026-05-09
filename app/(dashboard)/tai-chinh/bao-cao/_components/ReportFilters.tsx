"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/ToastProvider";
import { TAI_KHOAN_LIST } from "../_type";

interface Props {
  tuNgay: string;
  onTuNgayChange: (v: string) => void;
  denNgay: string;
  onDenNgayChange: (v: string) => void;
  taiKhoanFilter: string;
  onTaiKhoanFilterChange: (v: string) => void;
}

export function ReportFilters({
  tuNgay,
  onTuNgayChange,
  denNgay,
  onDenNgayChange,
  taiKhoanFilter,
  onTaiKhoanFilterChange,
}: Props) {
  const toast = useToast();

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <Input
        type="date"
        value={tuNgay}
        onChange={(e) => onTuNgayChange(e.target.value)}
        className="max-w-[180px]"
      />
      <Input
        type="date"
        value={denNgay}
        onChange={(e) => onDenNgayChange(e.target.value)}
        className="max-w-[180px]"
      />
      <div className="w-56">
        <Select
          value={taiKhoanFilter}
          onChange={(e) => onTaiKhoanFilterChange(e.target.value)}
          options={TAI_KHOAN_LIST.map((tk) => ({
            value: tk.id,
            label: `${tk.id} - ${tk.ten}`,
          }))}
          placeholder="Tất cả tài khoản"
        />
      </div>
      <Button
        className="ml-auto"
        variant="outline"
        onClick={() => toast.info("Coming soon", "Xuất báo cáo đang phát triển")}
      >
        Xuất báo cáo
      </Button>
    </div>
  );
}
