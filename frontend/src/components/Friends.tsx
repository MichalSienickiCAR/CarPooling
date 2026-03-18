import React, { useState, useEffect } from 'react';
import { friendshipService, Friendship, UserSearchResult } from '../services/api';
import './Friends.css';

const Friends: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'sent' | 'search'>('friends');
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [sentRequests, setSentRequests] = useState<Friendship[]>([]);
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'friends') {
        const data = await friendshipService.getMyFriends();
        setFriends(data);
      } else if (activeTab === 'requests') {
        const data = await friendshipService.getPendingRequests();
        setPendingRequests(data);
      } else if (activeTab === 'sent') {
        const data = await friendshipService.getSentRequests();
        setSentRequests(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Błąd podczas ładowania danych');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length < 2) {
      setError('Wpisz co najmniej 2 znaki');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const results = await friendshipService.searchUsers(searchQuery);
      setSearchResults(results);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Błąd podczas wyszukiwania');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId: number) => {
    try {
      await friendshipService.sendFriendRequest(userId);
      setSuccessMessage('Zaproszenie wysłane!');
      setTimeout(() => setSuccessMessage(null), 3000);
      // Odśwież wyniki wyszukiwania
      const results = await friendshipService.searchUsers(searchQuery);
      setSearchResults(results);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Błąd podczas wysyłania zaproszenia');
    }
  };

  const handleAcceptRequest = async (friendshipId: number) => {
    try {
      await friendshipService.acceptFriendRequest(friendshipId);
      setSuccessMessage('Zaproszenie zaakceptowane!');
      setTimeout(() => setSuccessMessage(null), 3000);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Błąd podczas akceptowania zaproszenia');
    }
  };

  const handleRejectRequest = async (friendshipId: number) => {
    try {
      await friendshipService.rejectFriendRequest(friendshipId);
      setSuccessMessage('Zaproszenie odrzucone');
      setTimeout(() => setSuccessMessage(null), 3000);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Błąd podczas odrzucania zaproszenia');
    }
  };

  const handleRemoveFriend = async (friendshipId: number) => {
    if (!window.confirm('Czy na pewno chcesz usunąć tego znajomego?')) return;
    try {
      await friendshipService.deleteFriendship(friendshipId);
      setSuccessMessage('Znajomy usunięty');
      setTimeout(() => setSuccessMessage(null), 3000);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Błąd podczas usuwania znajomego');
    }
  };

  const handleBlockUser = async (friendshipId: number) => {
    if (!window.confirm('Czy na pewno chcesz zablokować tego użytkownika?')) return;
    try {
      await friendshipService.blockUser(friendshipId);
      setSuccessMessage('Użytkownik zablokowany');
      setTimeout(() => setSuccessMessage(null), 3000);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Błąd podczas blokowania użytkownika');
    }
  };

  const renderUserAvatar = (profile: { avatar?: string | null; username: string }) => {
    if (profile.avatar) {
      return <img src={profile.avatar} alt={profile.username} className="user-avatar" />;
    }
    return <div className="user-avatar-placeholder">{profile.username.charAt(0).toUpperCase()}</div>;
  };

  const renderFriendsList = () => {
    if (friends.length === 0) {
      return <p className="no-data">Nie masz jeszcze znajomych. Wyszukaj użytkowników i dodaj ich!</p>;
    }

    return (
      <div className="friends-list">
        {friends.map((friendship) => {
          const friend = friendship.requester_username === localStorage.getItem('username')
            ? friendship.receiver_profile
            : friendship.requester_profile;
          const friendUsername = friendship.requester_username === localStorage.getItem('username')
            ? friendship.receiver_username
            : friendship.requester_username;

          return (
            <div key={friendship.id} className="friend-card">
              {renderUserAvatar({ avatar: friend.avatar, username: friendUsername })}
              <div className="friend-info">
                <h3>{friendUsername}</h3>
                {(friend.first_name || friend.last_name) && (
                  <p className="friend-name">
                    {friend.first_name} {friend.last_name}
                  </p>
                )}
                <p className="friend-since">Znajomi od: {new Date(friendship.created_at).toLocaleDateString()}</p>
              </div>
              <div className="friend-actions">
                <button
                  className="btn-remove"
                  onClick={() => handleRemoveFriend(friendship.id)}
                >
                  Usuń
                </button>
                <button
                  className="btn-reject"
                  onClick={() => handleBlockUser(friendship.id)}
                >
                  Zablokuj
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPendingRequests = () => {
    if (pendingRequests.length === 0) {
      return <p className="no-data">Brak oczekujących zaproszeń</p>;
    }

    return (
      <div className="requests-list">
        {pendingRequests.map((request) => {
          const requester = request.requester_profile;
          return (
            <div key={request.id} className="request-card">
              {renderUserAvatar({ avatar: requester.avatar, username: request.requester_username })}
              <div className="request-info">
                <h3>{request.requester_username}</h3>
                {(requester.first_name || requester.last_name) && (
                  <p className="requester-name">
                    {requester.first_name} {requester.last_name}
                  </p>
                )}
                <p className="request-date">Wysłano: {new Date(request.created_at).toLocaleDateString()}</p>
              </div>
              <div className="request-actions">
                <button
                  className="btn-accept"
                  onClick={() => handleAcceptRequest(request.id)}
                >
                  Akceptuj
                </button>
                <button
                  className="btn-reject"
                  onClick={() => handleRejectRequest(request.id)}
                >
                  Odrzuć
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSentRequests = () => {
    if (sentRequests.length === 0) {
      return <p className="no-data">Brak wysłanych zaproszeń</p>;
    }

    return (
      <div className="sent-requests-list">
        {sentRequests.map((request) => {
          const receiver = request.receiver_profile;
          return (
            <div key={request.id} className="sent-request-card">
              {renderUserAvatar({ avatar: receiver.avatar, username: request.receiver_username })}
              <div className="sent-request-info">
                <h3>{request.receiver_username}</h3>
                {(receiver.first_name || receiver.last_name) && (
                  <p className="receiver-name">
                    {receiver.first_name} {receiver.last_name}
                  </p>
                )}
                <p className="sent-date">Wysłano: {new Date(request.created_at).toLocaleDateString()}</p>
                <span className="status-badge pending">Oczekuje</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSearchResults = () => {
    return (
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Wyszukaj użytkownika..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn-search" disabled={loading}>
            Szukaj
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map((user) => (
              <div key={user.id} className="search-result-card">
                {renderUserAvatar({ avatar: user.avatar, username: user.username })}
                <div className="search-result-info">
                  <h3>{user.username}</h3>
                  {(user.first_name || user.last_name) && (
                    <p className="user-fullname">
                      {user.first_name} {user.last_name}
                    </p>
                  )}
                </div>
                <div className="search-result-actions">
                  {!user.friendship_status && (
                    <button
                      className="btn-add-friend"
                      onClick={() => handleSendRequest(user.id)}
                    >
                      Dodaj do znajomych
                    </button>
                  )}
                  {user.friendship_status === 'pending' && (
                    <span className="status-badge pending">Zaproszenie wysłane</span>
                  )}
                  {user.friendship_status === 'accepted' && (
                    <span className="status-badge accepted">Znajomy</span>
                  )}
                  {user.friendship_status === 'rejected' && (
                    <span className="status-badge rejected">Odrzucone</span>
                  )}
                  {user.friendship_status === 'blocked' && (
                    <span className="status-badge blocked">Zablokowany</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {searchQuery && searchResults.length === 0 && !loading && (
          <p className="no-data">Nie znaleziono użytkowników</p>
        )}
      </div>
    );
  };

  return (
    <div className="friends-container">
      <h1>Znajomi</h1>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          Moi znajomi ({friends.length})
        </button>
        <button
          className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Zaproszenia ({pendingRequests.length})
        </button>
        <button
          className={`tab ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          Wysłane ({sentRequests.length})
        </button>
        <button
          className={`tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          Wyszukaj
        </button>
      </div>

      <div className="tab-content">
        {loading && <div className="loading">Ładowanie...</div>}
        {!loading && activeTab === 'friends' && renderFriendsList()}
        {!loading && activeTab === 'requests' && renderPendingRequests()}
        {!loading && activeTab === 'sent' && renderSentRequests()}
        {!loading && activeTab === 'search' && renderSearchResults()}
      </div>
    </div>
  );
};

export default Friends;
