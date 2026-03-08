import { useState } from "react";
import { Flag } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="border-border bg-card px-4 sm:px-6 pb-6 sm:pb-8 max-h-[85dvh]">
        <DrawerHeader className="px-0 pt-3 sm:pt-4 pb-1 sm:pb-2">
          <DrawerTitle className="flex items-center gap-2 sm:gap-2.5 font-heading text-base sm:text-lg tracking-wide">
            <Flag className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
            Report Session
          </DrawerTitle>
        </DrawerHeader>

        <div className="space-y-3 sm:space-y-4 pt-1">
          <div>
            <label className="text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2 block">
              Describe the issue:
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. offensive language, spam, harassment..."
              className="w-full min-h-[100px] sm:min-h-[120px] rounded-lg border border-border bg-secondary/30 px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 resize-y transition-all"
            />
          </div>

          <div className="flex flex-col gap-2 sm:gap-2.5">
            <Button
              onClick={handleSubmit}
              disabled={!reason.trim()}
              className="w-full py-4 sm:py-5 font-heading font-bold text-xs sm:text-sm tracking-wider uppercase btn-primary-glow"
            >
              Submit Report
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="w-full py-4 sm:py-5 font-heading font-medium text-xs sm:text-sm tracking-wider uppercase border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ReportSessionDialog;
