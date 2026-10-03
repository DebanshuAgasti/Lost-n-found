import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api.js';
import {
  MOCK_USERS,
  MOCK_LOST_ITEMS,
  MOCK_FOUND_ITEMS,
  MOCK_MATCHES,
  MOCK_CLAIMS,
  MOCK_NOTIFICATIONS
} from '../mock-data.js';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => api.currentUser || MOCK_USERS[0]);
  const [lostItems, setLostItems] = useState(MOCK_LOST_ITEMS);
  const [foundItems, setFoundItems] = useState(MOCK_FOUND_ITEMS);
  const [matches, setMatches] = useState(MOCK_MATCHES);
  const [claims, setClaims] = useState(MOCK_CLAIMS);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [isBackendOnline, setIsBackendOnline] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Modals state
  const [isReportLostOpen, setIsReportLostOpen] = useState(false);
  const [isReportFoundOpen, setIsReportFoundOpen] = useState(false);
  const [claimModalData, setClaimModalData] = useState(null);
  const [aiExtractedData, setAiExtractedData] = useState(null);

  // Toast helper
  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Switch persona
  const switchUser = (user) => {
    setCurrentUser(user);
    api.setUser(user);
    showToast(`Switched active persona to ${user.fullName} (${user.role})`, 'info');
  };

  // Open Claim Modal
  const openClaimModal = (foundId, lostId = 1, foundTitle = 'Secured Item', question = 'What is the sticker or distinctive mark?') => {
    setClaimModalData({
      foundId,
      lostId,
      foundTitle,
      question
    });
  };

  const closeClaimModal = () => {
    setClaimModalData(null);
  };

  // Create Lost Item
  const addLostItem = async (itemData) => {
    const created = await api.createLostItem(itemData);
    setLostItems((prev) => [created, ...prev]);
    setIsReportLostOpen(false);
    showToast(`Lost report "${created.title}" successfully published! 🚀`, 'success');
    return created;
  };

  // Create Found Item
  const addFoundItem = async (itemData) => {
    const created = await api.createFoundItem(itemData);
    setFoundItems((prev) => [created, ...prev]);
    setIsReportFoundOpen(false);
    showToast(`Found item "${created.title}" registered in custody! 📦`, 'success');
    return created;
  };

  // Submit Claim
  const submitClaim = async (claimData) => {
    const payload = {
      ...claimData,
      claimantName: currentUser.fullName
    };
    const created = await api.createClaim(payload);
    setClaims((prev) => [created, ...prev]);
    setClaimModalData(null);
    showToast('Ownership claim submitted! AI Verification queued.', 'success');
    return created;
  };

  // Review Claim
  const reviewClaim = async (claimId, status, notes = '') => {
    await api.updateClaimStatus(claimId, status, notes);
    setClaims((prev) =>
      prev.map((c) => (c.id === claimId ? { ...c, status } : c))
    );
    showToast(`Claim #C-${claimId} has been marked ${status}!`, status === 'APPROVED' ? 'success' : 'error');
  };

  // Background health check & item sync
  useEffect(() => {
    let isMounted = true;

    api.checkHealth().then((online) => {
      if (isMounted) setIsBackendOnline(online);
    }).catch(() => {
      if (isMounted) setIsBackendOnline(false);
    });

    Promise.all([
      api.getLostItems(),
      api.getFoundItems(),
      api.getMatches(1),
      api.getClaims()
    ]).then(([lost, found, m, c]) => {
      if (!isMounted) return;
      if (lost?.length) setLostItems(lost);
      if (found?.length) setFoundItems(found);
      if (m?.length) setMatches(m);
      if (c?.length) setClaims(c);
    }).catch((err) => {
      console.warn('Seeded data active:', err);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchUser,
        lostItems,
        foundItems,
        matches,
        claims,
        notifications,
        setNotifications,
        isBackendOnline,
        toasts,
        showToast,
        isReportLostOpen,
        setIsReportLostOpen,
        isReportFoundOpen,
        setIsReportFoundOpen,
        claimModalData,
        openClaimModal,
        closeClaimModal,
        aiExtractedData,
        setAiExtractedData,
        addLostItem,
        addFoundItem,
        submitClaim,
        reviewClaim
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
