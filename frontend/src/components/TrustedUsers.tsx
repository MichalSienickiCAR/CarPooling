import React, { useState, useEffect } from 'react';
import { trustedUserService, TrustedUser } from '../services/api';
import './TrustedUsers.css';

const TrustedUsers: React.FC = () => {
  const [trustedUsers, setTrustedUsers] = useState<TrustedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrustedUsers();
  }, []);

  const loadTrustedUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await trustedUserService.getMyTrusted();
      setTrustedUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Błąd podczas ładowania zaufanych użytkowników');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTrusted = async (trustedUserId: number) => {
    if (!window.confirm('Czy na pewno chcesz usunąć tego użytkownika z listy zaufanych?')) {
      return;
    }

    try {
      await trustedUserService.removeTrustedUser(trustedUserId);
      loadTrustedUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Błąd podczas usuwania użytkownika');
    }
  };

  const renderUserAvatar = (profile: { avatar?: string | null; username: string }) => {
    if (profile.avatar) {
      return <img src={profile.avatar} alt={profile.username} className="user-avatar" />;
    }
    return <div className="user-avatar-placeholder">{profile.username.charAt(0).toUpperCase()}</div>;
  };

  if (loading) {
    return (
      <div className="trusted-users-container">
        <h1>Zaufani użytkownicy</h1>
        <div className="loading">Ładowanie...</div>
      </div>
    );
  }

  return (
    <div className="trusted-users-container">
      <h1>Zaufani użytkownicy</h1>
      <p className="subtitle">
        Użytkownicy, których oznaczyłeś jako zaufanych po pozytywnych przejazdach
      </p>

      {error && <div className="error-message">{error}</div>}

      {trustedUsers.length === 0 ? (
        <div className="no-data">
          <p>Nie masz jeszcze żadnych zaufanych użytkowników.</p>
          <p>Po pozytywnym przejeździe możesz oznaczyć użytkownika jako zaufanego.</p>
        </div>
      ) : (
        <div className="trusted-users-list">
          {trustedUsers.map((trustedUser) => (
            <div key={trustedUser.id} className="trusted-user-card">
              {renderUserAvatar({
                avatar: trustedUser.trusted_user_profile.avatar,
                username: trustedUser.trusted_user_username,
              })}
              <div className="trusted-user-info">
                <h3>{trustedUser.trusted_user_username}</h3>
                {(trustedUser.trusted_user_profile.first_name ||
                  trustedUser.trusted_user_profile.last_name) && (
                  <p className="user-name">
                    {trustedUser.trusted_user_profile.first_name}{' '}
                    {trustedUser.trusted_user_profile.last_name}
                  </p>
                )}
                {trustedUser.trusted_user_profile.preferred_role && (
                  <p className="user-role">
                    Rola: {trustedUser.trusted_user_profile.preferred_role === 'driver' ? 'Kierowca' : 'Pasażer'}
                  </p>
                )}
                {trustedUser.trip_info && (
                  <p className="trip-info">
                    Dodano po przejeździe: {trustedUser.trip_info.start_location} →{' '}
                    {trustedUser.trip_info.end_location} ({trustedUser.trip_info.date})
                  </p>
                )}
                {trustedUser.note && (
                  <p className="trusted-note">
                    <strong>Notatka:</strong> {trustedUser.note}
                  </p>
                )}
                <p className="added-date">
                  Dodano: {new Date(trustedUser.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="trusted-user-actions">
                <button
                  className="btn-remove"
                  onClick={() => handleRemoveTrusted(trustedUser.id)}
                >
                  Usuń
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="info-section">
        <h3>Jak działa system zaufanych użytkowników?</h3>
        <ul>
          <li>Po zakończonym przejeździe możesz oznaczyć drugą stronę jako "zaufaną"</li>
          <li>Zaufani użytkownicy będą widoczni na Twojej liście z priorytetem</li>
          <li>Możesz dodać notatkę do każdego zaufanego użytkownika</li>
          <li>To pomaga budować sieć sprawdzonych współpodróżnych</li>
        </ul>
      </div>
    </div>
  );
};

export default TrustedUsers;
