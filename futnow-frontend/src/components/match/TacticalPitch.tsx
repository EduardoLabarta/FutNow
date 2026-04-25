import type { MatchParticipant } from '../../types/match';
import { supabase } from '../../lib/supabase';

interface TacticalPitchProps {
  pitchType: string;
  participants: MatchParticipant[];
}

type SlotConfig = { id: number; top: string; left: string; label: string };

const FUTSAL_HOME: SlotConfig[] = [
  { id: 1, top: '50%', left: '10%', label: 'PT' },
  { id: 2, top: '25%', left: '25%', label: 'DF' },
  { id: 3, top: '75%', left: '25%', label: 'DF' },
  { id: 4, top: '50%', left: '38%', label: 'MC' },
  { id: 5, top: '50%', left: '46%', label: 'DL' },
];

const FUTSAL_AWAY: SlotConfig[] = [
  { id: 1, top: '50%', left: '90%', label: 'PT' },
  { id: 2, top: '25%', left: '75%', label: 'DF' },
  { id: 3, top: '75%', left: '75%', label: 'DF' },
  { id: 4, top: '50%', left: '62%', label: 'MC' },
  { id: 5, top: '50%', left: '54%', label: 'DL' },
];

const F7_HOME: SlotConfig[] = [
  { id: 1, top: '50%', left: '8%', label: 'PT' },
  { id: 2, top: '20%', left: '20%', label: 'DF' },
  { id: 3, top: '50%', left: '20%', label: 'DF' },
  { id: 4, top: '80%', left: '20%', label: 'DF' },
  { id: 5, top: '35%', left: '35%', label: 'MC' },
  { id: 6, top: '65%', left: '35%', label: 'MC' },
  { id: 7, top: '50%', left: '46%', label: 'DL' },
];

const F7_AWAY: SlotConfig[] = [
  { id: 1, top: '50%', left: '92%', label: 'PT' },
  { id: 2, top: '20%', left: '80%', label: 'DF' },
  { id: 3, top: '50%', left: '80%', label: 'DF' },
  { id: 4, top: '80%', left: '80%', label: 'DF' },
  { id: 5, top: '35%', left: '65%', label: 'MC' },
  { id: 6, top: '65%', left: '65%', label: 'MC' },
  { id: 7, top: '50%', left: '54%', label: 'DL' },
];

const F11_HOME: SlotConfig[] = [
  { id: 1, top: '50%', left: '5%', label: 'PT' },
  { id: 2, top: '15%', left: '15%', label: 'LI' },
  { id: 3, top: '38%', left: '15%', label: 'CT' },
  { id: 4, top: '62%', left: '15%', label: 'CT' },
  { id: 5, top: '85%', left: '15%', label: 'LD' },
  { id: 6, top: '15%', left: '30%', label: 'MI' },
  { id: 7, top: '38%', left: '30%', label: 'MC' },
  { id: 8, top: '62%', left: '30%', label: 'MC' },
  { id: 9, top: '85%', left: '30%', label: 'MD' },
  { id: 10, top: '38%', left: '46%', label: 'DL' },
  { id: 11, top: '62%', left: '46%', label: 'DL' },
];

const F11_AWAY: SlotConfig[] = [
  { id: 1, top: '50%', left: '95%', label: 'PT' },
  { id: 2, top: '15%', left: '85%', label: 'LI' },
  { id: 3, top: '38%', left: '85%', label: 'CT' },
  { id: 4, top: '62%', left: '85%', label: 'CT' },
  { id: 5, top: '85%', left: '85%', label: 'LD' },
  { id: 6, top: '15%', left: '70%', label: 'MI' },
  { id: 7, top: '38%', left: '70%', label: 'MC' },
  { id: 8, top: '62%', left: '70%', label: 'MC' },
  { id: 9, top: '85%', left: '70%', label: 'MD' },
  { id: 10, top: '38%', left: '54%', label: 'DL' },
  { id: 11, top: '62%', left: '54%', label: 'DL' },
];

