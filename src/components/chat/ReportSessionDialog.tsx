import { useState } from "react";
import { Flag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: string) => void;
};

const ReportSessionDialog = ({ open, onOpenChange, onSubmit }: Props) => {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) return;
    onSubmit(reason.trim());
    setReason("");
  };

  const handleCancel = () => {
    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 font-heading text-lg tracking-wide">
            <Flag className="w-5 h-5 text-destructive" />
            Report Session
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Describe the issue:
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. offensive language, spam, harassment..."
              className="w-full min-h-[120px] rounded-lg border border-border bg-secondary/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 resize-y transition-all"
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <Button
              onClick={handleSubmit}
              disabled={!reason.trim()}
              className="w-full py-5 font-heading font-bold text-sm tracking-wider uppercase btn-primary-glow"
            >
              Submit Report
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="w-full py-5 font-heading font-medium text-sm tracking-wider uppercase border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportSessionDialog;
