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
      <DrawerContent className="border-border bg-card px-4 sm:px-6 pb-6 sm:pb-8">
        <DrawerHeader className="px-0 pt-3 sm:pt-4 pb-2 sm:pb-3 text-center">
          <DrawerTitle className="font-heading text-base sm:text-lg tracking-wide text-foreground">
            End this chat and find someone new?
          </DrawerTitle>
        </DrawerHeader>

        <div className="space-y-3 sm:space-y-4">
          {partnerName && (
            <p className="text-xs sm:text-sm text-muted-foreground text-center px-2">
              You'll disconnect from <span className="text-foreground font-medium">{partnerName}</span> and return to matching
            </p>
          )}

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