const FORMATIONS: Record<string, { home: SlotConfig[], away: SlotConfig[] }> = {
  'FUTSAL': { home: FUTSAL_HOME, away: FUTSAL_AWAY },
  'FOOTBALL_7': { home: F7_HOME, away: F7_AWAY },
  'FOOTBALL_11': { home: F11_HOME, away: F11_AWAY },
};

export default function TacticalPitch({ pitchType, participants }: TacticalPitchProps) {
  // Fallback to F11 if unknown
  const formation = FORMATIONS[pitchType] || FORMATIONS['FOOTBALL_11'];

  const getPlayerForSlot = (side: 'HOME' | 'AWAY', slotId: number) => {
    return participants.find(p => p.team_side === side && p.pitch_slot === slotId);
  };

  const renderSlot = (slot: SlotConfig, side: 'HOME' | 'AWAY') => {
    const player = getPlayerForSlot(side, slot.id);
    const isEmpty = !player;

    return (
      <div 
        key={`${side}-${slot.id}`}
        style={{
          position: 'absolute',
          top: slot.top,
          left: slot.left,
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '50px',
          zIndex: 10
        }}
      >
        <div 
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: isEmpty ? 'rgba(255,255,255,0.2)' : 'var(--primary-light)',
            border: isEmpty ? '2px dashed rgba(255,255,255,0.5)' : '2px solid var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: isEmpty ? 'none' : '0 2px 8px rgba(0,0,0,0.5)'
          }}
        >
          {player?.profiles?.avatar_path ? (
            <img 
              src={supabase.storage.from('avatars').getPublicUrl(player.profiles.avatar_path).data.publicUrl}
              alt="Avatar"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : player ? (
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--primary)' }}>
              {player.profiles?.name.charAt(0).toUpperCase() || '?'}
            </span>
          ) : (
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>{slot.label}</span>
          )}
        </div>
        
        {player && (
          <div style={{
            marginTop: '4px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            fontSize: '10px',
            padding: '2px 6px',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
            maxWidth: '60px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textAlign: 'center'
          }}>
            {player.profiles?.name.split(' ')[0]}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      width: '100%',
      backgroundColor: '#2e7d32', // Césped oscuro
      borderRadius: '8px',
      position: 'relative',
      aspectRatio: '16/9',
      border: '4px solid white',
      boxSizing: 'border-box',
      overflow: 'hidden',
      marginTop: '16px'
    }}>
      {/* Patrón de césped (opcional, bandas claras y oscuras) */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'repeating-linear-gradient(90deg, transparent, transparent 10%, rgba(255,255,255,0.03) 10%, rgba(255,255,255,0.03) 20%)',
        pointerEvents: 'none'
      }}></div>

      {/* Línea Central */}
      <div style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: '50%',
        width: '2px',
        backgroundColor: 'white',
        transform: 'translateX(-50%)'
      }}></div>

      {/* Círculo Central */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '20%',
        aspectRatio: '1/1',
        border: '2px solid white',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)'
      }}></div>
      
      {/* Punto Central */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '6px',
        height: '6px',
        backgroundColor: 'white',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)'
      }}></div>

      {/* Área Local */}
      <div style={{
        position: 'absolute',
        top: '25%',
        left: 0,
        width: '15%',
        height: '50%',
        border: '2px solid white',
        borderLeft: 'none'
      }}></div>

      {/* Área Visitante */}
      <div style={{
        position: 'absolute',
        top: '25%',
        right: 0,
        width: '15%',
        height: '50%',
        border: '2px solid white',
        borderRight: 'none'
      }}></div>

      {/* Slots Local */}
      {formation.home.map(slot => renderSlot(slot, 'HOME'))}

      {/* Slots Visitante */}
      {formation.away.map(slot => renderSlot(slot, 'AWAY'))}

    </div>
  );
}
