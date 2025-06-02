
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFees } from "@/hooks/useFees";
import { useStudents } from "@/hooks/useStudents";

interface AddFeeRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddFeeRecordDialog = ({ open, onOpenChange }: AddFeeRecordDialogProps) => {
  const [studentId, setStudentId] = useState("");
  const [feeTypeId, setFeeTypeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [notes, setNotes] = useState("");

  const { feeTypes, createFeeRecord } = useFees();
  const { students } = useStudents();

  const selectedFeeType = feeTypes?.find(ft => ft.id === feeTypeId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentId || !feeTypeId || !dueDate) {
      return;
    }

    const amount = customAmount ? parseInt(customAmount) * 100 : selectedFeeType?.amount || 0;

    await createFeeRecord.mutateAsync({
      student_id: studentId,
      fee_type_id: feeTypeId,
      amount: amount,
      due_date: dueDate,
      status: 'pending',
      paid_date: null,
      payment_method: null,
      notes: notes || null,
    });

    // Reset form
    setStudentId("");
    setFeeTypeId("");
    setDueDate("");
    setCustomAmount("");
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Fee Record</DialogTitle>
          <DialogDescription>
            Create a new fee record for a student.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="student">Student</Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students?.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.class})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="feeType">Fee Type</Label>
              <Select value={feeTypeId} onValueChange={setFeeTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fee type" />
                </SelectTrigger>
                <SelectContent>
                  {feeTypes?.map((feeType) => (
                    <SelectItem key={feeType.id} value={feeType.id}>
                      {feeType.name} (${(feeType.amount / 100).toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="customAmount">Custom Amount (USD)</Label>
              <Input
                id="customAmount"
                type="number"
                step="0.01"
                placeholder={selectedFeeType ? `Default: $${(selectedFeeType.amount / 100).toFixed(2)}` : "Enter amount"}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Optional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createFeeRecord.isPending}>
              {createFeeRecord.isPending ? "Adding..." : "Add Fee Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFeeRecordDialog;
