import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { InactiveReason, INACTIVE_REASON_LABELS } from "@/lib/customer-types";
import { useUpdateCustomerStatus } from "@/hooks/use-customers";
import { useToast } from "@/hooks/use-toast";

export function InactiveDialog({
  customerId, customerName, open, onOpenChange,
}: {
  customerId: string;
  customerName: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { toast } = useToast();
  const { mutate: updateStatus } = useUpdateCustomerStatus();
  const [reason, setReason] = useState<InactiveReason>("not_interested");
  const [note, setNote] = useState("");

  const handleConfirm = () => {
    updateStatus({ id: customerId, status: "inactive", reason, note }, {
      onSuccess: () => {
        toast({ title: "Marked inactive", description: customerName });
        onOpenChange(false);
        setNote("");
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mark customer inactive?</AlertDialogTitle>
          <AlertDialogDescription>
            {customerName} will be hidden from active lists. You can reactivate them later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Reason</Label>
            <Select value={reason} onValueChange={(v) => setReason(v as InactiveReason)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(INACTIVE_REASON_LABELS) as InactiveReason[]).map((k) => (
                  <SelectItem key={k} value={k}>{INACTIVE_REASON_LABELS[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Note (optional)</Label>
            <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Mark Inactive
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
