import { RankProfile } from "@/types/dashboard";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function Leaderboard({ 
    currentUser, 
    topUsers 
}: { 
    currentUser: RankProfile, 
    topUsers: RankProfile[] 
}) {
    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
                <CardTitle>Global Leaderboard</CardTitle>
                <CardDescription>
                    View the top ranking users on the site.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <Rank name={currentUser.name} rank={currentUser.rank} isCurrentUser={true} />
                <Separator className="my-4" />
                <div className="space-y-2">
                    {topUsers.map((user) => (
                        <Rank key={user.name} name={user.name} rank={user.rank} isCurrentUser={false} />
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export function Rank({ 
    name, 
    rank, 
    isCurrentUser = false 
}: {
    name: string,
    rank: number,
    isCurrentUser: boolean
}) {
    function getRankStyle(rank: number) {
        switch (rank) {
            case 1: return "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent font-bold";
            case 2: return "bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 bg-clip-text text-transparent font-semibold";
            case 3: return "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 bg-clip-text text-transparent font-semibold";
            default: return "text-neutral-900";
        }
    };

    function getRankIcon(rank: number) {
        switch (rank) {
            case 1: return "🥇";
            case 2: return "🥈";
            case 3: return "🥉";
            default: return `#${rank}`;
        }
    };

    return (
        <div className={`flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors ${
            isCurrentUser ? 'bg-primary/5 border border-primary/20' : ''
        }`}>
            <div className="flex items-center space-x-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full  ${
                    rank <= 3 ? 'bg-primary/10' : 'bg-muted'
                }`}>
                    <span className={`text-sm ${getRankStyle(rank)}`}>
                        {getRankIcon(rank)}
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                            {name?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <span className={`text-sm font-medium ${getRankStyle(rank)} ${isCurrentUser ? 'text-primary' : ''}`}>
                        {name} {isCurrentUser && <Badge variant="secondary" className="ml-1">You</Badge>}
                    </span>
                </div>
            </div>
        </div>
    );
}