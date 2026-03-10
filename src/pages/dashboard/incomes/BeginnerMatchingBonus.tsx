import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Info, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getBeginnerMatchingHistory, getBeginnerMatchingStatus } from "@/services/userService";

export default function BeginnerMatchingBonus() {
    const [loading, setLoading] = useState(true);
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [statusData, setStatusData] = useState<any>(null);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

    useEffect(() => {
        fetchData(1);
    }, []);

    const fetchData = async (page: number) => {
        setLoading(true);
        try {
            const [statusRes, historyRes] = await Promise.all([
                getBeginnerMatchingStatus().catch(() => null),
                getBeginnerMatchingHistory(page, 10).catch(() => null)
            ]);

            if (statusRes && statusRes.success) {
                setStatusData(statusRes.data);
            }

            if (historyRes && historyRes.success) {
                const historyArray = historyRes.data?.history || historyRes.data?.docs || [];
                setHistoryData(historyArray.map((h: any) => ({
                    ...h,
                    amount: h.netAmount || h.grossAmount || 0
                })));
                if (historyRes.data?.pagination) {
                    setPagination({
                        page: historyRes.data.pagination.currentPage || historyRes.data.pagination.page || page,
                        totalPages: historyRes.data.pagination.totalPages || historyRes.data.pagination.pages || 1
                    });
                }
            }
        } catch (error) {
            console.error("Failed to fetch Beginner Matching Bonus data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && historyData.length === 0 && !statusData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Beginner Matching Bonus</h1>
                    <p className="text-muted-foreground mt-1">
                        Track your 18% BV Capping Pool earnings and history month-by-month
                    </p>
                </div>
            </div>

            {statusData && (
                <div className="space-y-6">
                    {/* Global Pool Metic Cards */}
                    <div>
                        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Current Month Company Pool (Live)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="glass premium-shadow">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Company BV</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{statusData.summary?.totalCompanyBV?.toLocaleString() || 0}</div>
                                </CardContent>
                            </Card>
                            <Card className="glass premium-shadow">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Global Units</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{statusData.summary?.totalUnits?.toLocaleString() || 0}</div>
                                    <p className="text-xs text-muted-foreground mt-1">1 Unit = 1000 matched BV</p>
                                </CardContent>
                            </Card>
                            <Card className="glass premium-shadow border-primary/20 bg-primary/5">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-primary">Current Point Value</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-primary flex items-center">
                                        ₹{statusData.summary?.pointValue?.toFixed(2) || '0.00'}
                                    </div>
                                    <p className="text-xs text-primary/80 mt-1">Per matched unit</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* User Tracking Cards */}
                    <div>
                        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <Info className="h-5 w-5 text-green-500" />
                            Your Live Qualification Status
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="glass premium-shadow">
                                <CardContent className="pt-6">
                                    <p className="text-sm text-muted-foreground mb-1">Left Leg BV</p>
                                    <div className="text-xl font-bold">{(statusData.userTracker?.stats?.left ?? 0).toLocaleString()} BV</div>
                                </CardContent>
                            </Card>
                            <Card className="glass premium-shadow">
                                <CardContent className="pt-6">
                                    <p className="text-sm text-muted-foreground mb-1">Right Leg BV</p>
                                    <div className="text-xl font-bold">{(statusData.userTracker?.stats?.right ?? 0).toLocaleString()} BV</div>
                                </CardContent>
                            </Card>
                            <Card className="glass premium-shadow">
                                <CardContent className="pt-6">
                                    <p className="text-sm text-muted-foreground mb-1">Personal BV (added to weaker leg)</p>
                                    <div className="text-xl font-bold text-blue-500">+{(statusData.userTracker?.stats?.personal ?? 0).toLocaleString()} BV</div>
                                </CardContent>
                            </Card>
                            <Card className="glass premium-shadow border-green-500/20 bg-green-500/5">
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-medium text-green-600 mb-1">Estimated Payout</p>
                                            <div className="text-2xl font-bold text-green-600">
                                                ₹{statusData.userTracker?.estimatedPayout?.toLocaleString('en-IN') || 0}
                                            </div>
                                        </div>
                                        <Badge variant={statusData.userTracker?.capped ? "destructive" : "default"} className="ml-2">
                                            {statusData.userTracker?.units || 0} Units {statusData.userTracker?.capped && '(MAX)'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}

            <Card className="glass premium-shadow overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
                    <CardTitle>Bonus Payout History</CardTitle>
                    <CardDescription>Records of your distributed units and matched bonus payouts.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto min-h-[300px]">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="w-[150px]">Date Distributed</TableHead>
                                    <TableHead>Payout Type</TableHead>
                                    <TableHead className="text-right">Gross Amount</TableHead>
                                    <TableHead className="text-right text-orange-500">Admin 5% + TDS 2%</TableHead>
                                    <TableHead className="text-right text-green-600">Net Credited (₹)</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {historyData.length > 0 ? (
                                    historyData.map((record) => (
                                        <TableRow key={record._id} className="hover:bg-accent/40 transition-colors">
                                            <TableCell className="font-medium whitespace-nowrap">
                                                {record.createdAt ? format(new Date(record.createdAt), 'dd MMM yyyy, hh:mm a') : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 capitalize">
                                                    {(record.payoutType || 'beginner bonus').replace(/-/g, ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                ₹{(record.grossAmount || record.amount || 0).toLocaleString('en-IN')}
                                            </TableCell>
                                            <TableCell className="text-right text-orange-500 text-sm">
                                                -₹{((record.adminCharge || 0) + (record.tdsDeducted || 0)).toLocaleString('en-IN')}
                                                <div className="text-xs text-muted-foreground">
                                                    Admin: ₹{(record.adminCharge || 0).toLocaleString('en-IN')} | TDS: ₹{(record.tdsDeducted || 0).toLocaleString('en-IN')}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right text-green-600 font-bold">
                                                +₹{(record.amount || record.netAmount || 0).toLocaleString('en-IN')}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={record.status === 'paid' ? 'default' : 'secondary'} className={record.status === 'paid' ? 'bg-green-500 hover:bg-green-600' : ''}>
                                                    {record.status ? record.status.toUpperCase() : 'PENDING'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                            No beginner matching bonus history found. Ensure you are buying personal product PV and matching leg pairs correctly.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t">
                            <div className="text-sm text-muted-foreground">
                                Page {pagination.page} of {pagination.totalPages}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.page <= 1}
                                    onClick={() => fetchData(pagination.page - 1)}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.page >= pagination.totalPages}
                                    onClick={() => fetchData(pagination.page + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
