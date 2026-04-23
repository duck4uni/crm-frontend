"use client";

// This component is superseded by ZaloOaAddModal which handles the full OAuth flow.
// Kept for reference only.

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { FiLink2 } from "react-icons/fi";
import { OaConnectionFormState } from "@/types/zalo-oa";

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
          label="App ID"
          value={form.appId}
          onChange={(event) => onChange({ ...form, appId: event.target.value })}
          placeholder="4463534486333155530"
        />
        <Input
          label="Secret Key"
          value={form.secretKey}
          onChange={(event) => onChange({ ...form, secretKey: event.target.value })}
          placeholder="Secret key từ Zalo Developers"
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
