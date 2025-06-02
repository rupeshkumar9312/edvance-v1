
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFees } from "@/hooks/useFees";

interface GenerateFeeRecordsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GenerateFeeRecordsDialog = ({ open, onOpenChange }: GenerateFeeRecordsDialogProps) => {
  const [feeTypeId, setFeeTypeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [classFilter, setClassFilter] = useState("");

  const { feeTypes, generateFeeRecords } = useFees();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feeTypeId || !dueDate) {
      return;
    }

    await generateFeeRecords.mutateAsync({
      feeTypeId,
      dueDate,
      classFilter: classFilter || undefined,
    });

    // Reset form
    setFeeTypeId("");
    setDueDate("");
    setClassFilter("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Fee Records</DialogTitle>
          <DialogDescription>
            Generate fee records for all students or a specific class.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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
              <Label htmlFor="classFilter">Class Filter (Optional)</Label>
              <Input
                id="classFilter"
                placeholder="e.g., Grade 10A (leave empty for all classes)"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={generateFeeRecords.isPending}>
              {generateFeeRecords.isPending ? "Generating..." : "Generate Records"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateFeeRecordsDialog;
