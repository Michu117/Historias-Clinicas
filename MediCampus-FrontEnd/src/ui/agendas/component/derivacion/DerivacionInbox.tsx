import { type FC } from 'react';
import { Derivacion } from '../../types';
import { DerivacionCard } from './DerivacionCard';
import { messages } from '../../utils/constants/messages';

interface DerivacionInboxProps {
  derivaciones: Derivacion[];
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
}

export const DerivacionInbox: FC<DerivacionInboxProps> = ({ derivaciones, onAccept, onReject }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{messages.derivacion.inboxTitle}</h2>

      {derivaciones.length === 0 ? (
        <p className="text-gray-500 text-center py-8">{messages.derivacion.noPendientes}</p>
      ) : (
        <div className="space-y-3">
          {derivaciones.map((derivacion) => (
            <DerivacionCard
              key={derivacion.id}
              derivacion={derivacion}
              onAceptar={onAccept}
              onRechazar={onReject}
            />
          ))}
        </div>
      )}
    </div>
  );
};
