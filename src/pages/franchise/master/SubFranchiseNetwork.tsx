import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Network, Search, AlertCircle, ShieldCheck, ArrowLeft, Store } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { useFranchiseAuthStore } from "@/stores/useFranchiseAuthStore";
import api from "@/lib/api";

interface SubFranchise {
    _id: string;
    name: string;
    shopName: string;
    vendorId: string;
    city: string;
    phone: string;
    status: string;
}

const SubFranchiseNetwork = () => {
    const [subFranchises, setSubFranchises] = useState<SubFranchise[]>([]);
    const [isMaster, setIsMaster] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const { franchise, franchiseToken, isAuthenticated } = useFranchiseAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) navigate('/franchise/login');
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        const fetchNetwork = async () => {
            if (!franchiseToken) return;
            try {
                const res = await api.get('/api/v1/franchise/master-portal/network', {
                    headers: { Authorization: `Bearer ${franchiseToken}` }
                });
                setIsMaster(res.data?.data?.isMaster);
                if (res.data?.data?.isMaster) {
                    setSubFranchises(res.data?.data?.subFranchises || []);
                }
            } catch (error) {
                console.error("Failed to fetch sub-network:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNetwork();
    }, []);

    if (isLoading || !franchise) {
        return <div className="text-center py-10">Loading your network...</div>;
    }

    const HeaderLayout = () => (
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/franchise/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
                    </Button>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Store className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="font-semibold">{franchise.shopName}</p>
                        <p className="text-xs text-muted-foreground">{franchise.vendorId}</p>
                    </div>
                </div>
            </div>
        </header>
    );

    if (isMaster === false) {
        return (
            <div className="min-h-screen bg-background">
                <HeaderLayout />
                <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
                    <Card className="max-w-md w-full glass border-dashed shadow-none bg-muted/20">
                        <CardContent className="pt-8 text-center flex flex-col items-center">
                            <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="h-8 w-8" />
                            </div>
                            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
                            <p className="text-muted-foreground text-sm">
                                Your account does not have Master Franchise privileges. To become a Master Franchise and build a sub-network, please contact the Administration.
                            </p>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    const filteredNetwork = subFranchises.filter(sub => 
        sub.shopName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        sub.vendorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background">
            <HeaderLayout />
            <main className="container mx-auto px-4 py-8">
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Network className="h-6 w-6 text-teal-600" />
                        My Sub-Network
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        View and manage the subordinate franchises assigned under your Master ID.
                    </p>
                </div>
            </div>

            <Card className="glass premium-shadow">
                <CardHeader className="pb-3 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <ShieldCheck className="h-5 w-5 text-teal-500" />
                        Network Members ({subFranchises.length})
                    </CardTitle>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search network..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-background/50"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {subFranchises.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            You have not been assigned any sub-franchises yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                            {filteredNetwork.map((sub) => (
                                <div key={sub._id} className="bg-background rounded-lg border p-4 shadow-sm hover:shadow-md hover:border-teal-500/30 transition-all flex flex-col justify-between h-full">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-foreground truncate" title={sub.shopName}>
                                                {sub.shopName}
                                            </h3>
                                            <Badge variant={sub.status === 'active' ? "default" : "secondary"}>
                                                {sub.status || 'Active'}
                                            </Badge>
                                        </div>
                                        <div className="text-xs space-y-1.5 text-muted-foreground mt-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">{sub.vendorId}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span>Location:</span>
                                                <span className="text-foreground">{sub.city}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span>Owner:</span>
                                                <span className="text-foreground">{sub.name}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span>Contact:</span>
                                                <span className="text-foreground">{sub.phone}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredNetwork.length === 0 && (
                                <div className="col-span-full text-center py-8 text-muted-foreground">
                                    No franchises match your search.
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
            </div>
            </main>
        </div>
    );
};

export default SubFranchiseNetwork;
