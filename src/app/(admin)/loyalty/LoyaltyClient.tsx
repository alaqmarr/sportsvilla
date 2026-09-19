"use client";
import { FiAward, FiStar, FiTrendingUp } from "react-icons/fi";
import { formatIST } from "@/core/utils/dateUtils";
import { PageHeader, DataTable, ColumnDef, Avatar } from "@/components/admin/ui";

interface LeaderboardMember {
  id: string;
  name: string;
  mobile: string;
  loyaltyPoints: number;
  joinDate: string | Date;
}

export default function LoyaltyClient({ initialMembers }: { initialMembers: LeaderboardMember[] }) {
  const columns: ColumnDef<LeaderboardMember>[] = [
    {
      key: "rank",
      header: "Rank",
      align: "center",
      width: "80px",
      render: (_, index) => {
        const rank = index + 1;
        let rankStyle = "text-sv-text-muted bg-sv-surface-raised border border-[#2a2d3e] border-sv-border border-[#2a2d3e]";
        let icon = null;

        if (rank === 1) {
          rankStyle = "text-amber-400 bg-amber-400/10 border border-[#2a2d3e] border-amber-400/30";
          icon = <FiAward size={16} />;
        } else if (rank === 2) {
          rankStyle = "text-slate-300 bg-slate-400/10 border border-[#2a2d3e] border-slate-400/30";
          icon = <FiAward size={16} />;
        } else if (rank === 3) {
          rankStyle = "text-amber-600 bg-amber-600/10 border border-[#2a2d3e] border-amber-600/30";
          icon = <FiAward size={16} />;
        }

        return (
          <div className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${rankStyle}`}>
            {icon || rank}
          </div>
        );
      },
    },
    {
      key: "member",
      header: "Member",
      render: (member) => (
        <div className="flex items-center gap-3.5">
          <Avatar name={member.name || "Member"} size="md" />
          <div>
            <div className="font-semibold text-sv-text">{member.name}</div>
            <div className="text-sv-text-muted text-xs mt-0.5">
              Joined {formatIST(new Date(member.joinDate), 'MMM yyyy')}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "mobile",
      header: "Mobile",
      render: (member) => (
        <span className="text-sv-text-secondary text-sm font-mono bg-sv-bg px-2.5 py-1 rounded-sv-sm border border-[#2a2d3e] border-sv-border border-[#2a2d3e] inline-block">
          {member.mobile}
        </span>
      ),
    },
    {
      key: "points",
      header: "Points",
      align: "right",
      render: (member) => (
        <div className="flex items-center justify-end gap-1.5">
          <span className="text-lg font-bold text-sv-brand">
            {member.loyaltyPoints}
          </span>
          <FiStar className="text-sv-brand opacity-70" />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-20 font-sans">
      <PageHeader
        title="Loyalty Leaderboard"
        subtitle="Top members ranked by loyalty points earned through check-ins and bookings."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Loyalty" },
        ]}
      />

      <DataTable<LeaderboardMember>
        columns={columns}
        data={initialMembers}
        keyExtractor={(m) => m.id}
        emptyTitle="No members found"
        emptyMessage="No members have earned loyalty points yet. Points are earned through bookings and check-ins."
        emptyIcon={<FiTrendingUp className="text-4xl text-sv-text-muted" />}
      />
    </div>
  );
}
