
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AlertCircle } from 'lucide-react';

interface ForgotPasswordDialogProps {
  children: React.ReactNode;
}

const ForgotPasswordDialog = ({ children }: ForgotPasswordDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Password Reset Required
          </DialogTitle>
          <DialogDescription className="text-center py-4">
            Please contact your administrator to reset your password.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center">
          <Button onClick={() => setOpen(false)} className="w-full">
            Understood
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordDialog;
