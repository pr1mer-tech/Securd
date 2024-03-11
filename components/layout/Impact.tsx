import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { createSelectors } from "@/lib/data/createSelectors";
import { create } from "zustand";

export type ImpactState = {
    open: boolean;
    title?: string;
    action?: () => Promise<void>;
    finalize?: () => void;
}

const useImpactStoreBase = create<ImpactState>((set) => ({
    open: false,
    title: undefined,
    action: undefined,
    finalize: undefined,
}));

export const useImpactStore = createSelectors(useImpactStoreBase);

export default function Impact() {
    const open = useImpactStore.use.open();
    const title = useImpactStore.use.title?.();
    const action = useImpactStore.use.action?.();
    const finalize = useImpactStore.use.finalize?.();
    return (
        <Dialog open={open} onOpenChange={(open) => {
            useImpactStore.setState({ open });
            finalize?.();
        }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <DialogFooter>
                    <Button onClick={() => {
                        useImpactStore.setState({ open: false });
                        finalize?.();
                    }}>Cancel</Button>
                    <Button onClick={async () => {
                        await action?.()
                        useImpactStore.setState({ open: false });
                        finalize?.();
                    }}>Confirm</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}