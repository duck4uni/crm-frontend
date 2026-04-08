"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FiPlayCircle } from "react-icons/fi";
import { Campaign, statusLabel, statusVariant } from "@/types/marketing";

interface CampaignListProps {
  campaigns: Campaign[];
  onRunCampaign: (campaignId: string) => void;
}

export function CampaignList({ campaigns, onRunCampaign }: CampaignListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách campaign</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="rounded-xl border border-gray-200 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-semibold text-gray-900">{campaign.name}</p>
                <p className="text-sm text-gray-500">{campaign.message}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant={statusVariant[campaign.status]}>{statusLabel[campaign.status]}</Badge>
                  <Badge variant="info">{campaign.channel}</Badge>
                  <Badge variant="default">Segment: {campaign.segment}</Badge>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p>Lịch gửi: {campaign.scheduledAt}</p>
                <p>
                  Kết quả: {campaign.sent.toLocaleString("vi-VN")} thành công, {campaign.failed.toLocaleString("vi-VN")} thất bại
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onRunCampaign(campaign.id)}>
                <FiPlayCircle className="mr-2 h-4 w-4" />
                Chạy ngay
              </Button>
              <Button variant="ghost" size="sm">
                Xem chi tiết
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
