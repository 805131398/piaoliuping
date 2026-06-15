import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";

interface ProfileSyncButtonProps {
  syncing: boolean;
  onSync: () => void;
}

export function ProfileSyncButton({ syncing, onSync }: ProfileSyncButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="p-1"
          aria-label="同步 GitHub 信息"
          disabled={syncing}
        >
          {syncing ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-3.219-6.825M21 4v5h-5" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-3.219-6.825M21 4v5h-5" />
            </svg>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>确认同步</DialogTitle>
        <div>确定要从 GitHub 拉取最新信息并覆盖本地资料吗？</div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
          <Button onClick={onSync} disabled={syncing}>
            {syncing ? "同步中..." : "确认同步"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 