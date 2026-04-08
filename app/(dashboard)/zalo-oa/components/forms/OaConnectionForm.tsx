"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FiLink2 } from "react-icons/fi";
import { leaderOptions, OaConnectionFormState } from "@/types/zalo-oa";

interface OaConnectionFormProps {
  form: OaConnectionFormState;
  onChange: (next: OaConnectionFormState) => void;
  onCreateConnection: () => void;
}

export function OaConnectionForm({ form, onChange, onCreateConnection }: OaConnectionFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kết nối OA mới</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Input
          label="Tên OA"
          value={form.oaName}
          onChange={(event) => onChange({ ...form, oaName: event.target.value })}
          placeholder="Ví dụ: Điện Lạnh Quận 7"
        />
        <Input
          label="OA Official ID"
          value={form.oaOfficialId}
          onChange={(event) => onChange({ ...form, oaOfficialId: event.target.value })}
          placeholder="OA_123456"
        />
        <Select
          label="Người phụ trách"
          value={form.owner}
          options={leaderOptions}
          onChange={(event) => onChange({ ...form, owner: event.target.value })}
        />
        <div className="flex items-end">
          <Button className="w-full" onClick={onCreateConnection}>
            <FiLink2 className="mr-2 h-4 w-4" />
            Thêm kết nối
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
