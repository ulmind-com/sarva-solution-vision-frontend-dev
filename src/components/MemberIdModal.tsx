import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

const MemberIdModal = () => {
  const { registeredMemberId, showMemberIdModal, closeMemberIdModal } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCopy = () => {
    if (registeredMemberId) {
      navigator.clipboard.writeText(registeredMemberId);
      setCopied(true);
      toast.success('Member ID copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    closeMemberIdModal();
    navigate('/login');
  };

  return (
    <Dialog open={showMemberIdModal} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">Registration Successful!</DialogTitle>
          <DialogDescription className="text-center">
            Your account has been created. Please save your Member ID below to login.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4 py-4">
          <p className="text-sm text-muted-foreground">Your Member ID:</p>
          <div className="flex items-center gap-2 rounded-lg bg-accent px-6 py-4">
            <span className="text-2xl font-bold text-accent-foreground tracking-wider">
              {registeredMemberId}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-8 w-8 shrink-0"
            >
              {copied ? (
                <CheckCircle className="h-4 w-4 text-primary" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-destructive font-medium text-center">
            ⚠️ Important: Please write down or copy this Member ID. You will need it to login.
          </p>
        </div>
        
        <DialogFooter className="sm:justify-center">
          <Button onClick={handleClose} className="w-full sm:w-auto">
            I've Saved It - Continue to Login
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MemberIdModal;
