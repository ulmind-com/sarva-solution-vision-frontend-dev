import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Copy, Plus, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { getBeginnerBonusPreview, distributeBeginnerBonus } from "@/services/adminService";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminBeginnerBonus() {
    const [loading, setLoading] = useState(true);
    const [triggering, setTriggering] = useState(false);

    // Default to previous month
    const today = new Date();
    // Default to current month so admin sees live data matching the user tracker
    const [selectedMonth, setSelectedMonth] = useState<string>((today.getMonth() + 1).toString());
    const [selectedYear, setSelectedYear] = useState<string>(today.getFullYear().toString());

    const [previewData, setPreviewData] = useState<any>(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchPreview();
    }, [selectedMonth, selectedYear]);

    const fetchPreview = async () => {
        setLoading(true);
        try {
            const res = await getBeginnerBonusPreview(parseInt(selectedMonth), parseInt(selectedYear));
            if (res.success) {
                setPreviewData(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch Beginner Bonus Preview:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDistribute = async () => {
        setTriggering(true);
        try {
            const res = await distributeBeginnerBonus(parseInt(selectedMonth), parseInt(selectedYear));
            if (res.success) {
                toast({
                    title: "Distribution Successful",
                    description: res.message || "Beginner Matching Bonus has been distributed.",
                    variant: "default",
                });
                fetchPreview(); // Refresh data to show it's processed
            } else {
                toast({
                    title: "Distribution Failed",
                    description: res.message || "Failed to trigger distribution.",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            toast({
                title: "Distribution Error",
                description: error.response?.data?.message || "An unexpected error occurred during distribution.",
                variant: "destructive",
            });
        } finally {
            setTriggering(false);
        }
    };

    const isProcessed = previewData?.isProcessed;
    const qualifiers = previewData?.qualifiers || [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-lg glass premium-shadow border-primary/10">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Beginner Matching Bonus</h1>
                    <p className="text-muted-foreground mt-1">
                        Preview and distribute monthly matching units with 18% BV Capping Pool
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <SelectItem key={m} value={m.toString()}>
                                    {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {[today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1].map(y => (
                                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button variant="outline" size="icon" onClick={fetchPreview}>
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="glass premium-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Company BV</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-24" /> : (
                            <div className="text-2xl font-bold">{previewData?.totalCompanyBV?.toLocaleString() || 0}</div>
                        )}
                    </CardContent>
                </Card>
                <Card className="glass premium-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">18% Pool Amount</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-24" /> : (
                            <div className="text-2xl font-bold text-primary">₹ {previewData?.poolAmount?.toLocaleString('en-IN') || 0}</div>
                        )}
                    </CardContent>
                </Card>
                <Card className="glass premium-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Units Generated</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-24" /> : (
                            <div className="text-2xl font-bold">{previewData?.totalUnits || 0}</div>
                        )}
                    </CardContent>
                </Card>
                <Card className="glass premium-shadow border-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Value Per Unit (1000 BV)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-24" /> : (
                            <div className="text-2xl font-bold text-green-500">₹ {previewData?.pointValue?.toFixed(2) || 0}</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="glass premium-shadow overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/20 pb-4">
                    <div>
                        <CardTitle>Qualifiers Preview</CardTitle>
                        <CardDescription>
                            Users automatically get their personal purchase BV added to their weaker leg.
                        </CardDescription>
                    </div>
                    <div>
                        {isProcessed ? (
                            <Badge variant="default" className="bg-green-500 px-4 py-1.5 text-sm uppercase">Already Processed</Badge>
                        ) : (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button disabled={triggering || qualifiers.length === 0} className="shadow-glow-primary">
                                        {triggering ? "Processing..." : "Distribute Bonus"}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="glass">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Execute Distribution?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will instantly drop <strong>₹ {previewData?.poolAmount?.toLocaleString()}</strong> among {qualifiers.length} qualifiers for {selectedMonth}/{selectedYear}.
                                            User wallets will be irrevocably credited.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDistribute} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                            Confirm Distribution
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto min-h-[400px]">
                        {loading ? (
                            <div className="flex items-center justify-center p-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead>User / ID</TableHead>
                                        <TableHead>Left BV (Total)</TableHead>
                                        <TableHead>Right BV (Total)</TableHead>
                                        <TableHead>Personal Boost</TableHead>
                                        <TableHead>Adjusted Weaker</TableHead>
                                        <TableHead>Units</TableHead>
                                        <TableHead className="text-right">Est. Payout</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {qualifiers.length > 0 ? (
                                        qualifiers.map((q: any) => {
                                            const rawLeft = q.stats.left || 0;
                                            const rawRight = q.stats.right || 0;
                                            const pBoost = q.stats.personal || 0;
                                            const weakerLegVal = Math.min(q.adjustedLeft, q.adjustedRight);
                                            const payout = (q.units * (previewData?.pointValue || 0)).toFixed(2);

                                            // Identify which side got boosted
                                            const leftBoosted = rawLeft <= rawRight && pBoost > 0;
                                            const rightBoosted = rawRight < rawLeft && pBoost > 0;

                                            return (
                                                <TableRow key={q.userId} className="hover:bg-accent/40 transition-colors">
                                                    <TableCell>
                                                        <div className="font-medium text-foreground">{q.fullName}</div>
                                                        <div className="text-xs text-muted-foreground font-mono">{q.memberId}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {rawLeft.toLocaleString()}
                                                        {leftBoosted && <span className="text-xs text-green-500 ml-1">(+{pBoost.toLocaleString()})</span>}
                                                    </TableCell>
                                                    <TableCell>
                                                        {rawRight.toLocaleString()}
                                                        {rightBoosted && <span className="text-xs text-green-500 ml-1">(+{pBoost.toLocaleString()})</span>}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {pBoost.toLocaleString()} BV
                                                    </TableCell>
                                                    <TableCell className="font-medium text-primary/80">
                                                        {weakerLegVal.toLocaleString()} BV
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={q.units === 10 ? 'border-chart-4 text-chart-4' : 'border-primary text-primary'}>
                                                            {q.units} {q.units === 10 && '(MAX)'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold text-green-600">
                                                        ₹ {Number(payout).toLocaleString('en-IN')}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                                No eligible users found for this month's requirements.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
