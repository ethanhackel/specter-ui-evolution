import { X } from "lucide-react";
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
  onConfirm: () => void;
  partnerName?: string;
};

const LeaveConfirmDialog = ({ open, onOpenChange, onConfirm, partnerName }: Props) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="border-border bg-card px-4 sm:px-6 pb-6 sm:pb-8 max-h-[85dvh]">
        <DrawerHeader className="px-0 pt-3 sm:pt-4 pb-1 sm:pb-2">
          <DrawerTitle className="flex items-center gap-2 sm:gap-2.5 font-heading text-base sm:text-lg tracking-wide">
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
            End Chat Session
          </DrawerTitle>
        </DrawerHeader>

        <div className="space-y-3 sm:space-y-4 pt-1">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2 block">
              Are you sure you want to end this chat?
            </p>
            <div className="rounded-lg border border-border bg-secondary/30 px-3 sm:px-4 py-2.5 sm:py-3">
              <p className="text-sm text-foreground">
                {partnerName ? (
                  <>You'll disconnect from <span className="font-medium text-primary">{partnerName}</span> and return to the matching queue.</>
                ) : (
                  "You'll disconnect from your chat partner and return to the matching queue."
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:gap-2.5">
            <Button
              onClick={handleConfirm}
              variant="destructive"
              className="w-full py-4 sm:py-5 font-heading font-bold text-xs sm:text-sm tracking-wider uppercase"
            >
              Yes, End Chat
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

export default LeaveConfirmDialog;