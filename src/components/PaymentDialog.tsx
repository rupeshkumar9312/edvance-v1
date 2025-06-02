
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFees } from "@/hooks/useFees";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feeRecordId: string;
  studentName: string;
  feeType: string;
  amount: number;
}

const PaymentDialog = ({ open, onOpenChange, feeRecordId, studentName, feeType, amount }: PaymentDialogProps) => {
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const { markAsPaid } = useFees();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await markAsPaid.mutateAsync({
      id: feeRecordId,
      paymentMethod,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record payment for {studentName} - {feeType}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Amount</Label>
              <div className="text-2xl font-bold text-green-600">
                ${(amount / 100).toFixed(2)}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="online">Online Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={markAsPaid.isPending}>
              {markAsPaid.isPending ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
