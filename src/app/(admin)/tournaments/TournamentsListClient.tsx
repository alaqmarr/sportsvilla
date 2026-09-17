'use client';

import React, { useState } from 'react';
import { formatIST } from '@/lib/dateUtils';
import { useRouter } from 'next/navigation';
import { deleteTournament } from './actions';
import { FiCalendar, FiMapPin, FiUsers, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { useAlert } from '@/components/AlertProvider';
import {
  Card,
  Button,
  Badge,
  PageHeader,
  EmptyState,
} from '@/components/admin/ui';

export default function TournamentsListClient({ initialTournaments }: any) {
  const [tournaments, setTournaments] = useState(initialTournaments);
  const router = useRouter();
  const { showAlert, showConfirm } = useAlert();

  const handleDelete = async (id: string) => {
    showConfirm(
      "Confirm Deletion",
      "Are you sure you want to delete this tournament? This will also delete all registrations and cannot be undone.",
      async () => {
        const res = await deleteTournament(id);
        if (res.error) showAlert("Error", res.error, "error");
        else {
          showAlert("Success", "Tournament deleted", "success");
          setTournaments(tournaments.filter((t: any) => t.id !== id));
        }
      },
      undefined,
      "Delete",
      "Cancel",
      "error"
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Tournaments"
        subtitle="Organize and monitor tournaments, registrations, and prize pools."
        actions={
          <Button
            onClick={() => router.push('/tournaments/new')}
            leftIcon={<FiPlus />}
          >
            Create Tournament
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((t: any) => (
          <Card key={t.id} variant="default" padding="none" hoverEffect className="overflow-hidden flex flex-col justify-between">
            <div>
              <div className="h-40 bg-sv-bg relative overflow-hidden">
                {t.thumbnail ? (
                  <img src={t.thumbnail} alt={t.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-sv-bg">
                    <span className="text-sv-text-muted font-medium opacity-50">No Image</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  <Badge variant={t.isPublic ? 'success' : 'neutral'} size="sm">
                    {t.isPublic ? 'Public' : 'Private'}
                  </Badge>
                  <Badge variant={t.status === 'UPCOMING' ? 'info' : 'neutral'} size="sm">
                    {t.status}
                  </Badge>
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="text-lg font-bold text-sv-text mb-1">{t.name}</h3>
                <p className="text-sm text-sv-text-muted mb-4 line-clamp-2">{t.description || 'No description'}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-sv-text-secondary">
                    <FiCalendar className="mr-2 text-sv-text-muted" /> 
                    {formatIST(new Date(t.startDate), 'dd MMM yyyy')}
                  </div>
                  <div className="flex items-center text-sm text-sv-text-secondary">
                    <FiMapPin className="mr-2 text-sv-text-muted" /> 
                    {t.venue || 'TBD'}
                  </div>
                  <div className="flex items-center justify-between text-sm text-sv-text-secondary">
                    <div className="flex items-center">
                      <FiUsers className="mr-2 text-sv-text-muted" /> 
                      {t._count?.registrations || 0} {t.maxTeams ? `/ ${t.maxTeams}` : ''} Registered
                    </div>
                    <div className="font-bold text-sv-brand">
                      ₹{t.participationFee}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0">
              <div className="flex gap-2 pt-4 border-t border-sv-border-subtle">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/tournaments/${t.id}`)}
                  leftIcon={<FiEdit2 size={14} />}
                  className="flex-1"
                >
                  View & Edit
                </Button>
                <Button
                  variant="danger"
                  size="icon"
                  onClick={() => handleDelete(t.id)}
                  title="Delete"
                >
                  <FiTrash2 size={14} />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {tournaments.length === 0 && (
          <div className="col-span-full">
            <EmptyState
              title="No tournaments found"
              description="Create your first tournament to start accepting registrations and managing teams."
              action={
                <Button
                  onClick={() => router.push('/tournaments/new')}
                  leftIcon={<FiPlus />}
                >
                  Create Tournament
                </Button>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
