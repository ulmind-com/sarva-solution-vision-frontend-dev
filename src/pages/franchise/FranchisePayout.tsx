import { useState, useEffect } from "react";
import { format } from "date-fns";
import { TrendingUp, IndianRupee, CheckCircle2, Clock, RefreshCw, Wallet, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getFranchisePayoutHistory, getFranchiseLiveBV } from "@/services/franchiseService";

export default function FranchisePayout() {
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [loadingLive, setLoadingLive] = useState(true);
    const [history, setHistory] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [liveData, setLiveData] = useState<any>(null);

    useEffect(() => {
        fetchHistory();
        fetchLive();
    }, []);

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const res = await getFranchisePayoutHistory();
            // res = { statusCode, data: { payouts: [], pagination: { total, page, limit, pages } }, message, success }
            const payouts = res.data?.payouts || [];
            const pag = res.data?.pagination;
            setHistory(payouts);
            if (pag) {
                setPagination({
                    page: pag.page || 1,
                    totalPages: pag.pages || 1
                });
            }
        } catch (error) {
            console.error("Failed to fetch payout history:", error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const fetchLive = async () => {
        setLoadingLive(true);
        try {
            const res = await getFranchiseLiveBV();
            // res = { statusCode, data: { currentMonthBv, lifetimeBv, liveEstimates: { estimatedGrossPayout, estimatedAdminCharge, estimatedTdsCharge, estimatedNetPayout, payoutCycle } }, message, success }
            setLiveData(res.data);
        } catch (error) {
            console.error("Failed to fetch live BV:", error);
        } finally {
            setLoadingLive(false);
        }
    };

    // Exact field names from API response
    const currentMonthBv = liveData?.currentMonthBv || 0;
    const lifetimeBv = liveData?.lifetimeBv || 0;
    const estimates = liveData?.liveEstimates || {};
    const estimatedGross = estimates.estimatedGrossPayout || 0;
    const estimatedAdminCharge = estimates.estimatedAdminCharge || 0;
    const estimatedTds = estimates.estimatedTdsCharge || 0;
    const estimatedNet = estimates.estimatedNetPayout || 0;
    const payoutCycle = estimates.payoutCycle || "Month-End";

    return (
        <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-teal-950 dark:text-teal-50">Repurchase Payouts</h1>
                    <p className="text-muted-foreground mt-1">
                        Your monthly <strong>10% Repurchase BV</strong> earnings — paid at <strong>{payoutCycle}</strong>.
                    </p>
                </div>
                <Badge variant="outline" className="text-sm border-teal-500/30 text-teal-600 bg-teal-500/10 px-3 py-1.5 self-start shadow-sm mix-blend-multiply dark:mix-blend-normal">
                    <IndianRupee className="h-3.5 w-3.5 mr-1" /> 10% of Monthly BV
                </Badge>
            </div>

            {/* Live BV Metric Cards */}
            <div>
                <h2 className="text-base font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-teal-500" /> Live This Month
                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={fetchLive}>
                        <RefreshCw className={`h-3.5 w-3.5 ${loadingLive ? 'animate-spin text-teal-500' : 'text-muted-foreground'}`} />
                    </Button>
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {/* Current Month BV */}
                    <Card className="glass premium-shadow border-teal-500/20">
                        <CardHeader className="pb-1 pt-4 px-4">
                            <CardTitle className="text-xs font-medium text-muted-foreground">This Month BV</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            {loadingLive ? <div className="animate-pulse h-7 w-16 bg-muted rounded" /> : (
                                <div className="text-2xl font-bold">{currentMonthBv.toLocaleString()}</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Lifetime BV */}
                    <Card className="glass premium-shadow border-teal-500/10">
                        <CardHeader className="pb-1 pt-4 px-4">
                            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                <BarChart3 className="h-3 w-3" /> Lifetime BV
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            {loadingLive ? <div className="animate-pulse h-7 w-16 bg-muted rounded" /> : (
                                <div className="text-2xl font-bold text-slate-600 dark:text-slate-300">{lifetimeBv.toLocaleString()}</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Gross Payout */}
                    <Card className="glass premium-shadow border-teal-500/30 bg-gradient-to-br from-teal-500/5 to-teal-500/10">
                        <CardHeader className="pb-1 pt-4 px-4">
                            <CardTitle className="text-xs font-medium text-teal-700 dark:text-teal-400">Est. Gross</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            {loadingLive ? <div className="animate-pulse h-7 w-16 bg-muted rounded" /> : (
                                <div className="text-2xl font-bold text-teal-600">₹{estimatedGross.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Admin Charge */}
                    <Card className="glass premium-shadow border-orange-400/20">
                        <CardHeader className="pb-1 pt-4 px-4">
                            <CardTitle className="text-xs font-medium text-orange-600">Admin Charge</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            {loadingLive ? <div className="animate-pulse h-7 w-16 bg-muted rounded" /> : (
                                <div className="text-2xl font-bold text-orange-500">-₹{estimatedAdminCharge.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* TDS */}
                    <Card className="glass premium-shadow border-orange-400/20">
                        <CardHeader className="pb-1 pt-4 px-4">
                            <CardTitle className="text-xs font-medium text-orange-500">TDS</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            {loadingLive ? <div className="animate-pulse h-7 w-16 bg-muted rounded" /> : (
                                <div className="text-2xl font-bold text-orange-400">-₹{estimatedTds.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Net Payout */}
                    <Card className="glass premium-shadow border-green-500/30 bg-green-500/10">
                        <CardHeader className="pb-1 pt-4 px-4">
                            <CardTitle className="text-xs font-bold text-green-700 flex items-center gap-1">
                                <Wallet className="h-3 w-3" /> Est. Net
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            {loadingLive ? <div className="animate-pulse h-7 w-16 bg-muted rounded" /> : (
                                <div className="text-2xl font-black text-green-600">₹{estimatedNet.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Payout History Table */}
            <Card className="glass premium-shadow overflow-hidden border-teal-500/10">
                <CardHeader className="border-b border-border/50 bg-teal-50/50 dark:bg-teal-950/20 pb-4 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-teal-900 dark:text-teal-100">Payout History</CardTitle>
                        <CardDescription>All monthly repurchase payouts generated for your franchise.</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => { fetchHistory(); fetchLive(); }}>
                        <RefreshCw className={`h-4 w-4 ${loadingHistory ? 'animate-spin text-teal-600' : 'text-teal-600'}`} />
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto min-h-[300px]">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30 hover:bg-muted/30">
                                    <TableHead>Month</TableHead>
                                    <TableHead className="text-right">Total BV</TableHead>
                                    <TableHead className="text-right text-teal-600">Gross Payout</TableHead>
                                    <TableHead className="text-right text-orange-500">Deductions</TableHead>
                                    <TableHead className="text-right text-green-600">Net Payout</TableHead>
                                    <TableHead>Transaction Ref</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Paid At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingHistory ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-32 text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
                                        </TableCell>
                                    </TableRow>
                                ) : history.length > 0 ? (
                                    history.map((p, i) => (
                                        <TableRow key={i} className="hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-colors">
                                            <TableCell className="font-medium whitespace-nowrap">
                                                {p.month ? format(new Date(p.month), 'MMMM yyyy') : (p.year && p.monthNum ? `${p.monthNum}/${p.year}` : '—')}
                                            </TableCell>
                                            <TableCell className="text-right">{(p.totalBV || p.totalBv || 0).toLocaleString()}</TableCell>
                                            <TableCell className="text-right font-medium text-teal-600">
                                                ₹{(p.grossPayout || p.payoutAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell className="text-right text-orange-500 text-sm">
                                                -₹{((p.adminCharge || 0) + (p.tdsCharge || p.tds || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-green-600 text-base">
                                                ₹{(p.netPayout || p.netAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{p.transactionRef || '—'}</TableCell>
                                            <TableCell>
                                                <Badge className={p.status === 'paid' ? 'bg-green-500 text-white' : 'bg-orange-400 text-white'}>
                                                    {p.status === 'paid' ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                                                    {p.status?.toUpperCase() || 'PENDING'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {p.paidAt ? format(new Date(p.paidAt), 'dd MMM yyyy') : '—'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                                            No payout history yet. Your first payout will appear after month-end.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t bg-teal-50/30 dark:bg-teal-950/10">
                            <div className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => fetchHistory()}>Previous</Button>
                                <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchHistory()}>Next</Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
