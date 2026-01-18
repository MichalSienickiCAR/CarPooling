import React, { useState } from 'react';
import { reportService, Report } from '../services/api';
import './ReportUser.css';

interface ReportUserProps {
  reportedUserId: number;
  reportedUsername: string;
  tripId?: number;
  onClose: () => void;
  onSuccess?: () => void;
}

const ReportUser: React.FC<ReportUserProps> = ({
  reportedUserId,
  reportedUsername,
  tripId,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reasonOptions = [
    { value: 'inappropriate_behavior', label: 'Niewłaściwe zachowanie' },
    { value: 'harassment', label: 'Nękanie' },
    { value: 'no_show', label: 'Nie pojawienie się' },
    { value: 'dangerous_driving', label: 'Niebezpieczna jazda' },
    { value: 'fraud', label: 'Oszustwo' },
    { value: 'other', label: 'Inne' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) {
      setError('Wybierz powód zgłoszenia');
      return;
    }

    if (description.trim().length < 10) {
      setError('Opis musi zawierać co najmniej 10 znaków');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await reportService.createReport(
        reportedUserId,
        reason,
        description.trim(),
        tripId
      );
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Błąd podczas wysyłania zgłoszenia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-user-modal" onClick={onClose}>
      <div className="report-user-content" onClick={(e) => e.stopPropagation()}>
        <div className="report-user-header">
          <h2>Zgłoś użytkownika</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="report-form">
          <div className="form-group">
            <label>Zgłaszany użytkownik:</label>
            <div className="reported-user-info">
              <strong>{reportedUsername}</strong>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reason">Powód zgłoszenia: *</label>
            <select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="form-select"
            >
              <option value="">Wybierz powód...</option>
              {reasonOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Opis sytuacji: *</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="form-textarea"
              rows={6}
              placeholder="Opisz szczegółowo sytuację... (min. 10 znaków)"
              maxLength={1000}
            />
            <div className="char-count">
              {description.length} / 1000
            </div>
          </div>

          <div className="info-box">
            <p>
              <strong>Ważne:</strong> Zgłoszenia są weryfikowane przez administrację.
              Fałszywe zgłoszenia mogą skutkować konsekwencjami dla zgłaszającego.
            </p>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
              disabled={loading}
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Wysyłanie...' : 'Wyślij zgłoszenie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportUser;
